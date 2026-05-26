// Bugg service worker — offline-first PWA shell.
// Strategy:
//   - On install: precache app shell (HTML, JSX, JS, manifest, icons, fonts).
//   - For static assets (same origin): cache-first.
//   - For Supabase /api requests: network-first with cache fallback (so user keeps the
//     last fetched bug-of-the-day when offline).
//   - For Google Fonts: stale-while-revalidate.

const VERSION = "bugg-v3";
const CACHE_STATIC = `${VERSION}-static`;
const CACHE_RUNTIME = `${VERSION}-runtime`;
const CACHE_API = `${VERSION}-api`;

const APP_SHELL = [
  "/",
  "/index.html",
  "/app.jsx",
  "/bugs.jsx",
  "/shapes.jsx",
  "/bugg-api.js",
  "/manifest.webmanifest",
  "/icon.svg",
  "/icon-maskable.svg",
  "https://unpkg.com/react@18.3.1/umd/react.development.js",
  "https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js",
  "https://unpkg.com/@babel/standalone@7.29.0/babel.min.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) =>
      // Use addAll with allSettled to skip any single URL that fails
      Promise.allSettled(APP_SHELL.map((url) => cache.add(url).catch(() => null)))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !k.startsWith(VERSION))
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Supabase Edge Function calls → network-first, cache fallback.
  if (url.hostname.endsWith("supabase.co")) {
    event.respondWith(networkFirst(req, CACHE_API));
    return;
  }

  // Google Fonts → stale-while-revalidate.
  if (url.hostname.endsWith("googleapis.com") || url.hostname.endsWith("gstatic.com")) {
    event.respondWith(staleWhileRevalidate(req, CACHE_RUNTIME));
    return;
  }

  // Same-origin static assets → cache-first with network fallback that populates cache.
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(req, CACHE_STATIC));
    return;
  }

  // Other CDN scripts (unpkg) → stale-while-revalidate.
  event.respondWith(staleWhileRevalidate(req, CACHE_RUNTIME));
});

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.status === 200) cache.put(req, res.clone());
    return res;
  } catch (e) {
    // network failed, no cache → return a basic offline page if it's the root
    if (req.mode === "navigate") {
      return caches.match("/index.html");
    }
    throw e;
  }
}

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res && res.status === 200) cache.put(req, res.clone());
    return res;
  } catch (e) {
    const cached = await cache.match(req);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: "offline", offline: true }), {
      status: 503,
      headers: { "content-type": "application/json" },
    });
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const fetchPromise = fetch(req)
    .then((res) => {
      if (res && res.status === 200) cache.put(req, res.clone());
      return res;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}
