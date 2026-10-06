import rawCpus from '../assets/data/cpu.json';
import rawMobos from '../assets/data/motherboard.json';
import rawRams from '../assets/data/memory.json';
import rawGpus from '../assets/data/video-card.json';
import rawDrives from '../assets/data/internal-hard-drive.json';

const STORAGE_KEY = 'pc_compatibility_catalog';

// Умное определение сокета по названию комплектующего
const parseSocket = (name, rawSocket) => {
  if (rawSocket) return rawSocket;
  const upper = name.toUpperCase();

  // Сокет AM4 (AM4, Ryzen 1000-5000, чипсеты B550/X570/B450/A520/B350/X370)
  if (
    upper.includes('AM4') ||
    upper.includes('B550') ||
    upper.includes('X570') ||
    upper.includes('B450') ||
    upper.includes('A520') ||
    upper.includes('B350') ||
    upper.includes('X370') ||
    upper.includes('5600') ||
    upper.includes('5700') ||
    upper.includes('5800') ||
    upper.includes('5900') ||
    upper.includes('5950') ||
    upper.includes('3600') ||
    upper.includes('5500')
  ) {
    return 'AM4';
  }

  // Сокет AM5 (AM5, Ryzen 7000-9000, чипсеты B650/X670/B850/X870)
  if (
    upper.includes('AM5') ||
    upper.includes('B650') ||
    upper.includes('X670') ||
    upper.includes('B850') ||
    upper.includes('X870') ||
    upper.includes('7600') ||
    upper.includes('7700') ||
    upper.includes('7800') ||
    upper.includes('7900') ||
    upper.includes('7950') ||
    upper.includes('9600') ||
    upper.includes('9700') ||
    upper.includes('9800') ||
    upper.includes('9900') ||
    upper.includes('9950')
  ) {
    return 'AM5';
  }

  // Сокет LGA1700 (Intel 12-14 поколение, Z690/B660/Z790/B760/H610)
  if (
    upper.includes('LGA1700') ||
    upper.includes('1700') ||
    upper.includes('Z690') ||
    upper.includes('B660') ||
    upper.includes('Z790') ||
    upper.includes('B760') ||
    upper.includes('H610') ||
    upper.includes('12400') ||
    upper.includes('12700') ||
    upper.includes('13400') ||
    upper.includes('13600') ||
    upper.includes('13700') ||
    upper.includes('13900') ||
    upper.includes('14700') ||
    upper.includes('14900')
  ) {
    return 'LGA1700';
  }

  // Сокет LGA1200 (Intel 10-11 поколение, Z490/B460/Z590/B560)
  if (
    upper.includes('LGA1200') ||
    upper.includes('1200') ||
    upper.includes('Z490') ||
    upper.includes('B460') ||
    upper.includes('Z590') ||
    upper.includes('B560') ||
    upper.includes('10400') ||
    upper.includes('10700') ||
    upper.includes('11400') ||
    upper.includes('11700')
  ) {
    return 'LGA1200';
  }

  // Intel LGA1851 (Core Ultra 200 series, Z890, B860)
  if (
    upper.includes('LGA1851') ||
    upper.includes('1851') ||
    upper.includes('Z890') ||
    upper.includes('B860') ||
    upper.includes('265K') ||
    upper.includes('285K') ||
    upper.includes('245K')
  ) {
    return 'LGA1851';
  }

  // Сокет LGA1700 (Intel 12-14 поколение, Z690/B660/H610/Z790/B760)
  if (
  upper.includes('LGA1700') ||
  upper.includes('1700') ||
  upper.includes('Z690') ||
  upper.includes('B660') ||
  upper.includes('H610') ||
  upper.includes('Z790') ||
  upper.includes('B760') ||
  upper.includes('H770') ||
  upper.includes('12400') ||
  upper.includes('12700') ||
  upper.includes('13400') ||
  upper.includes('13700') ||
  upper.includes('14400') ||
  upper.includes('14600') ||
  upper.includes('14700') ||
  upper.includes('14900')
) {
  return 'LGA1700';
}

  return 'AM5';
};

