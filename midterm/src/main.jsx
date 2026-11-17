import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return;

  try {
    const registration = await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
    let reloadForUpdate = false;
    let reloaded = false;

    const notifyUpdateAvailable = () => {
      window.pwaUpdateAvailable = true;
      window.dispatchEvent(new CustomEvent('pwa:update-available'));
    };

    if (registration.waiting && navigator.serviceWorker.controller) {
      notifyUpdateAvailable();
    }

    registration.addEventListener('updatefound', () => {
      const installingWorker = registration.installing;
      installingWorker?.addEventListener('statechange', () => {
        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
          notifyUpdateAvailable();
        }
      });
    });

    window.addEventListener('pwa:activate-update', () => {
      if (!registration.waiting) return;
      reloadForUpdate = true;
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!reloadForUpdate || reloaded) return;
      reloaded = true;
      window.location.reload();
    });
  } catch (error) {
    console.error('Service worker registration failed:', error);
  }
};

registerServiceWorker();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);