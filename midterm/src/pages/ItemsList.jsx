import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchComponents, addComponentToCatalog } from '../services/api'; // Вся логика в сервисе!
import { HardwareCard } from '../components/HardwareCard';
import { BuildSummary } from '../components/BuildSummary';
import { FilterBar } from '../components/FilterBar';
import { HardwareDetailModal } from '../components/HardwareDetailModal';
import { AddHardwareForm } from '../components/AddHardwareForm';

const categoryOrder = { CPU: 1, Motherboard: 2, Memory: 3, 'Video Card': 4 };
const STORAGE_KEY = 'pc_builder_current_build';
const ITEMS_PER_PAGE = 12;

export function ItemsList() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleGoToSummary = () => {
    const hasItems = Object.values(build).some((item) => item !== null);
    if (!hasItems) {
      alert('Your build is empty. Select components first.');
      return;
    }
    navigate('/summary'); 
  };

  // Current PC state
  const [build, setBuild] = useState(() => {
    try {
      const savedBuild = localStorage.getItem(STORAGE_KEY);
      if (savedBuild) return JSON.parse(savedBuild);
    } catch (e) {
      console.error('Failed to load build:', e);
    }
    return { CPU: null, Motherboard: null, Memory: null, 'Video Card': null };
  });

  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || 'All';
  const sortBy = searchParams.get('sort') || 'name-asc';

  const handleSearchChange = (query) => {
    setSearchParams((prev) => {
      if (query) prev.set('search', query);
      else prev.delete('search');
      return prev;
    });
  };

  const handleSelectedCategoryChange = (category) => {
    setSearchParams((prev) => {
      if (category && category !== 'All') prev.set('category', category);
      else prev.delete('category');
      return prev;
    });
  };

  const handleSortChange = (sort) => {
    setSearchParams((prev) => {
      if (sort) prev.set('sort', sort);
      else prev.delete('sort');
      return prev;
    });
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(build));
    } catch (e) {
      console.error('Failed to save build:', e);
    }
  }, [build]);

  // Load data with caching and error handling
  const loadData = () => {
    let ignore = false;
    setLoading(true);
    setError(null);

    fetchComponents()
      .then((data) => {
        if (!ignore) {
          setComponents(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'Failed to fetch catalog');
          setLoading(false);
        }
      });

    return () => { ignore = true; };
  };

  useEffect(() => {
    return loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy]);

  const handleAddToBuild = (item) => {
    if (!item || !item.category) return;
    let targetCategory = item.category;
    if (item.category === 'GPU' || item.category === 'VideoCard') targetCategory = 'Video Card';

    setBuild((prevBuild) => ({ ...prevBuild, [targetCategory]: item }));
  };

  const handleRemoveFromBuild = (category) => {
    setBuild((prevBuild) => ({ ...prevBuild, [category]: null }));
  };

  const handleClearBuild = () => {
    setBuild({ CPU: null, Motherboard: null, Memory: null, 'Video Card': null });
  };

  const handleAddNewComponent = async (newComponent) => {
    try {
      await addComponentToCatalog(newComponent);
      // After adding a new component, reload the data to reflect the changes
      loadData();
    } catch (e) {
      console.error('Failed to add hardware:', e);
    }
  };

  const filteredComponents = components
    .filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'tdp-desc') return (b.tdp || 0) - (a.tdp || 0);
      if (sortBy === 'tdp-asc') return (a.tdp || 0) - (b.tdp || 0);
      
      if (selectedCategory === 'All') {
        const orderA = categoryOrder[a.category] || 99;
        const orderB = categoryOrder[b.category] || 99;
        if (orderA !== orderB) return orderA - orderB;
      }
      return 0;
    });

  const totalPages = Math.ceil(filteredComponents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedComponents = filteredComponents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) return <div style={{ color: '#fff', padding: '40px', textAlign: 'center' }}>Loading hardware catalog...</div>;

  if (error) {
    return (
      <div style={{ color: '#f87171', padding: '40px', textAlign: 'center' }}>
        <p>{error}</p>
        <button onClick={loadData} style={{ padding: '8px 16px', marginTop: '12px', cursor: 'pointer' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', lineHeight: '1.2' }}>
          PC Part Picker & Compatibility Checker
        </h1>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleGoToSummary} style={{ padding: '10px 18px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            📥 Export Build (.txt)
          </button>

          <button onClick={() => setIsAddFormOpen(true)} style={{ padding: '10px 18px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            + Add Custom Hardware
          </button>
        </div>
      </div>

      <BuildSummary build={build} onRemove={handleRemoveFromBuild} onClear={handleClearBuild} />
      <FilterBar searchQuery={searchQuery} onSearchChange={handleSearchChange} selectedCategory={selectedCategory} onCategoryChange={handleSelectedCategoryChange} sortBy={sortBy} onSortChange={handleSortChange} />

      {paginatedComponents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
          No components found matching your criteria.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {paginatedComponents.map((item) => (
            <HardwareCard key={item.id} item={item} onAddToBuild={handleAddToBuild} onSelect={(selected) => setSelectedItem(selected)} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '32px' }}>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} style={{ padding: '8px 16px', backgroundColor: currentPage === 1 ? '#333' : '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>
            Previous
          </button>
          <span style={{ fontSize: '14px', color: '#aaa' }}>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} style={{ padding: '8px 16px', backgroundColor: currentPage === totalPages ? '#333' : '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>
            Next
          </button>
        </div>
      )}

      <HardwareDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} onAddToBuild={handleAddToBuild} />
      {isAddFormOpen && <AddHardwareForm onClose={() => setIsAddFormOpen(false)} onAdd={handleAddNewComponent} />}
    </div>
  );
}

export default ItemsList;