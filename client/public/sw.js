// Service Worker for caching static assets and API responses
const CACHE_NAME = 'salary-predictor-v1';
const STATIC_CACHE = 'static-v1';
const API_CACHE = 'api-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// API endpoints to cache
const CACHEABLE_APIS = [
  '/api/analytics/stats',
  '/api/analytics/department-salaries',
  '/api/analytics/experience-salaries',
  '/api/model-metrics',
  '/api/model-status'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  event.respondWith(handleStaticRequest(request));
});

async function handleApiRequest(request) {
  const url = new URL(request.url);
  const isGET = request.method === 'GET';
  const isCacheable = CACHEABLE_APIS.some(api => url.pathname.startsWith(api));

  if (isGET && isCacheable) {
    try {
      // Try cache first
      const cache = await caches.open(API_CACHE);
      const cachedResponse = await cache.match(request);
      
      if (cachedResponse) {
        // Check if cache is still fresh (5 minutes)
        const cacheDate = new Date(cachedResponse.headers.get('date'));
        const now = new Date();
        const isStale = (now - cacheDate) > 5 * 60 * 1000; // 5 minutes
        
        if (!isStale) {
          console.log('Serving from cache:', url.pathname);
          return cachedResponse;
        }
      }

      // Fetch from network
      const networkResponse = await fetch(request);
      
      if (networkResponse.ok) {
        // Cache successful responses
        const responseClone = networkResponse.clone();
        cache.put(request, responseClone);
        console.log('Cached API response:', url.pathname);
      }
      
      return networkResponse;
    } catch (error) {
      console.error('API request failed:', error);
      // Try to serve stale cache as fallback
      const cache = await caches.open(API_CACHE);
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        console.log('Serving stale cache as fallback:', url.pathname);
        return cachedResponse;
      }
      throw error;
    }
  }

  // For non-cacheable API requests, just fetch
  return fetch(request);
}

async function handleStaticRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fetch from network
    const networkResponse = await fetch(request);
    
    // Cache successful responses for static assets
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Static request failed:', error);
    
    // For navigation requests, try to serve index.html from cache
    if (request.mode === 'navigate') {
      const cache = await caches.open(STATIC_CACHE);
      return cache.match('/index.html');
    }
    
    throw error;
  }
}