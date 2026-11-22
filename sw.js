// Service worker: la app abre sin señal. Los datos van y vienen de Sheets por la red.
const CACHE = 'ftth-58f0c8266b';
const BASICOS = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASICOS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;                                   // la API (POST) siempre por la red
  const u = new URL(r.url);
  if (/script\.google(usercontent)?\.com|openstreetmap|nominatim/.test(u.hostname)) return;   // datos, mapa y direcciones: red
  if (r.mode === 'navigate') {                                       // la app: red primero (versión nueva), si no hay señal la guardada
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(CACHE).then(k => k.put('./index.html', c)); return res; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => {   // íconos, librerías: guardados
    if (res.ok || res.type === 'opaque') { const c = res.clone(); caches.open(CACHE).then(k => k.put(r, c)); }
    return res;
  })));
});
