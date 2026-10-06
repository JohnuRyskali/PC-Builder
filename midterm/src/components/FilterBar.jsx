import React from 'react';

// Вырезали Storage
const categories = ['All', 'CPU', 'Motherboard', 'Memory', 'Video Card'];

export const FilterBar = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange
}) => {
  return (
    <div style={styles.container}>
      <input
        type="text"
        placeholder="Search components..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        style={styles.searchInput}
      />

      <div style={styles.categoryGroup}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            style={{
              ...styles.categoryBtn,
              ...(selectedCategory === cat ? styles.activeCategoryBtn : {})
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        style={styles.sortSelect}
      >
        <option value="name-asc">Name (A-Z)</option>
        <option value="name-desc">Name (Z-A)</option>
        <option value="tdp-desc">Highest TDP</option>
        <option value="tdp-asc">Lowest TDP</option>
      </select>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    alignItems: 'center',
    justify: 'space-between',
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: '#1e1e24',
    borderRadius: '10px'
  },
  searchInput: {
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1px solid #333',
    backgroundColor: '#121214',
    color: '#fff',
    fontSize: '14px',
    minWidth: '220px',
    flex: '1'
  },
  categoryGroup: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  categoryBtn: {
    padding: '8px 14px',
    borderRadius: '6px',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#333',
    backgroundColor: '#121214',
    color: '#aaa',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.2s'
  },
  activeCategoryBtn: {
    backgroundColor: '#2563eb',
    color: '#fff',
    borderColor: '#2563eb'
  },
  sortSelect: {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #333',
    backgroundColor: '#121214',
    color: '#fff',
    fontSize: '14px',
    cursor: 'pointer'
  }
};