import { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { readLocalBuild, syncPendingBuild } from '../services/userData';

export default function RootLayout() {
  const { currentUser, logout } = useAuth();
  const [logoutError, setLogoutError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(() => Boolean(window.pwaUpdateAvailable));
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [buildSyncMessage, setBuildSyncMessage] = useState('');
  const [buildSyncError, setBuildSyncError] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const onUpdateAvailable = () => setUpdateAvailable(true);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('pwa:update-available', onUpdateAvailable);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('pwa:update-available', onUpdateAvailable);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    const userId = currentUser?.uid;

    const syncBuild = async (targetUserId) => {
      if (!targetUserId) {
        if (!userId) {
          setBuildSyncError(false);
          setBuildSyncMessage('Build saved on this device. Sign in to sync it across devices.');
        }
        return;
      }
      if (targetUserId !== userId) return;

      const localBuild = readLocalBuild(targetUserId);
      if (!localBuild?.pending) return;
      if (!navigator.onLine) {
        setBuildSyncError(false);
        setBuildSyncMessage('Offline: your build is saved here and will sync when connection returns.');
        return;
      }

      setBuildSyncError(false);
      setBuildSyncMessage('Syncing your build to your account...');
      try {
        await syncPendingBuild(targetUserId);
        if (!ignore) {
          setBuildSyncError(false);
          setBuildSyncMessage('Your build is synced with your account.');
        }
      } catch (error) {
        console.error('Failed to sync the locally saved build:', error);
        if (!ignore) {
          setBuildSyncError(true);
          setBuildSyncMessage('Build remains saved on this device. Sync failed; try again when online.');
        }
      }
    };

    const handleBuildUpdated = (event) => {
      syncBuild(event.detail?.userId || null);
    };
    const handleOnline = () => syncBuild(userId);
    const handleOffline = () => {
      if (userId && readLocalBuild(userId)?.pending) {
        setBuildSyncError(false);
        setBuildSyncMessage('Offline: your build is saved here and will sync when connection returns.');
      }
    };

    window.addEventListener('pwa:build-updated', handleBuildUpdated);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    if (userId) syncBuild(userId);

    return () => {
      ignore = true;
      window.removeEventListener('pwa:build-updated', handleBuildUpdated);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentUser?.uid]);

  const handleInstall = async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
    } catch (error) {
      console.error('Failed to show the install prompt:', error);
    }
  };

  const handleUpdate = () => {
    window.dispatchEvent(new Event('pwa:activate-update'));
  };

  const closeMobileNav = () => setMobileNavOpen(false);

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

  const linkStyle = ({ isActive }) => ({
    color: isActive ? '#ff6b6b' : '#b0b0b0',
    fontWeight: isActive ? 'bold' : 'normal',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
  });

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-brand">
          <h2 className="site-title">PC Builder SPA</h2>
          <button
            type="button"
            className="mobile-nav-toggle"
            aria-expanded={mobileNavOpen}
            aria-controls="primary-navigation"
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            {mobileNavOpen ? 'Close menu' : 'Menu'}
          </button>
        </div>

        <nav
          id="primary-navigation"
          className={`primary-navigation${mobileNavOpen ? ' is-open' : ''}`}
          aria-label="Main navigation"
        >
          <NavLink to="/" style={linkStyle} end onClick={closeMobileNav}>Home</NavLink>
          <NavLink to="items" style={linkStyle} onClick={closeMobileNav}>Catalog</NavLink>
          <NavLink to="summary" style={linkStyle} onClick={closeMobileNav}>Summary & Export</NavLink>
          <NavLink to="dashboard" style={linkStyle} onClick={closeMobileNav}>Dashboard</NavLink>
          <NavLink to="about" style={linkStyle} onClick={closeMobileNav}>About</NavLink>
        </nav>

        <nav className="account-navigation" aria-label="Account navigation">
          {installPrompt && (
            <button type="button" className="install-button" onClick={handleInstall}>
              Install App
            </button>
          )}
          {currentUser ? (
            <>
              <NavLink to="profile" style={linkStyle}>Profile</NavLink>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="logout-button"
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

      <div className={`connection-status ${isOnline ? 'is-online' : 'is-offline'}`} role="status">
        {isOnline ? 'Online' : 'Offline — saved public catalog remains available'}
      </div>

      {buildSyncMessage && (
        <div className={`build-sync-status${buildSyncError ? ' has-error' : ''}`} role="status">
          <span>{buildSyncMessage}</span>
          {buildSyncError && currentUser && (
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('pwa:build-updated', {
                detail: { userId: currentUser.uid },
              }))}
            >
              Retry sync
            </button>
          )}
        </div>
      )}

      {updateAvailable && (
        <div className="update-notice" role="status">
          <span>A new version is ready.</span>
          <button type="button" onClick={handleUpdate}>Update now</button>
        </div>
      )}

      {logoutError && (
        <p role="alert" className="logout-error">
          {logoutError}
        </p>
      )}

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
