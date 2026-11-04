import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'pc_builder_current_build';

export default function BuildSummaryPage() {
  const navigate = useNavigate();
  const [build, setBuild] = useState({ CPU: null, Motherboard: null, Memory: null, 'Video Card': null });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setBuild(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    }
  }, []);

  let totalCost = 0;
  let cpuTdp = 0;
  let gpuTdp = 0;

  Object.entries(build).forEach(([cat, item]) => {
    if (item) {
      totalCost += Number(item.price) || 0;
      if (cat === 'CPU') cpuTdp = Number(item.tdp) || 0;
      if (cat === 'Video Card') gpuTdp = Number(item.tdp) || 0;
    }
  });

  const baseSystemPower = (build.CPU || build['Video Card'] || build.Motherboard || build.Memory) ? 50 : 0;
  const estimatedPower = cpuTdp + gpuTdp + baseSystemPower;
  const recommendedPsu = Math.ceil((estimatedPower * 1.85) / 50) * 50;

  const handleDownload = () => {
    let text = '=== PC BUILDER - SPECIFICATION ROUTE ===\n\n';
    Object.entries(build).forEach(([cat, item]) => {
      if (item) {
        text += `[${cat.toUpperCase()}]: ${item.name} - $${item.price} (TDP: ${item.tdp}W)\n`;
      }
    });
    text += `\nTOTAL PRICE: $${totalCost.toFixed(2)}\n`;
    text += `ESTIMATED POWER: ${estimatedPower} W\n`;
    text += `RECOMMENDED PSU: ${recommendedPsu} W\n`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pc_build_summary.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', color: '#fff' }}>
      <h1>📦 Build Summary & Export</h1>
      
      <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
        <h3>Selected Components:</h3>
        {Object.entries(build).map(([cat, item]) => (
          <div key={cat} style={{ margin: '8px 0', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
            <strong>{cat}:</strong> {item ? `${item.name} ($${item.price})` : 'Not selected'}
          </div>
        ))}
        <h3 style={{ marginTop: '20px' }}>Total Price: ${totalCost.toFixed(2)}</h3>
        <h3>Estimated Power: {estimatedPower} W (PSU: {recommendedPsu} W)</h3>
      </div>

      <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
        <button onClick={handleDownload} style={{ padding: '10px 20px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          📥 Download TXT from Route
        </button>
        <button onClick={() => navigate(-1)} style={{ padding: '10px 20px', background: '#333', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          ← Back to Catalog
        </button>
      </div>
    </div>
  );
}