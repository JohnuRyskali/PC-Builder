import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export function RootLayout() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111', color: '#fff', fontFamily: 'sans-serif' }}>
      <nav style={{ display: 'flex', gap: '20px', padding: '16px 24px', backgroundColor: '#1f2937', borderBottom: '1px solid #374151' }}>
        <Link to="/" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 'bold' }}>Home</Link>
        <Link to="/items" style={{ color: '#60a5fa', textDecoration: 'none' }}>Catalog / Items</Link>
        <Link to="/dashboard" style={{ color: '#60a5fa', textDecoration: 'none' }}>Dashboard</Link>
        <Link to="/about" style={{ color: '#60a5fa', textDecoration: 'none' }}>About</Link>
        <Link to="/login" style={{ color: '#60a5fa', textDecoration: 'none', marginLeft: 'auto' }}>Login</Link>
      </nav>

      {/* Место для рендеринга текущего дочернего роута */}
      <main style={{ padding: '24px' }}>
        <Outlet />
      </main>
    </div>
  );
}