import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchComponents } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [itemResult, setItemResult] = useState({ key: null, item: null, error: null });
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;
  const queryKey = `${userId || 'guest'}:${id}`;
  const loading = itemResult.key !== queryKey;
  const item = loading ? null : itemResult.item;
  const error = loading ? null : itemResult.error;

  useEffect(() => {
    let ignore = false;

    fetchComponents(userId)
      .then((data) => {
        if (!ignore) {
          const found = data.find((comp) => String(comp.id) === String(id));

          if (found) {
            setItemResult({ key: queryKey, item: found, error: null });
          } else {
            setItemResult({ key: queryKey, item: null, error: 'Item not found.' });
          }
        }
      })
      .catch((err) => {
        if (!ignore) {
          setItemResult({
            key: queryKey,
            item: null,
            error: err.message || 'Failed to fetch item details',
          });
        }
      });

    return () => {
      ignore = true;
    };
  }, [id, queryKey, userId]);

  if (loading) {
    return <div style={{ color: '#fff', padding: '40px', textAlign: 'center' }}>Loading item details...</div>;
  }

  if (error || !item) {
    return (
      <div style={{ color: '#f87171', padding: '40px', textAlign: 'center' }}>
        <h2>{error || 'Item missing'}</h2>
        <p style={{ color: '#aaa', marginTop: '8px' }}>The component you are looking for does not exist or was removed.</p>
        <Link to="/items" style={{ color: '#60a5fa', textDecoration: 'underline', display: 'inline-block', marginTop: '16px' }}>
          Back to All Items
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', color: '#fff' }}>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ padding: '8px 16px', backgroundColor: '#374151', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          ← Back
        </button>
        <Link 
          to="/items"
          style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', textDecoration: 'none', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
        >
          All Items
        </Link>
      </div>

      <div style={{ backgroundColor: '#1f2937', padding: '24px', borderRadius: '8px', border: '1px solid #374151' }}>
        <span style={{ fontSize: '12px', textTransform: 'uppercase', backgroundColor: '#374151', padding: '4px 8px', borderRadius: '4px', color: '#9ca3af' }}>
          {item.category}
        </span>
        <h1 style={{ fontSize: '24px', margin: '12px 0 16px 0' }}>{item.name}</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px', color: '#d1d5db' }}>
          <p><strong>Price:</strong> ${item.price ?? 'N/A'}</p>
          <p><strong>TDP / Power:</strong> {item.tdp ? `${item.tdp}W` : 'N/A'}</p>
          <p><strong>Socket / Compatibility:</strong> {item.socket || item.memoryType || 'N/A'}</p>
          <p><strong>Manufacturer / Brand:</strong> {item.brand || 'Standard'}</p>
          <p><strong>Rating:</strong> {item.rating ? `${item.rating} / 5` : 'N/A'}</p>
          <p><strong>ID:</strong> {item.id}</p>
          <p><strong>Status:</strong> Available</p>
        </div>

        {item.description && (
          <div style={{ marginTop: '24px', borderTop: '1px solid #374151', paddingTop: '16px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Description</h3>
            <p style={{ color: '#9ca3af', lineHeight: '1.5' }}>{item.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ItemDetails;