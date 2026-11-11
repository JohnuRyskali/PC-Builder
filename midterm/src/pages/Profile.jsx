import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { currentUser, logout } = useAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      setError('');
      await logout();
      navigate('/login');
    } catch {
      setError('Failed to log out');
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '24px', background: '#1e1e1e', borderRadius: '8px' }}>
      <h2>User Profile</h2>
      {error && <div style={{ color: '#ef4444', marginBottom: '12px' }}>{error}</div>}
      <div style={{ marginBottom: '16px' }}>
        <p><strong>Email:</strong> {currentUser?.email}</p>
        <p><strong>UID:</strong> {currentUser?.uid}</p>
      </div>
      <button onClick={handleLogout} style={{ width: '100%', padding: '10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Log Out
      </button>
    </div>
  );
}