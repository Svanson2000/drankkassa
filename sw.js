/* Drankkassa offline-werking.
   Verhoog CACHE bij elke nieuwe versie, anders blijven toestellen de oude versie tonen. */
const CACHE = 'drankkassa-v10';
const BESTANDEN = [
  './', 'index.html', 'manifest.webmanifest',
  'fonts/fonts.css', 'fonts/BarlowCondensed-600.woff2', 'fonts/BarlowCondensed-700.woff2', 'fonts/Inter.woff2',
  'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'
];
const WACHT_MS = 3000; // zo lang wachten op internet voor de pagina zelf, daarna de bewaarde versie

/* Installeren: altijd vers van de server halen (niet uit de tijdelijke browseropslag, die tot 10 min oud kan zijn) */
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(BESTANDEN.map(u => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  /* De pagina zelf: eerst internet (dus altijd de nieuwste versie), zonder internet of na 3 s de bewaarde versie */
  if (req.mode === 'navigate') {
    e.respondWith(caches.open(CACHE).then(async c => {
      const vers = fetch(req.url, { cache: 'no-cache' })
        .then(r => { if (r.ok) c.put('index.html', r.clone()); return r.ok ? r : null; })
        .catch(() => null);
      const bewaard = await c.match('index.html');
      if (!bewaard) return (await vers) || new Response('Offline', { status: 503 });
      const snel = await Promise.race([vers, new Promise(z => setTimeout(() => z(null), WACHT_MS))]);
      if (snel) return snel;
      e.waitUntil(vers);
      return bewaard;
    }));
    return;
  }

  /* Lettertypes, iconen …: meteen uit het toestel, op de achtergrond vers bijhalen */
  e.respondWith(caches.open(CACHE).then(async c => {
    const bewaard = await c.match(req, { ignoreSearch: true });
    const vers = fetch(req, { cache: 'no-cache' })
      .then(r => { if (r.ok) c.put(req, r.clone()); return r; })
      .catch(() => null);
    if (bewaard) { e.waitUntil(vers); return bewaard; }
    return (await vers) || new Response('Offline', { status: 503 });
  }));
});
