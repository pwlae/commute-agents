// Offline support. Only touches caches named cag-*, because other sites on
// the same origin (pwlae.github.io) keep their own caches.
// Try the network first (with a short timeout for weak
// signal), fall back to the cached copy. Diagrams never change once rendered
// (their names are content hashes), so they are served from cache first.
const CACHE = 'cag-v1';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.add('./')));
  self.skipWaiting();
});
self.addEventListener('activate', e => e.waitUntil(
  caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('cag-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
));

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;

  if (url.pathname.includes('/diagrams/')) {
    e.respondWith(caches.match(req).then(hit => hit || fetchAndCache(req)));
    return;
  }
  e.respondWith(
    Promise.race([
      fetchAndCache(req),
      new Promise((_, reject) => setTimeout(reject, 4000)),
    ]).catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req)))
  );
});

function fetchAndCache(req) {
  return fetch(req).then(res => {
    if (res.ok) {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
    }
    return res;
  });
}
