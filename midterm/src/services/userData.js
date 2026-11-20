import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

const LEGACY_BUILD_KEY = 'pc_builder_current_build';
const LEGACY_CUSTOM_ITEMS_KEY = 'pc_builder_custom_components';
const LOCAL_BUILD_PREFIX = 'pc_builder_offline_build';

export const EMPTY_BUILD = {
  CPU: null,
  Motherboard: null,
  Memory: null,
  'Video Card': null,
};

const pendingLoads = new Map();
const pendingBuildSyncs = new Map();

function localBuildKey(uid) {
  return `${LOCAL_BUILD_PREFIX}:${uid || 'guest'}`;
}

export function readLocalBuild(uid) {
  try {
    const saved = localStorage.getItem(localBuildKey(uid));
    if (!saved) return null;

    const record = JSON.parse(saved);
    if (!record || !record.build || typeof record.build !== 'object') return null;

    return {
      build: { ...EMPTY_BUILD, ...record.build },
      pending: record.pending === true,
      revision: Number(record.revision) || 0,
    };
  } catch (error) {
    console.error('Failed to read the locally saved build:', error);
    return null;
  }
}

export function writeLocalBuild(uid, build, pending = false) {
  const previous = readLocalBuild(uid);
  const record = {
    build: { ...EMPTY_BUILD, ...build },
    pending,
    revision: (previous?.revision || 0) + 1,
  };
  localStorage.setItem(localBuildKey(uid), JSON.stringify(record));
  return record;
}

export function syncPendingBuild(uid) {
  if (!uid || !navigator.onLine) return Promise.resolve(false);

  const existingSync = pendingBuildSyncs.get(uid);
  if (existingSync) return existingSync;

  const sync = (async () => {
    let synced = false;
    let record = readLocalBuild(uid);

    while (navigator.onLine && record?.pending) {
      await saveUserBuild(uid, record.build);
      synced = true;

      const latestRecord = readLocalBuild(uid);
      if (latestRecord?.revision === record.revision && latestRecord.pending) {
        writeLocalBuild(uid, latestRecord.build, false);
      }

      record = readLocalBuild(uid);
    }

    return synced;
  })().finally(() => {
    pendingBuildSyncs.delete(uid);
  });

  pendingBuildSyncs.set(uid, sync);
  return sync;
}

function readLegacyValue(key) {
  const saved = localStorage.getItem(key);
  if (!saved) return null;

  try {
    return JSON.parse(saved);
  } catch (error) {
    console.error(`Failed to parse legacy data from ${key}:`, error);
    return null;
  }
}

async function loadAndMigrateUserData(uid) {
  const buildRef = doc(db, 'users', uid, 'private', 'build');
  const customItemsRef = collection(db, 'users', uid, 'customComponents');
  const [buildSnapshot, customItemsSnapshot] = await Promise.all([
    getDoc(buildRef),
    getDocs(customItemsRef),
  ]);
  const batch = writeBatch(db);
  let hasMigrationWrites = false;
  let build = buildSnapshot.exists()
    ? buildSnapshot.data().components || EMPTY_BUILD
    : null;
  let customComponents = customItemsSnapshot.docs.map((item) => item.data());

  if (!buildSnapshot.exists()) {
    const legacyBuild = readLegacyValue(LEGACY_BUILD_KEY);
    build = legacyBuild && typeof legacyBuild === 'object'
      ? { ...EMPTY_BUILD, ...legacyBuild }
      : EMPTY_BUILD;
    batch.set(buildRef, { components: build, updatedAt: serverTimestamp() });
    hasMigrationWrites = true;
  }

  if (customItemsSnapshot.empty) {
    const legacyItems = readLegacyValue(LEGACY_CUSTOM_ITEMS_KEY);
    if (Array.isArray(legacyItems)) {
      customComponents = legacyItems.filter(
        (item) => item && typeof item === 'object' && item.name && item.category,
      );
      customComponents.forEach((item) => {
        const itemRef = doc(customItemsRef);
        batch.set(itemRef, { ...item, id: item.id || itemRef.id });
      });
      hasMigrationWrites = hasMigrationWrites || customComponents.length > 0;
    }
  }

  if (hasMigrationWrites) {
    await batch.commit();
    if (!buildSnapshot.exists()) localStorage.removeItem(LEGACY_BUILD_KEY);
    if (customItemsSnapshot.empty && customComponents.length > 0) {
      localStorage.removeItem(LEGACY_CUSTOM_ITEMS_KEY);
    }
  }

  return { build, customComponents };
}

export function loadUserData(uid) {
  if (!uid) {
    return Promise.resolve({ build: EMPTY_BUILD, customComponents: [] });
  }

  const existingLoad = pendingLoads.get(uid);
  if (existingLoad) return existingLoad;

  const load = loadAndMigrateUserData(uid).finally(() => {
    pendingLoads.delete(uid);
  });
  pendingLoads.set(uid, load);
  return load;
}

export function saveUserBuild(uid, build) {
  if (!uid) return Promise.reject(new Error('You must be signed in to save a build.'));

  return setDoc(doc(db, 'users', uid, 'private', 'build'), {
    components: build,
    updatedAt: serverTimestamp(),
  });
}

export async function addUserCustomComponent(uid, item) {
  if (!uid) throw new Error('You must be signed in to add custom hardware.');

  const itemRef = doc(collection(db, 'users', uid, 'customComponents'));
  const savedItem = { ...item, id: itemRef.id };
  await setDoc(itemRef, { ...savedItem, createdAt: serverTimestamp() });
  return savedItem;
}
