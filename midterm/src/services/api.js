import rawCpus from '../assets/data/cpu.json';
import rawMobos from '../assets/data/motherboard.json';
import rawRams from '../assets/data/memory.json';
import rawGpus from '../assets/data/video-card.json';
import { normalizeCatalog } from './catalogNormalization';
import { invalidateCache } from './cacheService';
import { addUserCustomComponent, loadUserData } from './userData';

const PUBLIC_CATALOG_STORAGE_KEY = 'pc_builder_public_catalog_v1';
const PUBLIC_CATALOG_URL = new URL(
  'api/public/components.json',
  new URL(import.meta.env.BASE_URL, window.location.origin),
);

const normalizeBundledData = () => normalizeCatalog({
  cpus: rawCpus,
  motherboards: rawMobos,
  memory: rawRams,
  videoCards: rawGpus,
});

function isValidCatalog(value) {
  return Array.isArray(value)
    && value.every((item) => item && item.id && item.name && item.category);
}

function readStoredPublicCatalog() {
  try {
    const saved = localStorage.getItem(PUBLIC_CATALOG_STORAGE_KEY);
    if (!saved) return null;

    const parsed = JSON.parse(saved);
    return isValidCatalog(parsed) ? parsed : null;
  } catch (error) {
    console.error('Failed to read the saved public hardware catalog:', error);
    return null;
  }
}

function persistPublicCatalog(catalog) {
  try {
    localStorage.setItem(PUBLIC_CATALOG_STORAGE_KEY, JSON.stringify(catalog));
  } catch (error) {
    console.error('Failed to save the public hardware catalog for offline use:', error);
  }
}

async function fetchPublicCatalog() {
  try {
    const response = await fetch(PUBLIC_CATALOG_URL, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Catalog request failed with status ${response.status}.`);
    }

    const catalog = await response.json();
    if (!isValidCatalog(catalog)) {
      throw new Error('The public hardware catalog response has an invalid format.');
    }

    persistPublicCatalog(catalog);
    return {
      components: catalog,
      isCached: response.headers.get('X-PWA-Cache') === 'HIT',
    };
  } catch (error) {
    if (navigator.onLine) throw error;

    const cachedCatalog = readStoredPublicCatalog() || normalizeBundledData();
    return { components: cachedCatalog, isCached: true };
  }
}

function mergeCatalog(publicComponents, customComponents = []) {
  const uniqueMap = new Map();
  [...publicComponents, ...customComponents].forEach((item) => {
    if (item && item.id && item.category !== 'Storage') {
      uniqueMap.set(String(item.id), item);
    }
  });
  return Array.from(uniqueMap.values());
}

export const CATALOG_QUERY_KEY = 'catalog_hardware_components';

export async function fetchComponents(userId) {
  const { components: publicComponents, isCached } = await fetchPublicCatalog();

  if (!userId || !navigator.onLine) {
    return { components: publicComponents, isCached };
  }

  const { customComponents } = await loadUserData(userId);
  return {
    components: mergeCatalog(publicComponents, customComponents),
    isCached,
  };
}

export async function fetchComponentDetails(id, userId) {
  const detailUrl = new URL(
    `api/public/components/${encodeURIComponent(String(id))}.json`,
    new URL(import.meta.env.BASE_URL, window.location.origin),
  );

  try {
    const response = await fetch(detailUrl, { cache: 'no-store' });
    if (response.ok) {
      return {
        item: await response.json(),
        isCached: response.headers.get('X-PWA-Cache') === 'HIT',
      };
    }
  } catch (error) {
    if (navigator.onLine) throw error;
  }

  const { components, isCached } = await fetchComponents(userId);
  const item = components.find((component) => String(component.id) === String(id));
  return { item: item || null, isCached: isCached || !navigator.onLine };
}

export const addComponentToCatalog = async (newItem, userId) => {
  const itemWithId = await addUserCustomComponent(userId, newItem);
  invalidateCache(`${CATALOG_QUERY_KEY}:${userId}`);
  return itemWithId;
};
