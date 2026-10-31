import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchComponents } from '../services/api';

export function Dashboard() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Интерактивный фильтр для дашборда (выбор категории для статистики)
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);

    fetchComponents()
      .then((data) => {
        if (!ignore) {
          let customItems = [];
          try {
            const savedCustom = localStorage.getItem('pc_builder_custom_components');
            if (savedCustom) customItems = JSON.parse(savedCustom);
          } catch (e) {
            console.error(e);
          }
          const all = [...customItems, ...data];
          setComponents(all);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'Failed to load dashboard data');
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return <div style={{ color: '#fff', padding: '40px', textAlign: 'center' }}>Loading dashboard analytics...</div>;
  }

  if (error) {
    return <div style={{ color: '#f87171', padding: '40px', textAlign: 'center' }}>{error}</div>;
  }

  // Применяем интерактивный фильтр к набору данных для статистики
  const filteredData = selectedCategoryFilter === 'All' 
    ? components 
    : components.filter((item) => item.category === selectedCategoryFilter);

  // 1. Статистические показатели (4+ показателей)
  const totalItems = filteredData.length;
  const avgPrice = totalItems > 0 ? (filteredData.reduce((acc, item) => acc + (Number(item.price) || 0), 0) / totalItems).toFixed(2) : 0;
  const avgTdp = totalItems > 0 ? (filteredData.reduce((acc, item) => acc + (Number(item.tdp) || 0), 0) / totalItems).toFixed(1) : 0;
  const maxPriceItem = filteredData.reduce((max, item) => (Number(item.price || 0) > Number(max?.price || 0) ? item : max), filteredData[0]);

  // 2. Разбивки данных (Data Breakdowns: по категориям и по уровню энергопотребления / статусу)
  const categoryBreakdown = components.reduce((acc, item) => {
    const cat = item.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const tdpBreakdown = filteredData.reduce((acc, item) => {
    const tdp = item.tdp || 0;
    if (tdp === 0) acc['No TDP / N/A']++;
    else if (tdp < 65) acc['Low Power (<65W)']++;
    else if (tdp <= 150) acc['Mid Power (65W - 150W)']++;
    else acc['High Power (>150W)']++;
    return acc;
  }, { 'No TDP / N/A': 0, 'Low Power (<65W)': 0, 'Mid Power (65W - 150W)': 0, 'High Power (>150W)': 0 });

  return (
    <div style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', margin: 0 }}>System Dashboard & Analytics</h1>
          <p style={{ color: '#9ca3af', margin: '4px 0 0 0' }}>Overview of hardware statistics, breakdowns, and metrics.</p>
        </div>
        
        {/* 3. Интерактивный фильтр, влияющий на статистику */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: '#d1d5db' }}>Filter Stats By:</label>
          <select 
            value={selectedCategoryFilter} 
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            style={{ padding: '8px 12px', backgroundColor: '#1f2937', color: '#fff', border: '1px solid #374151', borderRadius: '6px' }}
          >
            <option value="All">All Categories</option>
            <option value="CPU">CPU</option>
            <option value="Motherboard">Motherboard</option>
            <option value="Memory">Memory</option>
            <option value="Video Card">Video Card</option>
          </select>
        </div>
      </div>

      {/* 4+ Статистических карточек */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#1f2937', padding: '20px', borderRadius: '8px', border: '1px solid #374151' }}>
          <p style={{ color: '#9ca3af', margin: '0 0 8px 0', fontSize: '14px' }}>Total Items (Filtered)</p>
          <h2 style={{ fontSize: '32px', margin: 0, color: '#60a5fa' }}>{totalItems}</h2>
        </div>
        <div style={{ backgroundColor: '#1f2937', padding: '20px', borderRadius: '8px', border: '1px solid #374151' }}>
          <p style={{ color: '#9ca3af', margin: '0 0 8px 0', fontSize: '14px' }}>Average Price</p>
          <h2 style={{ fontSize: '32px', margin: 0, color: '#34d399' }}>${avgPrice}</h2>
        </div>
        <div style={{ backgroundColor: '#1f2937', padding: '20px', borderRadius: '8px', border: '1px solid #374151' }}>
          <p style={{ color: '#9ca3af', margin: '0 0 8px 0', fontSize: '14px' }}>Average TDP / Power</p>
          <h2 style={{ fontSize: '32px', margin: 0, color: '#f472b6' }}>{avgTdp}W</h2>
        </div>
        <div style={{ backgroundColor: '#1f2937', padding: '20px', borderRadius: '8px', border: '1px solid #374151' }}>
          <p style={{ color: '#9ca3af', margin: '0 0 8px 0', fontSize: '14px' }}>Most Expensive Item</p>
          <h3 style={{ fontSize: '16px', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {maxPriceItem ? maxPriceItem.name : 'N/A'}
          </h3>
          {maxPriceItem && (
            <Link to={`/items/${maxPriceItem.id}`} style={{ fontSize: '12px', color: '#60a5fa', textDecoration: 'underline', display: 'inline-block', marginTop: '6px' }}>
              View Details →
            </Link>
          )}
        </div>
      </div>

      {/* 2+ Разбивки данных (Data Breakdowns) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ backgroundColor: '#1f2937', padding: '20px', borderRadius: '8px', border: '1px solid #374151' }}>
          <h3 style={{ fontSize: '18px', marginTop: 0, marginBottom: '16px', borderBottom: '1px solid #374151', paddingBottom: '8px' }}>
            Breakdown 1: Items by Category (Total Catalog)
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(categoryBreakdown).map(([category, count]) => (
              <li key={category} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#111827', padding: '10px 14px', borderRadius: '6px' }}>
                <span style={{ color: '#d1d5db' }}>{category}</span>
                <span style={{ fontWeight: 'bold', color: '#60a5fa' }}>{count} items</span>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ backgroundColor: '#1f2937', padding: '20px', borderRadius: '8px', border: '1px solid #374151' }}>
          <h3 style={{ fontSize: '18px', marginTop: 0, marginBottom: '16px', borderBottom: '1px solid #374151', paddingBottom: '8px' }}>
            Breakdown 2: Power Consumption (TDP Tiers)
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(tdpBreakdown).map(([tier, count]) => (
              <li key={tier} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#111827', padding: '10px 14px', borderRadius: '6px' }}>
                <span style={{ color: '#d1d5db' }}>{tier}</span>
                <span style={{ fontWeight: 'bold', color: '#34d399' }}>{count} items</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Быстрые ссылки на страницы проекта (требование ТЗ) */}
      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <Link to="/items" style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold', display: 'inline-block' }}>
          Go to Hardware Catalog →
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;