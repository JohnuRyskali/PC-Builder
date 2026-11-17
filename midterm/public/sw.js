const CACHE_NAME = 'pc-builder-static-__BUILD_VERSION__';
const PUBLIC_DATA_CACHE = 'pc-builder-public-data-v1';
const PUBLIC_DATA_MAX_ENTRIES = 50;
const PUBLIC_DATA_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const APP_BASE_URL = new URL(self.registration.scope);
const APP_BASE_PATH = APP_BASE_URL.pathname;
const APP_SHELL = [
  APP_BASE_URL.href,
  new URL('index.html', APP_BASE_URL).href,
  new URL('offline.html', APP_BASE_URL).href,
  new URL('manifest.webmanifest', APP_BASE_URL).href,
  new URL('pwa-icon-192.png', APP_BASE_URL).href,
  new URL('pwa-icon-512.png', APP_BASE_URL).href,
  new URL('build-manifest.json', APP_BASE_URL).href,
];

function isPublicCatalogRequest(url) {
  return url.origin === self.location.origin
    && url.pathname.startsWith(`${APP_BASE_PATH}api/public/components`);
}

function withHeader(response, name, value) {
  const headers = new Headers(response.headers);
  headers.set(name, value);
  return new Response(response.clone().body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function prunePublicDataCache(cache) {
  const requests = await cache.keys();
  const entries = await Promise.all(requests.map(async (request) => {
    const response = await cache.match(request, { ignoreVary: true });
    const cachedAt = Number(response.headers.get('X-PWA-Cached-At')) || 0;
    return { request, cachedAt };
  }));
  const now = Date.now();
  const validEntries = entries
    .filter(({ cachedAt }) => cachedAt && now - cachedAt <= PUBLIC_DATA_MAX_AGE)
    .sort((a, b) => b.cachedAt - a.cachedAt);

  await Promise.all(entries
    .filter(({ cachedAt }) => !cachedAt || now - cachedAt > PUBLIC_DATA_MAX_AGE)
    .map(({ request }) => cache.delete(request)));
  await Promise.all(validEntries
    .slice(PUBLIC_DATA_MAX_ENTRIES)
    .map(({ request }) => cache.delete(request)));
}

async function fetchPublicCatalog(request) {
  const cache = await caches.open(PUBLIC_DATA_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cachedResponse = withHeader(response, 'X-PWA-Cached-At', String(Date.now()));
      await cache.put(request, cachedResponse);
      await prunePublicDataCache(cache);
      return withHeader(response, 'X-PWA-Cache', 'NETWORK');
    }
    return response;
  } catch {
    const cachedResponse = await cache.match(request, { ignoreVary: true });
    if (cachedResponse) return withHeader(cachedResponse, 'X-PWA-Cache', 'HIT');
    return new Response(JSON.stringify({ error: 'Public catalog is not available offline.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
}

async function fetchNavigation(request) {
  const staticCache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) return response;
    const appShell = await staticCache.match(new URL('index.html', APP_BASE_URL).href, { ignoreVary: true });
    if (appShell) return appShell;
  } catch {
    const appShell = await staticCache.match(new URL('index.html', APP_BASE_URL).href, { ignoreVary: true });
    if (appShell) return appShell;
  }

  return (await staticCache.match(new URL('offline.html', APP_BASE_URL).href, { ignoreVary: true }))
    || Response.error();
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);

    const manifestResponse = await cache.match(
      new URL('build-manifest.json', APP_BASE_URL).href,
      { ignoreVary: true },
    );
    const buildManifest = await manifestResponse.json();
    const assetUrls = new Set();

    Object.values(buildManifest).forEach((entry) => {
      [entry.file, ...(entry.css || []), ...(entry.assets || [])]
        .filter(Boolean)
        .forEach((assetPath) => {
          const assetUrl = new URL(assetPath, APP_BASE_URL);
          if (assetUrl.origin === self.location.origin) assetUrls.add(assetUrl.href);
        });
    });

    await cache.addAll([...assetUrls]);
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames
      .filter((name) => name.startsWith('pc-builder-static-') && name !== CACHE_NAME)
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const requestUrl = new URL(request.url);

  if (request.method !== 'GET' || requestUrl.origin !== self.location.origin) return;

  if (isPublicCatalogRequest(requestUrl)) {
    event.respondWith(fetchPublicCatalog(request));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(fetchNavigation(request));
    return;
  }

  const isStaticAsset = requestUrl.pathname.startsWith(`${APP_BASE_PATH}assets/`)
    || requestUrl.pathname.startsWith(`${APP_BASE_PATH}pwa-icon-`)
    || requestUrl.pathname === new URL('manifest.webmanifest', APP_BASE_URL).pathname;

  if (!isStaticAsset) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request, { ignoreVary: true });
    if (cachedResponse) return cachedResponse;

    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  })());
});
