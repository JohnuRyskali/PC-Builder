import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Offline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <section className="offline-page">
      <h1>You are offline</h1>
      <p>
        {isOnline
          ? 'Your connection is back. Retry the page to continue.'
          : 'This page needs a connection. Your saved public hardware catalog is still available.'}
      </p>
      <div className="offline-actions">
        <button type="button" onClick={() => window.location.reload()}>Retry connection</button>
        <Link to="/items">Open saved catalog</Link>
      </div>
    </section>
  );
}
