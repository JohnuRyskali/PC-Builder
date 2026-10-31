import React from 'react';
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div style={{ padding: '80px 24px', textAlign: 'center', color: '#fff' }}>
      <h1 style={{ fontSize: '64px', margin: '0 0 16px 0', color: '#f87171' }}>404</h1>
      <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>Page Not Found</h2>
      <p style={{ color: '#9ca3af', marginBottom: '24px' }}>The page you are looking for does not exist or has been moved.</p>
      <Link 
        to="/" 
        style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold' }}
      >
        Go Back Home
      </Link>
    </div>
  );
}

export default NotFound;