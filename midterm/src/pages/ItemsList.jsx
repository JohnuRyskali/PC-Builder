import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { fetchComponents, addComponentToCatalog } from '../services/api'; // Вся логика в сервисе!
import { useAuth } from '../context/AuthContext';
import { EMPTY_BUILD, loadUserData, saveUserBuild } from '../services/userData';
import { HardwareCard } from '../components/HardwareCard';
import { BuildSummary } from '../components/BuildSummary';
import { FilterBar } from '../components/FilterBar';
import { AddHardwareForm } from '../components/AddHardwareForm';

const categoryOrder = { CPU: 1, Motherboard: 2, Memory: 3, 'Video Card': 4 };
const ITEMS_PER_PAGE = 12;

export function ItemsList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [catalogVersion, setCatalogVersion] = useState(0);
  const [buildLoadVersion, setBuildLoadVersion] = useState(0);
  const [catalogResult, setCatalogResult] = useState({ key: null, components: [], error: null });
  const [buildData, setBuildData] = useState({ owner: null, value: { ...EMPTY_BUILD } });
  const [buildErrorState, setBuildErrorState] = useState(null);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;
  const catalogKey = `${userId || 'guest'}:${catalogVersion}`;
  const loading = catalogResult.key !== catalogKey;
  const error = loading ? null : catalogResult.error;
  const components = loading ? [] : catalogResult.components;
  const buildOwner = userId || null;
  const build = buildData.owner === buildOwner ? buildData.value : EMPTY_BUILD;
  const buildError = buildErrorState?.owner === buildOwner ? buildErrorState.message : '';

  const handleGoToSummary = () => {
    const hasItems = Object.values(build).some((item) => item !== null);
    if (!hasItems) {
      alert('Your build is empty. Select components first.');
      return;
    }
    navigate('/summary', { state: { build, owner: userId || null } });
  };

  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || 'All';
  const sortBy = searchParams.get('sort') || 'name-asc';

  const handleSearchChange = (query) => {
    setCurrentPage(1);
    setSearchParams((prev) => {
      if (query) prev.set('search', query);
      else prev.delete('search');
      return prev;
    });
  };

  const handleSelectedCategoryChange = (category) => {
    setCurrentPage(1);
    setSearchParams((prev) => {
      if (category && category !== 'All') prev.set('category', category);
      else prev.delete('category');
      return prev;
    });
  };

  const handleSortChange = (sort) => {
    setCurrentPage(1);
    setSearchParams((prev) => {
      if (sort) prev.set('sort', sort);
      else prev.delete('sort');
      return prev;
    });
  };

  useEffect(() => {
    let ignore = false;
    if (!userId) return () => { ignore = true; };

    loadUserData(userId)
      .then(({ build: savedBuild }) => {
        if (!ignore) {
          setBuildData({ owner: userId, value: { ...EMPTY_BUILD, ...savedBuild } });
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Failed to load saved build:', err);
          setBuildErrorState({
            owner: userId,
            message: 'Could not load your saved data. Check your Firebase configuration and try again.',
          });
        }
      });

    return () => { ignore = true; };
  }, [userId, buildLoadVersion]);

  useEffect(() => {
    if (!userId || buildData.owner !== userId) return undefined;

    const timeout = setTimeout(() => {
      saveUserBuild(userId, buildData.value)
        .then(() => {
          setBuildErrorState((previous) => previous?.owner === userId ? null : previous);
        })
        .catch((err) => {
          console.error('Failed to save build:', err);
          setBuildErrorState({
            owner: userId,
            message: 'Could not save your build to Firebase. Please try again.',
          });
        });
    }, 300);

    return () => clearTimeout(timeout);
  }, [buildData, userId]);

  useEffect(() => {
    let ignore = false;
    fetchComponents(userId)
      .then((data) => {
        if (!ignore) {
          setCatalogResult({ key: catalogKey, components: data, error: null });
        }
      })
      .catch((err) => {
        if (!ignore) {
          setCatalogResult({ key: catalogKey, components: [], error: err.message || 'Failed to fetch catalog' });
        }
      });

    return () => { ignore = true; };
  }, [userId, catalogKey]);

  const updateBuild = (updater) => {
    if (userId && buildData.owner !== userId) return;

    setBuildData((previous) => {
      const owner = userId || null;
      const previousBuild = previous.owner === owner ? previous.value : EMPTY_BUILD;
      return { owner, value: updater(previousBuild) };
    });
  };

  const handleAddToBuild = (item) => {
    if (!item || !item.category) return;
    let targetCategory = item.category;
    if (item.category === 'GPU' || item.category === 'VideoCard') targetCategory = 'Video Card';

    updateBuild((prevBuild) => ({ ...prevBuild, [targetCategory]: item }));
  };

  const handleRemoveFromBuild = (category) => {
    updateBuild((prevBuild) => ({ ...prevBuild, [category]: null }));
  };

  const handleClearBuild = () => {
    updateBuild(() => ({ ...EMPTY_BUILD }));
  };

  const handleAddNewComponent = async (newComponent) => {
    await addComponentToCatalog(newComponent, userId);
    setCatalogVersion((version) => version + 1);
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

  if (userId && buildData.owner !== userId) {
    if (buildError) {
      return (
        <div style={{ color: '#f87171', padding: '40px', textAlign: 'center' }}>
          <p role="alert">{buildError}</p>
          <button
            onClick={() => {
              setBuildErrorState(null);
              setBuildLoadVersion((version) => version + 1);
            }}
            style={{ padding: '8px 16px', marginTop: '12px', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      );
    }

    return <div style={{ color: '#fff', padding: '40px', textAlign: 'center' }}>Loading your saved build...</div>;
  }

  if (error) {
    return (
      <div style={{ color: '#f87171', padding: '40px', textAlign: 'center' }}>
        <p>{error}</p>
        <button onClick={() => setCatalogVersion((version) => version + 1)} style={{ padding: '8px 16px', marginTop: '12px', cursor: 'pointer' }}>
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

          <button onClick={() => currentUser ? setIsAddFormOpen(true) : navigate('/login')} style={{ padding: '10px 18px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            + Add Custom Hardware
          </button>
        </div>
      </div>

      {!currentUser && (
        <p style={{ color: '#9ca3af', marginTop: 0 }}>
          <Link to="/login" style={{ color: '#60a5fa' }}>Sign in</Link> to sync your build and custom hardware across devices.
        </p>
      )}
      {buildError && <p role="alert" style={{ color: '#f87171' }}>{buildError}</p>}

      <BuildSummary build={build} onRemove={handleRemoveFromBuild} onClear={handleClearBuild} />
      <FilterBar searchQuery={searchQuery} onSearchChange={handleSearchChange} selectedCategory={selectedCategory} onCategoryChange={handleSelectedCategoryChange} sortBy={sortBy} onSortChange={handleSortChange} />

      {paginatedComponents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
          No components found matching your criteria.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {paginatedComponents.map((item) => (
            <HardwareCard key={item.id} item={item} onAddToBuild={handleAddToBuild} />
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

      {isAddFormOpen && <AddHardwareForm onClose={() => setIsAddFormOpen(false)} onAdd={handleAddNewComponent} />}
    </div>
  );
}

export default ItemsList;