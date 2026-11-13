import rawCpus from '../assets/data/cpu.json';
import rawMobos from '../assets/data/motherboard.json';
import rawRams from '../assets/data/memory.json';
import rawGpus from '../assets/data/video-card.json';
import { getCachedData, setCachedData, invalidateCache } from './cacheService';
import { addUserCustomComponent, loadUserData } from './userData';

const STORAGE_KEY = 'pc_compatibility_catalog';

export const CATALOG_QUERY_KEY = 'catalog_hardware_components';

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

const getStoredData = (customItems) => {
  let localData;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    localData = saved ? JSON.parse(saved) : normalizeData();
    if (!saved) localStorage.setItem(STORAGE_KEY, JSON.stringify(localData));
  } catch (error) {
    console.error('Failed to load the base hardware catalog:', error);
    localData = normalizeData();
  }

  const uniqueMap = new Map();
  [...customItems, ...localData].forEach((item) => {
    if (item && item.id && item.category !== 'Storage') {
      uniqueMap.set(item.id, item);
    }
  });

  return Array.from(uniqueMap.values());
};

export const fetchComponents = async (userId) => {
  const queryKey = `${CATALOG_QUERY_KEY}:${userId || 'guest'}`;
  const cached = getCachedData(queryKey);
  if (cached) return cached;

  const { customComponents } = await loadUserData(userId);
  const freshData = getStoredData(customComponents);
  setCachedData(queryKey, freshData);
  return freshData;
};

export const addComponentToCatalog = async (newItem, userId) => {
  const itemWithId = await addUserCustomComponent(userId, newItem);
  invalidateCache(`${CATALOG_QUERY_KEY}:${userId}`);
  return itemWithId;
};
