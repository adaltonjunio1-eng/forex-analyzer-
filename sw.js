// Service Worker for Forex Analyzer PWA
const CACHE_NAME = 'forex-analyzer-v1.4.0';
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;
const API_CACHE = `${CACHE_NAME}-api`;

// Resources to cache immediately (critical app shell)
const STATIC_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './css/style.css',
    './js/app.js',
    './js/chart.js',
    './js/indicators.js',
    './js/patterns.js',
    './js/signals.js',
    './js/utils.js',
    './js/news.js',
    './js/pullback.js',
    './js/pullback-multi.js',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Resources to cache dynamically
const DYNAMIC_ASSETS = [
    './debug.html',
    './debug-simple.html',
    './test-modules.html',
    './test-button.html'
];

// API endpoints to cache
const API_PATTERNS = [
    /forex-api/,
    /currency-data/,
    /market-data/
];

// Install Event - Cache static assets
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('📦 Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('✅ Static assets cached successfully');
                return self.skipWaiting(); // Force activation
            })
            .catch((error) => {
                console.error('❌ Failed to cache static assets:', error);
            })
    );
});

// Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && 
                            cacheName !== DYNAMIC_CACHE && 
                            cacheName !== API_CACHE) {
                            console.log('🗑️ Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker activated');
                return self.clients.claim(); // Take control immediately
            })
    );
});

// Fetch Event - Serve cached content with network fallback
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests and chrome-extension requests
    if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
        return;
    }
    
    // Handle different types of requests
    if (isStaticAsset(request.url)) {
        event.respondWith(handleStaticAsset(request));
    } else if (isAPIRequest(request.url)) {
        event.respondWith(handleAPIRequest(request));
    } else {
        event.respondWith(handleDynamicRequest(request));
    }
});

// Check if request is for static asset
function isStaticAsset(url) {
    return STATIC_ASSETS.some(asset => url.includes(asset)) ||
           url.includes('.css') ||
           url.includes('.js') ||
           url.includes('.png') ||
           url.includes('.jpg') ||
           url.includes('.ico') ||
           url.includes('font-awesome') ||
           url.includes('chart.js');
}

// Check if request is for API
function isAPIRequest(url) {
    return API_PATTERNS.some(pattern => pattern.test(url));
}

// Handle static assets (Cache First strategy)
async function handleStaticAsset(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
        
    } catch (error) {
        console.log('🔄 Serving from cache (offline):', request.url);
        return caches.match(request) || caches.match('./index.html');
    }
}

// Handle API requests (Network First with cache fallback)
async function handleAPIRequest(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(API_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
        
    } catch (error) {
        console.log('📡 Network failed, serving cached API data:', request.url);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return mock data for offline functionality
        return new Response(JSON.stringify({
            error: 'Offline mode',
            message: 'Dados em cache não disponíveis',
            timestamp: Date.now()
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Handle dynamic requests (Network First)
async function handleDynamicRequest(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
        
    } catch (error) {
        console.log('🔄 Serving from dynamic cache:', request.url);
        const cachedResponse = await caches.match(request);
        return cachedResponse || caches.match('./index.html');
    }
}

// Background Sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('🔄 Background sync triggered:', event.tag);
    
    if (event.tag === 'forex-data-sync') {
        event.waitUntil(syncForexData());
    }
});

// Sync forex data when back online
async function syncForexData() {
    try {
        console.log('📊 Syncing forex data...');
        // Here you would sync any offline actions/data
        // For now, we'll just log the action
        console.log('✅ Forex data sync completed');
    } catch (error) {
        console.error('❌ Forex data sync failed:', error);
    }
}

// Push notifications (for trading alerts)
self.addEventListener('push', (event) => {
    console.log('📢 Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'Nova análise de mercado disponível',
        icon: './assets/icon-192.png',
        badge: './assets/icon-72.png',
        tag: 'forex-alert',
        requireInteraction: true,
        actions: [
            {
                action: 'view',
                title: 'Ver Análise',
                icon: './assets/icon-96.png'
            },
            {
                action: 'dismiss',
                title: 'Dispensar'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Forex Analyzer', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('./#analysis')
        );
    }
});

// Share Target API (for sharing market data)
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    if (url.pathname === '/share' && event.request.method === 'GET') {
        event.respondWith(Response.redirect('./#share'));
    }
});

// Update notification when new version is available
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('🔧 Service Worker script loaded');