import React, { useState } from 'react';

export function AddHardwareForm({ onAdd, onClose }) {
  const [category, setCategory] = useState('CPU');
  
  const [name, setName] = useState('');
  const [socket, setSocket] = useState('');
  const [ramType, setRamType] = useState('DDR4'); // По умолчанию DDR4
  const [tdp, setTdp] = useState('');
  const [vram, setVram] = useState('');

  const handleCategoryChange = (e) => {
    const selected = e.target.value;
    console.log('🔄 [AddHardwareForm] Category changed to:', selected);
    setCategory(selected);
    setSocket('');
    setRamType('DDR4');
    setTdp('');
    setVram('');
  };

  const handleButtonClick = () => {
    console.log('🖱️ [AddHardwareForm] Submit button clicked!');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('🚀 [AddHardwareForm] Form submit triggered with name:', name);

    if (!name.trim()) {
      console.warn('⚠️ [AddHardwareForm] Validation failed: Name is empty.');
      return;
    }

    const newItem = {
      id: Date.now(),
      name: name.trim(),
      category: category
    };

    if (category === 'CPU') {
      if (socket) newItem.socket = socket.trim();
      if (tdp) newItem.tdp = Number(tdp);
    } else if (category === 'Motherboard') {
      if (socket) newItem.socket = socket.trim();
      if (ramType) newItem.ram_type = ramType.trim();
    } else if (category === 'Memory') {
      if (ramType) newItem.ram_type = ramType.trim();
    } else if (category === 'Video Card') {
      if (tdp) newItem.tdp = Number(tdp);
      if (vram) newItem.vram = Number(vram);
    }

    console.log('📦 [AddHardwareForm] Payload created:', newItem);

    if (typeof onAdd === 'function') {
      console.log('✅ [AddHardwareForm] Calling onAdd callback...');
      onAdd(newItem);
    } else {
      console.error('❌ [AddHardwareForm] onAdd prop is missing or not a function!', onAdd);
    }

    if (typeof onClose === 'function') {
      console.log('🔒 [AddHardwareForm] Calling onClose callback...');
      onClose();
    }
  };

  return (
    <div style={styles.overlay}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h3 style={styles.title}>➕ Add Custom Hardware</h3>

        {/* 1. Category */}
        <div style={styles.field}>
          <label style={styles.label}>Category</label>
          <select
            value={category}
            onChange={handleCategoryChange}
            style={styles.input}
          >
            <option value="CPU">CPU (Processor)</option>
            <option value="Motherboard">Motherboard</option>
            <option value="Memory">RAM (Memory)</option>
            <option value="Video Card">GPU (Video Card)</option>
          </select>
        </div>

        {/* 2. Component Name */}
        <div style={styles.field}>
          <label style={styles.label}>Component Name *</label>
          <input
            type="text"
            placeholder={
              category === 'CPU' ? 'e.g. Ryzen 5 5600X' :
              category === 'Motherboard' ? 'e.g. B550 AORUS ELITE' :
              category === 'Memory' ? 'e.g. Kingston FURY 16GB' : 'e.g. RTX 4070'
            }
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        {/* 3. Dynamic Fields: CPU */}
        {category === 'CPU' && (
          <>
            <div style={styles.field}>
              <label style={styles.label}>Socket</label>
              <input
                type="text"
                placeholder="e.g. AM4, LGA1700"
                value={socket}
                onChange={(e) => setSocket(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>TDP (Watts)</label>
              <input
                type="number"
                placeholder="e.g. 65"
                value={tdp}
                onChange={(e) => setTdp(e.target.value)}
                style={styles.input}
              />
            </div>
          </>
        )}

        {/* 4. Dynamic Fields: Motherboard */}
        {category === 'Motherboard' && (
          <>
            <div style={styles.field}>
              <label style={styles.label}>Socket</label>
              <input
                type="text"
                placeholder="e.g. AM4, LGA1700"
                value={socket}
                onChange={(e) => setSocket(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Memory Type (ram_type)</label>
              <select
                value={ramType}
                onChange={(e) => setRamType(e.target.value)}
                style={styles.input}
              >
                <option value="DDR4">DDR4</option>
                <option value="DDR5">DDR5</option>
                <option value="DDR3">DDR3</option>
              </select>
            </div>
          </>
        )}

        {/* 5. Dynamic Fields: RAM */}
        {category === 'Memory' && (
          <div style={styles.field}>
            <label style={styles.label}>Memory Type (ram_type)</label>
            <select
              value={ramType}
              onChange={(e) => setRamType(e.target.value)}
              style={styles.input}
            >
              <option value="DDR4">DDR4</option>
              <option value="DDR5">DDR5</option>
              <option value="DDR3">DDR3</option>
            </select>
          </div>
        )}

        {/* 6. Dynamic Fields: GPU */}
        {category === 'Video Card' && (
          <>
            <div style={styles.field}>
              <label style={styles.label}>TDP (Watts)</label>
              <input
                type="number"
                placeholder="e.g. 200"
                value={tdp}
                onChange={(e) => setTdp(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>VRAM (GB)</label>
              <input
                type="number"
                placeholder="e.g. 12"
                value={vram}
                onChange={(e) => setVram(e.target.value)}
                style={styles.input}
              />
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div style={styles.actions}>
          {onClose && (
            <button 
              type="button" 
              onClick={() => {
                console.log('❌ [AddHardwareForm] Cancel button clicked');
                onClose();
              }} 
              style={styles.cancelBtn}
            >
              Cancel
            </button>
          )}
          <button 
            type="submit" 
            onClick={handleButtonClick}
            style={styles.submitBtn}
          >
            Add Hardware
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddHardwareForm;

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
    zIndex: 1000
  },
  form: {
    backgroundColor: '#1e1e1e',
    padding: '24px',
    borderRadius: '10px',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#333',
    width: '100%',
    maxWidth: '420px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
  },
  title: {
    margin: '0 0 6px 0',
    color: '#fff',
    fontSize: '18px',
    fontWeight: 'bold',
    borderBottom: '1px solid #333',
    paddingBottom: '8px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  label: {
    fontSize: '12px',
    color: '#aaa',
    fontWeight: '600'
  },
  input: {
    padding: '8px 10px',
    borderRadius: '6px',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#444',
    backgroundColor: '#2a2a2a',
    color: '#fff',
    fontSize: '13px',
    outline: 'none'
  },
  actions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    marginTop: '10px'
  },
  cancelBtn: {
    padding: '8px 14px',
    borderRadius: '6px',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#555',
    backgroundColor: 'transparent',
    color: '#ccc',
    fontSize: '12px',
    cursor: 'pointer'
  },
  submitBtn: {
    padding: '8px 16px',
    borderRadius: '6px',
    borderStyle: 'none',
    backgroundColor: '#10b981',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};