import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Logged in successfully as ${email || 'Guest'}!`);
    navigate('/items');
  };

  return (
    <div style={{ padding: '60px 24px', maxWidth: '400px', margin: '0 auto', color: '#fff' }}>
      <div style={{ backgroundColor: '#1f2937', padding: '32px', borderRadius: '8px', border: '1px solid #374151' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '24px', textAlign: 'center' }}>Sign In</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', color: '#9ca3af' }}>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="user@example.com"
              style={{ width: '100%', padding: '10px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '4px', color: '#fff' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', color: '#9ca3af' }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              style={{ width: '100%', padding: '10px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '4px', color: '#fff' }}
            />
          </div>
          <button 
            type="submit" 
            style={{ padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;