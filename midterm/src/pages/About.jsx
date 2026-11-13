import React from 'react';
import { Link } from 'react-router-dom';

export function About() {
  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', color: '#fff', lineHeight: '1.6' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '16px' }}>About PC-Builder Project</h1>
      <p style={{ color: '#d1d5db', marginBottom: '16px' }}>
        This application is a modern web tool designed for PC enthusiasts, gamers, and system builders. It allows users to filter components, check hardware compatibility (sockets, memory types, power limits), and build custom PCs. Signed-in users can save their builds and custom hardware to Firebase and access them across devices. Guest builds are temporary and last only until the page is reloaded.
      </p>
      <p style={{ color: '#d1d5db', marginBottom: '24px' }}>
        Built with React, Vite, React Router, and modular architecture to provide a seamless SPA (Single Page Application) experience.
      </p>
      <Link to="/items" style={{ color: '#60a5fa', textDecoration: 'underline' }}>
        ← Back to Catalog
      </Link>
    </div>
  );
}

export default About;