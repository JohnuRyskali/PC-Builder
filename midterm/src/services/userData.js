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

export const EMPTY_BUILD = {
  CPU: null,
  Motherboard: null,
  Memory: null,
  'Video Card': null,
};

const pendingLoads = new Map();

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
