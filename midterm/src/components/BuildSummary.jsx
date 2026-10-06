import React from 'react';

export function BuildSummary({ build, onRemove, onClear }) {
  // Достаем компоненты по точным ключам
  const cpu = build['CPU'] || build['cpu'];
  const motherboard = build['Motherboard'] || build['motherboard'];
  const ram = build['Memory'] || build['RAM'] || build['ram'];
  const gpu = build['Video Card'] || build['GPU'] || build['gpu'];

  // 1. Подсчет суммарного TDP + запас 50W
  const totalTdp = (cpu?.tdp || 0) + (gpu?.tdp || 0) + 50;

  // 2. Движок проверки ошибок и предупреждений
  const getCompatibilityReport = () => {
    const errors = [];
    const warnings = [];

    if (cpu && motherboard) {
      if (cpu.socket !== motherboard.socket) {
        errors.push(`Socket mismatch: CPU uses ${cpu.socket}, but Motherboard has ${motherboard.socket}`);
      }
    }

    if (motherboard && ram) {
      if (motherboard.ram_type !== ram.ram_type) {
        errors.push(`Memory mismatch: Motherboard supports ${motherboard.ram_type}, but selected RAM is ${ram.ram_type}`);
      }
    }

    if (!cpu) warnings.push('No CPU selected');
    if (!motherboard) warnings.push('No Motherboard selected');
    if (!ram) warnings.push('No Memory (RAM) selected');

    return { errors, warnings };
  };

  const { errors, warnings } = getCompatibilityReport();
  const isFullySelected = cpu && motherboard && ram;
  const isCompatible = errors.length === 0 && isFullySelected;

  const statusBorderColor = errors.length > 0 ? '#dc3545' : isCompatible ? '#28a745' : '#ffc107';

  return (
    <div style={{
      backgroundColor: '#1e1e1e',
      borderStyle: 'solid',
      borderWidth: '1px',
      borderColor: '#333',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '28px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
    }}>
      {/* Заголовок */}
      <h2 style={{
        margin: '0 0 16px 0',
        borderBottom: '1px solid #333',
        paddingBottom: '8px',
        fontSize: '20px',
        fontWeight: 'bold'
      }}>
        ⚙️ PC Build & Compatibility Status
      </h2>

      {/* ЖЕСТКАЯ СЕТКА В 4 КОЛОНКИ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)', // Ровно 4 карточки в один ряд
        gap: '10px',
        marginBottom: '12px'
      }}>
        {[
          { label: 'CPU', item: cpu, key: 'CPU' },
          { label: 'Motherboard', item: motherboard, key: 'Motherboard' },
          { label: 'RAM', item: ram, key: 'Memory' },
          { label: 'GPU', item: gpu, key: 'Video Card' }
        ].map(({ label, item, key }) => (
          <div key={key} style={{
            backgroundColor: '#2a2a2a',
            padding: '10px 6px',
            borderRadius: '6px',
            borderStyle: item ? 'solid' : 'dashed',
            borderWidth: '1px',
            borderColor: item ? '#0d6efd' : '#555',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            alignItems: 'center',
            minWidth: 0, // Предотвращает переполнение контейнера длинным текстом
            minHeight: '115px'
          }}>
            <div style={{ fontSize: '11px', color: '#888', fontWeight: 'bold' }}>
              {label}
            </div>

            <div style={{
              fontSize: '12px',
              fontWeight: '500',
              margin: '4px 0',
              color: item ? '#fff' : '#666',
              wordBreak: 'break-word',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: '1.2'
            }}>
              {item ? item.name : 'Empty Slot'}
            </div>

            {item && (
              <button
                onClick={() => onRemove(key)}
                style={{
                  padding: '3px 8px',
                  fontSize: '11px',
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  borderStyle: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Кнопка Clear All */}
      {onClear && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
          <button
            onClick={onClear}
            style={{
              padding: '6px 14px',
              backgroundColor: '#dc3545',
              color: '#fff',
              borderStyle: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Clear All
          </button>
        </div>
      )}

      {/* Панель статуса */}
      <div style={{
        padding: '12px 16px',
        borderRadius: '6px',
        backgroundColor: errors.length > 0 ? '#3d1619' : isCompatible ? '#143823' : '#332b12',
        borderStyle: 'solid',
        borderWidth: '1px',
        borderColor: statusBorderColor
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '6px', textAlign: 'center' }}>
          {errors.length > 0 && '🔴 Compatibility Issues Found!'}
          {isCompatible && '🟢 All Selected Components Are Fully Compatible!'}
          {!isCompatible && errors.length === 0 && '⚠️ Build Incomplete'}
        </div>

        {errors.map((err, idx) => (
          <div key={idx} style={{ color: '#ff8888', fontSize: '13px', margin: '4px 0' }}>
            • {err}
          </div>
        ))}

        {errors.length === 0 && warnings.map((warn, idx) => (
          <div key={idx} style={{ color: '#ffdd88', fontSize: '13px', margin: '4px 0' }}>
            • {warn}
          </div>
        ))}

        <div style={{
          marginTop: '10px',
          fontSize: '13px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: '8px',
          textAlign: 'center'
        }}>
          ⚡ Estimated Power Consumption: <strong>{totalTdp} W</strong>
          {totalTdp > 50 && ` (Recommended PSU: ${Math.ceil((totalTdp + 100) / 50) * 50} W)`}
        </div>
      </div>
    </div>
  );
}