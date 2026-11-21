/* Drankkassa offline-werking.
   Verhoog CACHE bij elke nieuwe versie, anders blijven toestellen de oude versie tonen. */
const CACHE = 'drankkassa-v2';
const BESTANDEN = [
  './', 'index.html', 'manifest.webmanifest',
  'fonts/fonts.css', 'fonts/BarlowCondensed-600.woff2', 'fonts/BarlowCondensed-700.woff2', 'fonts/Inter.woff2',
  'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BESTANDEN)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

/* Altijd meteen uit het toestel laden (snel, ook zonder internet).
   Is er internet, dan wordt op de achtergrond de nieuwste versie opgehaald voor de volgende keer. */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const sleutel = req.mode === 'navigate' ? 'index.html' : req;
  e.respondWith(caches.open(CACHE).then(async c => {
    const bewaard = await c.match(sleutel, { ignoreSearch: true });
    const vers = fetch(req).then(r => { if (r.ok) c.put(sleutel, r.clone()); return r; }).catch(() => null);
    if (bewaard) { e.waitUntil(vers); return bewaard; }
    return (await vers) || new Response('Offline', { status: 503 });
  }));
});
