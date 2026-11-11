import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    try {
      setError('');
      await signup(email, password);
      navigate('/profile');
    } catch (err) {
      setError('Failed to create an account: ' + err.message);
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '24px', background: '#1e1e1e', borderRadius: '8px' }}>
      <h2>Sign Up</h2>
      {error && <div style={{ color: '#ef4444', marginBottom: '12px' }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input 
          type="email" placeholder="Email" value={email} 
          onChange={(e) => setEmail(e.target.value)} required 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
        />
        <input 
          type="password" placeholder="Password" value={password} 
          onChange={(e) => setPassword(e.target.value)} required 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
        />
        <input 
          type="password" placeholder="Confirm Password" value={confirmPassword} 
          onChange={(e) => setConfirmPassword(e.target.value)} required 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
        />
        <button type="submit" style={{ padding: '10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Sign Up
        </button>
      </form>
      <p style={{ marginTop: '16px', textAlign: 'center' }}>
        Already have an account? <Link to="/login" style={{ color: '#60a5fa' }}>Log In</Link>
      </p>
    </div>
  );
}