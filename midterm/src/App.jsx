import React, { useEffect, useState } from 'react';
import { fetchComponents } from './services/api';
import { HardwareCard } from './components/HardwareCard';
import { BuildSummary } from './components/BuildSummary';
import { FilterBar } from './components/FilterBar';
import { HardwareDetailModal } from './components/HardwareDetailModal';
import { AddHardwareForm } from './components/AddHardwareForm';

const categoryOrder = {
  CPU: 1,
  Motherboard: 2,
  Memory: 3,
  'Video Card': 4
};

const STORAGE_KEY = 'pc_builder_current_build';
const ITEMS_PER_PAGE = 12;

export function App() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Состояние для пагинации
  const [currentPage, setCurrentPage] = useState(1);

  // Состояние для управления модальным окном добавления компонента
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  // Инициализация состояния сборки из localStorage
  const [build, setBuild] = useState(() => {
    try {
      const savedBuild = localStorage.getItem(STORAGE_KEY);
      if (savedBuild) {
        return JSON.parse(savedBuild);
      }
    } catch (e) {
      console.error('Failed to load build from localStorage:', e);
    }
    return {
      CPU: null,
      Motherboard: null,
      Memory: null,
      'Video Card': null
    };
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name-asc');

  // Сохранение сборки в localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(build));
    } catch (e) {
      console.error('Failed to save build to localStorage:', e);
    }
  }, [build]);

  // Загрузка каталога с функцией очистки (Cleanup)
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);

    fetchComponents()
      .then((data) => {
        if (!ignore) {
          const filteredData = data.filter((item) => item.category !== 'Storage');
          setComponents(filteredData);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'Failed to fetch catalog');
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Сброс на 1-ю страницу при изменении фильтрации или поиска
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy]);

  const handleAddToBuild = (item) => {
    if (!item || !item.category) return;

    let targetCategory = item.category;
    if (item.category === 'GPU' || item.category === 'VideoCard') {
      targetCategory = 'Video Card';
    }

    setBuild((prevBuild) => ({
      ...prevBuild,
      [targetCategory]: item
    }));
  };

  const handleRemoveFromBuild = (category) => {
    setBuild((prevBuild) => ({
      ...prevBuild,
      [category]: null
    }));
  };

  const handleClearBuild = () => {
    setBuild({
      CPU: null,
      Motherboard: null,
      Memory: null,
      'Video Card': null
    });
  };

  // Добавление нового компонента через форму
  const handleAddNewComponent = (newComponent) => {
    setComponents((prev) => [newComponent, ...prev]);
  };

  // Фильтрация и сортировка
  const filteredComponents = components
    .filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (selectedCategory === 'All') {
        const orderA = categoryOrder[a.category] || 99;
        const orderB = categoryOrder[b.category] || 99;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
      }

      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'tdp-desc') return (b.tdp || 0) - (a.tdp || 0);
      if (sortBy === 'tdp-asc') return (a.tdp || 0) - (b.tdp || 0);
      return 0;
    });

  // Логика пагинации
  const totalPages = Math.ceil(filteredComponents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedComponents = filteredComponents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) {
    return <div style={{ color: '#fff', padding: '40px', textAlign: 'center' }}>Loading hardware catalog...</div>;
  }

  if (error) {
    return (
      <div style={{ color: '#f87171', padding: '40px', textAlign: 'center' }}>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{ padding: '8px 16px', marginTop: '12px', cursor: 'pointer' }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto', color: '#fff' }}>
      {/* Шапка с заголовком и кнопкой */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        gap: '16px',
        flexWrap: 'wrap',
        marginBottom: '24px' 
      }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', lineHeight: '1.2' }}>
          PC Part Picker & Compatibility Checker
        </h1>
        <button
          onClick={() => setIsAddFormOpen(true)}
          style={{
            padding: '10px 18px',
            backgroundColor: '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          + Add Custom Hardware
        </button>
      </div>

      <BuildSummary 
        build={build} 
        onRemove={handleRemoveFromBuild} 
        onClear={handleClearBuild} 
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Отработка Empty State */}
      {paginatedComponents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
          No components found matching your criteria.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {paginatedComponents.map((item) => (
            <HardwareCard
              key={item.id}
              item={item}
              onAddToBuild={handleAddToBuild}
              onSelect={(selected) => setSelectedItem(selected)}
            />
          ))}
        </div>
      )}

      {/* Панель пагинации */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '32px' }}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            style={{
              padding: '8px 16px',
              backgroundColor: currentPage === 1 ? '#333' : '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Previous
          </button>
          
          <span style={{ fontSize: '14px', color: '#aaa' }}>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            style={{
              padding: '8px 16px',
              backgroundColor: currentPage === totalPages ? '#333' : '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Модальное окно деталей */}
      <HardwareDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onAddToBuild={handleAddToBuild}
      />

      {/* Модальное окно формы добавления */}
      {isAddFormOpen && (
        <AddHardwareForm
          onClose={() => setIsAddFormOpen(false)}
          onAdd={handleAddNewComponent}
        />
      )}
    </div>
  );
}

export default App;