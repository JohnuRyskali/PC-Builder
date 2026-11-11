import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      await login(email, password);
      navigate('/profile');
    } catch (err) {
      setError('Failed to sign in: ' + err.message);
    }
  }

  async function handleGoogleSignIn() {
    try {
      setError('');
      await loginWithGoogle();
      navigate('/profile');
    } catch (err) {
      setError('Failed to sign in with Google: ' + err.message);
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '24px', background: '#1e1e1e', borderRadius: '8px' }}>
      <h2>Log In</h2>
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
        <button type="submit" style={{ padding: '10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Log In
        </button>
      </form>
      <button onClick={handleGoogleSignIn} style={{ width: '100%', marginTop: '12px', padding: '10px', background: '#db4437', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Sign In with Google
      </button>
      <p style={{ marginTop: '16px', textAlign: 'center' }}>
        Need an account? <Link to="/signup" style={{ color: '#60a5fa' }}>Sign Up</Link>
      </p>
    </div>
  );
}