// Нормализация всех типов данных
const normalizeData = () => {
  // 1. Процессоры (30 шт)
  const cpus = rawCpus.slice(0, 30).map((item, index) => ({
    id: `cpu-${index + 1}`,
    name: item.name,
    category: 'CPU',
    brand: item.name.toLowerCase().includes('amd') ? 'AMD' : 'Intel',
    socket: parseSocket(item.name, item.socket),
    tdp: item.tdp || 65,
    core_count: item.core_count || 6,
    core_clock: item.core_clock || 3.5,
    graphics: item.graphics || 'None'
  }));

  // 2. Материнские платы (30 шт)
  const mobos = rawMobos.slice(0, 30).map((item, index) => {
    const socket = parseSocket(item.name, item.socket);
    const upperName = item.name.toUpperCase();

    // Определение типа памяти (DDR4 или DDR5)
    let ramType = 'DDR5';
    if (
      socket === 'AM4' ||
      socket === 'LGA1200' ||
      upperName.includes('DDR4') ||
      upperName.includes('B450') ||
      upperName.includes('B550') ||
      upperName.includes('X570') ||
      upperName.includes('A520') ||
      upperName.includes('B350')
    ) {
      ramType = 'DDR4';
    }

    return {
      id: `mobo-${index + 1}`,
      name: item.name,
      category: 'Motherboard',
      brand: item.name.split(' ')[0],
      socket: socket,
      ram_type: ramType,
      form_factor: item.form_factor || 'ATX'
    };
  });

  // 3. Оперативная память (30 шт)
  const rams = rawRams.slice(0, 30).map((item, index) => {
    const isDdr5 =
      (Array.isArray(item.speed) && item.speed[0] === 5) ||
      item.name.toUpperCase().includes('DDR5');

    const speedMHz = Array.isArray(item.speed) ? item.speed[1] : item.speed;
    const modulesText = Array.isArray(item.modules)
      ? `${item.modules[0]}x${item.modules[1]}GB`
      : item.modules;

    return {
      id: `ram-${index + 1}`,
      name: item.name,
      category: 'Memory',
      speed: speedMHz ? `${speedMHz} MHz` : '3200 MHz',
      modules: modulesText || '2x16GB',
      ram_type: isDdr5 ? 'DDR5' : 'DDR4'
    };
  });

  // 4. Видеокарты (25 шт)
  const parseGpuTdp = (chipset, rawTdp) => {
  if (rawTdp) return rawTdp;
  const upper = (chipset || '').toUpperCase();

  // RTX 40xx / 30xx / RX 7000 / 6000 серии
  if (upper.includes('4090')) return 450;
  if (upper.includes('4080')) return 320;
  if (upper.includes('4070 TI')) return 285;
  if (upper.includes('4070')) return 200;
  if (upper.includes('4060 TI')) return 160;
  if (upper.includes('4060')) return 115;

  if (upper.includes('3090')) return 350;
  if (upper.includes('3080')) return 320;
  if (upper.includes('3070')) return 220;
  if (upper.includes('3060')) return 170;

  if (upper.includes('7900 XTX')) return 355;
  if (upper.includes('7900 XT')) return 315;
  if (upper.includes('7800 XT')) return 263;
  if (upper.includes('7700 XT')) return 245;
  if (upper.includes('7600')) return 165;

  if (upper.includes('A770')) return 225;
  if (upper.includes('A750')) return 225;

  return 200;
};

// Внутри normalizeData() заменяем парсинг видеокарт:
const gpus = rawGpus.slice(0, 30).map((item, index) => {
  const chipset = item.chipset || '';
  // Если в названии еще нет имени чипа (например, "Asus PRIME OC"), добавляем чипсет спереди
  const fullName = item.name.toLowerCase().includes(chipset.toLowerCase())
    ? item.name
    : `${chipset} ${item.name}`.trim();

  return {
    id: `gpu-${index + 1}`,
    name: fullName,
    category: 'Video Card',
    chipset: chipset || 'NVIDIA / AMD',
    vram: item.memory || 8,
    tdp: parseGpuTdp(chipset || item.name, item.tdp)
  };
});

  // 5. Накопители (15 шт)
  const drives = rawDrives.slice(0, 15).map((item, index) => ({
    id: `drive-${index + 1}`,
    name: item.name,
    category: 'Storage',
    capacity: item.capacity || '1 TB',
    type: item.type || 'SSD'
  }));

  return [...cpus, ...mobos, ...rams, ...gpus, ...drives];
};

// Чтение из LocalStorage
const getStoredData = () => {
  const localData = localStorage.getItem(STORAGE_KEY);
  if (!localData) {
    const initialList = normalizeData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialList));
    return initialList;
  }
  return JSON.parse(localData);
};

// Имитация асинхронного API
export const fetchComponents = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.01) {
        reject(new Error('Failed to load hardware catalog. Please refresh.'));
      } else {
        resolve(getStoredData());
      }
    }, 500);
  });
};

export const addComponentToCatalog = (newItem) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const currentList = getStoredData();
      const itemWithId = { ...newItem, id: `custom-${Date.now()}` };
      const updatedList = [itemWithId, ...currentList];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      resolve(itemWithId);
    }, 400);
  });
};