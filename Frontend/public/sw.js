const CACHE_NAME = 'eclinic-app-shell-v2';
const APP_SHELL = [
  '/',
  '/dashboard',
  '/dashboard/patients',
  '/dashboard/queue',
  '/dashboard/assistant',
  '/dashboard/docs',
  '/favicon.ico',
  '/offline.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for API, cache-first for others
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  const isApi = url.pathname.startsWith('/api/');

  // App Router navigations: provide offline fallback
  if (request.mode === 'navigate' && !isApi) {
    event.respondWith(
      fetch(request)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(url.pathname, copy));
          return resp;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          const cached = await cache.match(url.pathname) || await cache.match('/dashboard') || await cache.match('/');
          return cached || cache.match('/offline.html');
        })
    );
    return;
  }

  // API: network-first with cache fallback
  if (isApi) {
    event.respondWith(
      fetch(request)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return resp;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
