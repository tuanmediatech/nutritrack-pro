// NutriTrack Pro — Service Worker v7
// Offline support + background notification scheduling

const CACHE = 'nutritrack-v7';
const ASSETS = [
  './', './index.html', './style.css', './app.js', './manifest.json',
  './icons/icon-192.svg', './icons/icon-512.svg'
];

const scheduledNotifs = new Map();

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) {
    e.respondWith(fetch(e.request).catch(() => new Response('', { status: 408 })));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});

// Schedule background notifications from the SW context
// (SW stays alive longer on installed Android PWAs)
self.addEventListener('message', e => {
  const msg = e.data || {};

  if (msg.type === 'SCHEDULE_NOTIFICATION') {
    const { id, delay, title, body } = msg;
    if (scheduledNotifs.has(id)) clearTimeout(scheduledNotifs.get(id));
    if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
      const t = setTimeout(() => {
        self.registration.showNotification(title, {
          body,
          icon: './icons/icon-192.svg',
          badge: './icons/icon-192.svg',
          tag: id,
          renotify: true,
          vibrate: [200, 100, 200],
        });
        scheduledNotifs.delete(id);
      }, delay);
      scheduledNotifs.set(id, t);
    }
  }

  if (msg.type === 'CANCEL_NOTIFICATIONS') {
    scheduledNotifs.forEach(t => clearTimeout(t));
    scheduledNotifs.clear();
  }
});

// Tap notification → open/focus app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes(self.location.origin) && 'focus' in c) return c.focus();
      }
      return clients.openWindow('./');
    })
  );
});
