import React from 'react';

// Функция получения цвета категории
const getBadgeColor = (category) => {
  switch (category) {
    case 'CPU':
      return '#ef4444'; // Красный
    case 'Motherboard':
      return '#10b981'; // Зеленый
    case 'Memory':
      return '#f59e0b'; // Оранжевый
    case 'Video Card':
      return '#8b5cf6'; // Фиолетовый
    default:
      return '#6b7280'; // Серый
  }
};

export const HardwareCard = ({ item, onAddToBuild, onSelect }) => {
  const badgeColor = getBadgeColor(item.category);

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={{ ...styles.badge, backgroundColor: badgeColor }}>
          {item.category}
        </span>
      </div>

      <h3 style={styles.title}>{item.name}</h3>

      <div style={styles.specs}>
        {item.socket && <div>🔌 Socket: <b>{item.socket}</b></div>}
        {item.ram_type && <div>🧠 Memory Type: <b>{item.ram_type}</b></div>}
        {item.tdp && <div>⚡ TDP: <b>{item.tdp} W</b></div>}
        {item.vram && <div>🎮 VRAM: <b>{item.vram} GB</b></div>}
      </div>

      <div style={styles.actions}>
        <button style={styles.detailsBtn} onClick={() => onSelect(item)}>
          Details
        </button>
        <button 
          style={styles.addBtn} 
          onClick={(e) => {
            e.stopPropagation(); // Предотвращаем всплытие события
            onAddToBuild(item);
          }}
        >
          + Add to Build
        </button>
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: '#1e1e24',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    justify: 'space-between',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#2d2d35'
  },
  header: {
    marginBottom: '8px'
  },
  badge: {
    color: '#fff',
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '3px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
    display: 'inline-block'
  },
  title: {
    fontSize: '15px',
    margin: '0 0 12px 0',
    color: '#fff',
    minHeight: '40px'
  },
  specs: {
    fontSize: '13px',
    color: '#aaa',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '16px'
  },
  actions: {
    display: 'flex',
    gap: '8px'
  },
  detailsBtn: {
    flex: 1,
    padding: '8px',
    borderRadius: '6px',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#444',
    backgroundColor: '#2a2a32',
    color: '#fff',
    cursor: 'pointer'
  },
  addBtn: {
    flex: 1.5,
    padding: '8px',
    borderRadius: '6px',
    borderStyle: 'none',
    borderWidth: '0px',
    borderColor: 'transparent',
    backgroundColor: '#2563eb',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};