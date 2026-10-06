import React from 'react';

export const HardwareDetailModal = ({ item, onClose, onAddToBuild }) => {
  const getBadgeColor = (category) => {
    switch (category) {
      case 'CPU': return '#ef4444';
      case 'Motherboard': return '#10b981';
      case 'Memory': return '#f59e0b';
      case 'Video Card': case 'GPU': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  if (!item) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={{ ...styles.badge, backgroundColor: getBadgeColor(item.category) }}>
            {item.category}
          </span>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <h2 style={styles.title}>{item.name}</h2>

        <div style={styles.specsGrid}>
          {item.socket && (
            <div style={styles.specItem}>
              <span style={styles.specLabel}>Socket</span>
              <span style={styles.specValue}>{item.socket}</span>
            </div>
          )}
          {item.ram_type && (
            <div style={styles.specItem}>
              <span style={styles.specLabel}>Memory Type</span>
              <span style={styles.specValue}>{item.ram_type}</span>
            </div>
          )}
          {item.tdp && (
            <div style={styles.specItem}>
              <span style={styles.specLabel}>TDP</span>
              <span style={styles.specValue}>{item.tdp} W</span>
            </div>
          )}
          {item.core_count && (
            <div style={styles.specItem}>
              <span style={styles.specLabel}>Cores / Clock</span>
              <span style={styles.specValue}>{item.core_count} cores @ {item.core_clock} GHz</span>
            </div>
          )}
          {item.speed && (
            <div style={styles.specItem}>
              <span style={styles.specLabel}>Speed</span>
              <span style={styles.specValue}>{item.speed}</span>
            </div>
          )}
          {item.modules && (
            <div style={styles.specItem}>
              <span style={styles.specLabel}>Modules</span>
              <span style={styles.specValue}>{item.modules}</span>
            </div>
          )}
          {item.vram && (
            <div style={styles.specItem}>
              <span style={styles.specLabel}>VRAM</span>
              <span style={styles.specValue}>{item.vram} GB</span>
            </div>
          )}
          {item.form_factor && (
            <div style={styles.specItem}>
              <span style={styles.specLabel}>Form Factor</span>
              <span style={styles.specValue}>{item.form_factor}</span>
            </div>
          )}
          {item.capacity && (
            <div style={styles.specItem}>
              <span style={styles.specLabel}>Capacity / Type</span>
              <span style={styles.specValue}>{item.capacity} ({item.type})</span>
            </div>
          )}
        </div>

        <div style={styles.actions}>
          <button style={styles.secondaryBtn} onClick={onClose}>
            Close
          </button>
          <button
            style={styles.primaryBtn}
            onClick={(e) => {
              e.stopPropagation();
              onAddToBuild(item);
              onClose();
            }}
          >
            + Add to Build
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)'
  },
  modal: {
    backgroundColor: '#1e1e24',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#333'
  },
  header: {
    display: 'flex',
    justify: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  badge: {
    backgroundColor: '#2563eb',
    color: '#fff',
    fontSize: '11px',
    fontWeight: 'bold',
    padding: '4px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase'
  },
  closeBtn: {
    background: 'none',
    borderStyle: 'none',
    color: '#aaa',
    fontSize: '18px',
    cursor: 'pointer'
  },
  title: {
    fontSize: '20px',
    margin: '0 0 16px 0',
    color: '#fff'
  },
  specsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    backgroundColor: '#121214',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  specItem: {
    display: 'flex',
    flexDirection: 'column'
  },
  specLabel: {
    fontSize: '12px',
    color: '#888'
  },
  specValue: {
    fontSize: '14px',
    color: '#fff',
    fontWeight: '500'
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justify: 'flex-end'
  },
  secondaryBtn: {
    padding: '10px 16px',
    borderRadius: '6px',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#444',
    backgroundColor: 'transparent',
    color: '#ccc',
    cursor: 'pointer'
  },
  primaryBtn: {
    padding: '10px 16px',
    borderRadius: '6px',
    borderStyle: 'none',
    backgroundColor: '#2563eb',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};