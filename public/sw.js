// Anna Seva (अन्न सेवा) Progressive Web App Service Worker
const CACHE_NAME = 'anna-seva-cache-v1';
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/trust_logo.jpg',
  '/favicon.ico'
];

// Install: precache critical shell assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[Anna Seva SW] Precache partial error (normal in dev):', err);
      });
    })
  );
});

// Activate: clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Network-first with cache fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Bypass API requests and chrome-extension
  if (url.pathname.startsWith('/api/') || url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache valid static responses
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch(() => {});
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If navigation fails, return cached home page
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});

// Web Push Notification Event Listener
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || '🚨 अन्न सेवा — नवीन अन्न उपलब्धता (New Surplus Food Alert!)';
  const options = {
    body: data.body || '५० पॅकेट ताजे जेवण उपलब्ध झाले आहे. वाटपासाठी त्वरित दावा करा. (Fresh meals available for collection).',
    icon: data.icon || '/icon.png',
    badge: data.badge || '/icon-192.png',
    tag: data.tag || 'anna-seva-rescue-alert',
    renotify: true,
    vibrate: [200, 100, 200, 100, 250],
    data: {
      url: data.url || '/available-food',
      dateOfArrival: Date.now()
    },
    actions: [
      { action: 'view_food', title: '🍲 अन्न यादी पहा (View Food)' },
      { action: 'close', title: '✕ बंद करा (Dismiss)' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification Click Event Listener
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/available-food';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing tab if open
      for (let client of windowClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Client communication message listener
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'TRIGGER_TEST_NOTIFICATION') {
    const title = event.data.title || '🚨 अन्न सेवा — नवीन अन्न उपलब्धता!';
    const options = {
      body: event.data.body || '५०+ ताजे जेवण उपलब्ध झाले आहे. वाटपासाठी त्वरित दावा करा.',
      icon: '/icon.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      data: { url: '/available-food' },
      actions: [
        { action: 'view_food', title: '🍲 अन्न यादी पहा (View Food)' },
        { action: 'close', title: '✕ बंद करा (Dismiss)' }
      ]
    };
    self.registration.showNotification(title, options);
  }
});
