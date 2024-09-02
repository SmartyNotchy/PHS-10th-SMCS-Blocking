// The version of the cache.
const VERSION = "v1.0.5";

// The name of the cache
const CACHE_NAME = `9-smcs-blocking-${VERSION}`;

/*
// The static resources that the app needs to function.
const APP_STATIC_RESOURCES = [
    "",
    "index.html",
    "style.css",
    "compact.css",
    "images/morning.png",
    "images/night.png",
    "images/dawn.png",
    "images/afternoon.png",
    "images/favicon.ico",
    "images/icon.png"
];

/*
// On install, cache the static resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      cache.addAll(APP_STATIC_RESOURCES);
    })(),
  );
});

// delete old caches on activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        }),
      );
      await clients.claim();
    })(),
  );
});

// On fetch, intercept server requests
// and respond with cached responses instead of going to network
self.addEventListener("fetch", (event) => {
  // As a single page app, direct app to always go to cached home page.
  if (event.request.mode === "navigate") {
    event.respondWith(caches.match("/"));
    return;
  }

  // For all other requests, go to the cache first, and then the network.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(event.request.url);
      if (cachedResponse) {
        // Return the cached response if it's available.
        return cachedResponse;
      } else {
        // If resource isn't in the cache, return a 404.
        return new Response(null, { status: 404 });
      }
    })(),
  );
});
//*/