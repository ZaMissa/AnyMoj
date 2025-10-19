// Service Worker for AnyMoj PWA
const CACHE_NAME = 'anymoj-v1';
const STATIC_CACHE = 'anymoj-static-v1';
const DYNAMIC_CACHE = 'anymoj-dynamic-v1';

// Files to cache immediately
const STATIC_ASSETS = [
  '/AnyMoj/',
  '/AnyMoj/index.html',
  '/AnyMoj/manifest.json',
  '/AnyMoj/icons/icon-192x192.png',
  '/AnyMoj/icons/icon-512x512.png',
  '/AnyMoj/favicon.ico'
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
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Skip external requests (not from our domain)
  try {
    const url = new URL(request.url);
    if (!url.hostname.includes('zamissa.github.io')) {
      return;
    }
  } catch (e) {
    return;
  }

  event.respondWith(
    handleFetchRequest(request)
  );
});

// Handle fetch requests with proper error handling
async function handleFetchRequest(request) {
  try {
    // Try cache first for all assets (including chunks)
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Try network
    const networkResponse = await fetch(request);
    
    // Cache successful responses in dynamic cache
    if (networkResponse && networkResponse.status === 200) {
      const responseToCache = networkResponse.clone();
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, responseToCache);
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('Network request failed, trying cache:', request.url);
    
    // Try cache as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // For navigation requests, return the main page
    if (request.mode === 'navigate') {
      const fallbackResponse = await caches.match('/AnyMoj/');
      if (fallbackResponse) {
        return fallbackResponse;
      }
    }
    
    // For JavaScript chunks, return a minimal response to prevent ChunkLoadError
    if (request.url.includes('.js') && request.url.includes('/static/js/')) {
      return new Response('// Chunk not available offline', {
        status: 200,
        headers: { 'Content-Type': 'application/javascript' }
      });
    }
    
    // For CSS chunks, return a minimal response to prevent ChunkLoadError
    if (request.url.includes('.css') && request.url.includes('/static/css/')) {
      return new Response('/* CSS chunk not available offline */', {
        status: 200,
        headers: { 'Content-Type': 'text/css' }
      });
    }
    
    // If all else fails, return a proper error response
    return new Response('Offline - Content not available', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
  }
}

// Helper function to determine if a request is for a static asset
function isStaticAsset(url) {
  return url.includes('/AnyMoj/static/') ||
         url.includes('/AnyMoj/icons/') ||
         url.includes('/AnyMoj/manifest.json') ||
         url.includes('/AnyMoj/favicon.ico') ||
         url.includes('/AnyMoj/index.html') ||
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
