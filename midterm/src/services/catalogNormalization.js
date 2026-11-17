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

export function normalizeCatalog({ cpus, motherboards, memory, videoCards }) {
  const normalizedCpus = cpus.slice(0, 30).map((item, index) => ({
    id: `cpu-${index + 1}`,
    name: item.name,
    category: 'CPU',
    brand: item.name.toLowerCase().includes('amd') ? 'AMD' : 'Intel',
    socket: parseSocket(item.name, item.socket),
    tdp: item.tdp || 65,
    core_count: item.core_count || 6,
    core_clock: item.core_clock || 3.5,
    graphics: item.graphics || 'None',
    price: item.price || 250,
  }));

  const normalizedMotherboards = motherboards.slice(0, 30).map((item, index) => {
    const socket = parseSocket(item.name, item.socket);
    const upperName = item.name.toUpperCase();
    const ramType = socket === 'AM4'
      || socket === 'LGA1200'
      || upperName.includes('DDR4')
      || upperName.includes('B450')
      || upperName.includes('B550')
      ? 'DDR4'
      : 'DDR5';

    return {
      id: `mobo-${index + 1}`,
      name: item.name,
      category: 'Motherboard',
      brand: item.name.split(' ')[0],
      socket,
      ram_type: ramType,
      form_factor: item.form_factor || 'ATX',
      price: item.price || 150,
    };
  });

  const normalizedMemory = memory.slice(0, 30).map((item, index) => {
    const isDdr5 = (Array.isArray(item.speed) && item.speed[0] === 5)
      || item.name.toUpperCase().includes('DDR5');
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
      ram_type: isDdr5 ? 'DDR5' : 'DDR4',
      price: item.price || 90,
    };
  });

  const normalizedVideoCards = videoCards.slice(0, 30).map((item, index) => {
    const chipset = item.chipset || '';
    const fullName = item.name.toLowerCase().includes(chipset.toLowerCase())
      ? item.name
      : `${chipset} ${item.name}`.trim();

    return {
      id: `gpu-${index + 1}`,
      name: fullName,
      category: 'Video Card',
      chipset: chipset || 'NVIDIA / AMD',
      vram: item.memory || 8,
      tdp: item.tdp || 200,
      price: item.price || 500,
    };
  });

  return [...normalizedCpus, ...normalizedMotherboards, ...normalizedMemory, ...normalizedVideoCards];
}
