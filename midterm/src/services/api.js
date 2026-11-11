import rawCpus from '../assets/data/cpu.json';
import rawMobos from '../assets/data/motherboard.json';
import rawRams from '../assets/data/memory.json';
import rawGpus from '../assets/data/video-card.json';
import { getCachedData, setCachedData, invalidateCache } from './cacheService';

const STORAGE_KEY = 'pc_compatibility_catalog';
const CUSTOM_ITEMS_STORAGE_KEY = 'pc_builder_custom_components';

// Query Key для кэша каталога
export const CATALOG_QUERY_KEY = 'catalog_hardware_components';

// Вспомогательная функция определения сокета
const parseSocket = (name, rawSocket) => {
  if (rawSocket) return rawSocket;
  const upper = name.toUpperCase();
  if (upper.includes('AM4') || upper.includes('B550') || upper.includes('X570') || upper.includes('B450') || upper.includes('5600') || upper.includes('3600')) return 'AM4';
  if (upper.includes('AM5') || upper.includes('B650') || upper.includes('X670') || upper.includes('7600') || upper.includes('7800X3D')) return 'AM5';
  if (upper.includes('LGA1700') || upper.includes('1700') || upper.includes('Z690') || upper.includes('B660') || upper.includes('12400') || upper.includes('13600')) return 'LGA1700';
  if (upper.includes('LGA1200') || upper.includes('1200') || upper.includes('Z490') || upper.includes('B460')) return 'LGA1200';
  if (upper.includes('LGA1851') || upper.includes('Z890')) return 'LGA1851';
  return 'AM5';
};

// Нормализация базовых данных из JSON
const normalizeData = () => {
  const cpus = rawCpus.slice(0, 30).map((item, index) => ({
    id: `cpu-${index + 1}`,
    name: item.name,
    category: 'CPU',
    brand: item.name.toLowerCase().includes('amd') ? 'AMD' : 'Intel',
    socket: parseSocket(item.name, item.socket),
    tdp: item.tdp || 65,
    core_count: item.core_count || 6,
    core_clock: item.core_clock || 3.5,
    graphics: item.graphics || 'None',
    price: item.price || 250
  }));

  const mobos = rawMobos.slice(0, 30).map((item, index) => {
    const socket = parseSocket(item.name, item.socket);
    const upperName = item.name.toUpperCase();
    let ramType = 'DDR5';
    if (socket === 'AM4' || socket === 'LGA1200' || upperName.includes('DDR4') || upperName.includes('B450') || upperName.includes('B550')) {
      ramType = 'DDR4';
    }
    return {
      id: `mobo-${index + 1}`,
      name: item.name,
      category: 'Motherboard',
      brand: item.name.split(' ')[0],
      socket,
      ram_type: ramType,
      form_factor: item.form_factor || 'ATX',
      price: item.price || 150
    };
  });

  const rams = rawRams.slice(0, 30).map((item, index) => {
    const isDdr5 = (Array.isArray(item.speed) && item.speed[0] === 5) || item.name.toUpperCase().includes('DDR5');
    const speedMHz = Array.isArray(item.speed) ? item.speed[1] : item.speed;
    const modulesText = Array.isArray(item.modules) ? `${item.modules[0]}x${item.modules[1]}GB` : item.modules;
    return {
      id: `ram-${index + 1}`,
      name: item.name,
      category: 'Memory',
      speed: speedMHz ? `${speedMHz} MHz` : '3200 MHz',
      modules: modulesText || '2x16GB',
      ram_type: isDdr5 ? 'DDR5' : 'DDR4',
      price: item.price || 90
    };
  });

  const gpus = rawGpus.slice(0, 30).map((item, index) => {
    const chipset = item.chipset || '';
    const fullName = item.name.toLowerCase().includes(chipset.toLowerCase()) ? item.name : `${chipset} ${item.name}`.trim();
    return {
      id: `gpu-${index + 1}`,
      name: fullName,
      category: 'Video Card',
      chipset: chipset || 'NVIDIA / AMD',
      vram: item.memory || 8,
      tdp: item.tdp || 200,
      price: item.price || 500
    };
  });

  return [...cpus, ...mobos, ...rams, ...gpus];
};

// Чтение данных из хранилища (базовые + кастомные)
const getStoredData = () => {
  let localData = [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    localData = saved ? JSON.parse(saved) : normalizeData();
    if (!saved) localStorage.setItem(STORAGE_KEY, JSON.stringify(localData));
  } catch (e) {
    localData = normalizeData();
  }

  let customItems = [];
  try {
    const savedCustom = localStorage.getItem(CUSTOM_ITEMS_STORAGE_KEY);
    if (savedCustom) customItems = JSON.parse(savedCustom);
  } catch (e) {
    console.error(e);
  }

  const uniqueMap = new Map();
  [...customItems, ...localData].forEach((item) => {
    if (item && item.id && item.category !== 'Storage') {
      uniqueMap.set(item.id, item);
    }
  });

  return Array.from(uniqueMap.values());
};

// Server Data Caching
export const fetchComponents = () => {
  return new Promise((resolve, reject) => {
    // 1. Check if we have cached data for the catalog query
    const cached = getCachedData(CATALOG_QUERY_KEY);
    if (cached) {
      // return cached data immediately if available
      return resolve(cached);
    }

    // 2. If no cached data, simulate a server fetch with a delay and random failure
    setTimeout(() => {
      if (Math.random() < 0.01) {
        reject(new Error('Failed to load hardware catalog. Please refresh.'));
      } else {
        const freshData = getStoredData();
        // Save the fresh data to cache
        setCachedData(CATALOG_QUERY_KEY, freshData);
        resolve(freshData);
      }
    }, 500);
  });
};

// Add a new component to the catalog and invalidate the cache
export const addComponentToCatalog = (newItem) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const itemWithId = { ...newItem, id: `custom-${Date.now()}` };
      
      try {
        const savedCustom = localStorage.getItem(CUSTOM_ITEMS_STORAGE_KEY);
        const currentCustom = savedCustom ? JSON.parse(savedCustom) : [];
        const updatedCustom = [itemWithId, ...currentCustom];
        localStorage.setItem(CUSTOM_ITEMS_STORAGE_KEY, JSON.stringify(updatedCustom));
      } catch (e) {
        console.error('Failed to save custom item:', e);
      }

      // Cache Invalidation Strategy
      // When creating a new item, we clear the cache so that the next fetch retrieves up-to-date data.
      invalidateCache(CATALOG_QUERY_KEY);

      resolve(itemWithId);
    }, 400);
  });
};