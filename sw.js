const CACHE_NAME = "inventario-imballaggi-v1";
const CORE = [
  "./",
  "./index.html",
  "./xlsx.full.min.js",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE)).then(()=>self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => (k===CACHE_NAME)?null:caches.delete(k)))).then(()=>self.clients.claim())
  );
});

// Stale-while-revalidate for app shell
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(()=>{});
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
