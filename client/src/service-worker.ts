/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { clientsClaim } from 'workbox-core';

declare const self: ServiceWorkerGlobalScope;

// Enable workbox debugging in development mode only
if (import.meta.env.DEV) {
  self.__WB_DISABLE_DEV_LOGS = false;
} else {
  self.__WB_DISABLE_DEV_LOGS = true;
}

// Skip waiting and claim clients to update service worker immediately
self.skipWaiting();
clientsClaim();

// Clean up outdated precaches
cleanupOutdatedCaches();

// Precache all assets in manifest
precacheAndRoute(self.__WB_MANIFEST || []);

// Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
registerRoute(
  /^https:\/\/fonts\.googleapis\.com/,
  new StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets',
  })
);

// Cache the underlying font files with a cache-first strategy for 1 year.
registerRoute(
  /^https:\/\/fonts\.gstatic\.com/,
  new CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        maxEntries: 30,
      }),
    ],
  })
);

// Cache images with a cache-first strategy
registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);

// Cache API requests with a network-first strategy
registerRoute(
  /^\/api\//,
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
        // Automatically cleanup if quota is exceeded
        purgeOnQuotaError: true,
      }),
    ],
  })
);

// Cache other static assets with a stale-while-revalidate strategy
registerRoute(
  /\.(?:js|css)$/,
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
  })
);

// Fallback route for navigation requests
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      }),
    ],
  })
);

// Handle offline fallback
const FALLBACK_HTML_URL = '/offline.html';
const OFFLINE_PAGE_CACHE_NAME = 'offline-page';

// Cache the offline page on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(OFFLINE_PAGE_CACHE_NAME);
      await cache.add(new Request(FALLBACK_HTML_URL, { cache: 'reload' }));
    })()
  );
});

// Offline fallback for navigation requests
registerRoute(
  ({ request }) => request.mode === 'navigate',
  async ({ event }) => {
    if (!event) return new Response('No event available', { status: 500 });
    
    try {
      // Try to fetch from network first
      const fetchEvent = event as FetchEvent;
      return await new NetworkFirst({
        cacheName: 'pages',
      }).handle({ 
        request: new Request(fetchEvent.request.url), 
        event: fetchEvent 
      });
    } catch (error) {
      // If offline, return the offline page
      const cache = await caches.open(OFFLINE_PAGE_CACHE_NAME);
      return (await cache.match(FALLBACK_HTML_URL)) as Response;
    }
  }
);

// Listen for push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  
  const title = data.title || 'TinyTracks';
  const options = {
    body: data.body || 'New notification from TinyTracks',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: data.data || {},
  };
  
  event.waitUntil(self.registration.showNotification(title, options));
});

// Listen for notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data?.url) {
    event.waitUntil(
      self.clients.openWindow(event.notification.data.url)
    );
  } else {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});
