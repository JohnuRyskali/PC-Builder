import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RootLayout() {
  const { currentUser, logout } = useAuth();
  const [logoutError, setLogoutError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      setLogoutError('');
      setLoggingOut(true);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
      setLogoutError(error.message || 'Failed to log out. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  // Adjusted active colors to look great on a dark background (#121212)
  const linkStyle = ({ isActive }) => ({
    color: isActive ? '#ff6b6b' : '#b0b0b0',
    fontWeight: isActive ? 'bold' : 'normal',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121212', color: '#fff' }}>
      <header style={{ padding: '16px 24px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#fff' }}>PC Builder SPA</h2>
          <nav style={{ display: 'flex', gap: '16px' }}>
            <NavLink to="/" style={linkStyle} end>Home</NavLink>
            <NavLink to="items" style={linkStyle}>Catalog</NavLink>
            <NavLink to="summary" style={linkStyle}>Summary & Export</NavLink>
          </nav>
        </div>

        <nav style={{ display: 'flex', gap: '16px' }}>
          {currentUser ? (
            <>
              <NavLink to="profile" style={linkStyle}>Profile</NavLink>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#b0b0b0',
                  font: 'inherit',
                  cursor: loggingOut ? 'wait' : 'pointer',
                }}
              >
                {loggingOut ? 'Logging out...' : 'Log Out'}
              </button>
            </>
          ) : (
            <>
              <NavLink to="login" style={linkStyle}>Login</NavLink>
              <NavLink to="signup" style={linkStyle}>Sign Up</NavLink>
            </>
          )}
        </nav>
      </header>
      {logoutError && (
        <p role="alert" style={{ color: '#f87171', textAlign: 'right', margin: '8px 24px 0' }}>
          {logoutError}
        </p>
      )}

      <main style={{ padding: '24px' }}>
        <Outlet />
      </main>
    </div>
  );
}