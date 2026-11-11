import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RootLayout() {
  const { currentUser } = useAuth();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121212', color: '#fff' }}>
      <header style={{ padding: '16px 24px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>PC Builder SPA</h2>
          <nav style={{ display: 'flex', gap: '16px' }}>
            <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Home</Link>
            <Link to="items" style={{ color: '#fff', textDecoration: 'none' }}>Catalog</Link>
            <Link to="summary" style={{ color: '#fff', textDecoration: 'none' }}>Summary & Export</Link>
          </nav>
        </div>

        <nav style={{ display: 'flex', gap: '16px' }}>
          {currentUser ? (
            <>
              <Link to="profile" style={{ color: '#60a5fa', textDecoration: 'none' }}>Profile</Link>
            </>
          ) : (
            <>
              <Link to="login" style={{ color: '#fff', textDecoration: 'none' }}>Login</Link>
              <Link to="signup" style={{ color: '#60a5fa', textDecoration: 'none' }}>Sign Up</Link>
            </>
          )}
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}