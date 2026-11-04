import React from 'react';
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div style={{ padding: '40px 24px', maxWidth: '1000px', margin: '0 auto', color: '#fff', textAlign: 'center' }}>
      <h1 style={{ fontSize: '36px', marginBottom: '16px', fontWeight: 'bold' }}>
        Welcome to PC Part Picker & Compatibility System
      </h1>
      <p style={{ fontSize: '18px', color: '#9ca3af', marginBottom: '32px', lineHeight: '1.6' }}>
        Easily build your custom PC, check component compatibility in real time, analyze power consumption (TDP), and manage your hardware catalog.
      </p>

      <div style={{ 
        backgroundColor: '#1f2937', 
        padding: '60px 20px', 
        borderRadius: '12px', 
        border: '1px solid #374151',
        marginBottom: '40px',
        fontSize: '20px',
        color: '#60a5fa',
        fontWeight: 'bold'
      }}>
        🚀 High-Performance Hardware Builder & Analytics Dashboard
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <Link 
          to="/items" 
          style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold' }}
        >
          Explore Catalog →
        </Link>
        <Link 
          to="/dashboard" 
          style={{ padding: '12px 24px', backgroundColor: '#374151', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold' }}
        >
          View Dashboard
        </Link>
      </div>
    </div>
  );
}

export default Home;