// Service Worker for AnyMoj PWA
const CACHE_NAME = 'anymoj-v1';
const STATIC_CACHE = 'anymoj-static-v1';
const DYNAMIC_CACHE = 'anymoj-dynamic-v1';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/favicon.ico'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Error caching static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Strategy: Cache First for static assets, Network First for API calls
  if (isStaticAsset(request.url)) {
    // Cache First strategy for static assets
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request)
            .then((response) => {
              // Don't cache non-successful responses
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              // Cache the response
              const responseToCache = response.clone();
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });
              
              return response;
            })
            .catch(() => {
              // Return offline fallback for navigation requests
              if (request.mode === 'navigate') {
                return caches.match('/');
              }
              throw new Error('Network error');
            });
        })
    );
  } else {
    // Network First strategy for dynamic content
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Cache successful responses
          const responseToCache = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then((cache) => {
              cache.put(request, responseToCache);
            });
          
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // Return offline fallback for navigation requests
              if (request.mode === 'navigate') {
                return caches.match('/');
              }
              
              throw new Error('Offline and no cache available');
            });
        })
    );
  }
});

// Helper function to determine if a request is for a static asset
function isStaticAsset(url) {
  return url.includes('/static/') ||
         url.includes('/icons/') ||
         url.includes('/manifest.json') ||
         url.includes('/favicon.ico') ||
         url.endsWith('.js') ||
         url.endsWith('.css') ||
         url.endsWith('.png') ||
         url.endsWith('.jpg') ||
         url.endsWith('.jpeg') ||
         url.endsWith('.svg') ||
         url.endsWith('.ico');
}

// Handle background sync (if needed in the future)
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag);
  // Future implementation for background data sync
});

// Handle push notifications (if needed in the future)
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  // Future implementation for push notifications
});

// Handle notification clicks (if needed in the future)
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  // Future implementation for notification handling
});
