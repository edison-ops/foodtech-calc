
const CACHE_NAME = "foodtech-calc-v3";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./manifest.json",
    "./css/style.css",
    "./js/calculs.js",
    "./images/icon-192.png",
    "./images/icon-512.png"
];

// INSTALLATION
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(FILES_TO_CACHE))
    );

    self.skipWaiting();
});

// ACTIVATION
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );

    self.clients.claim();
});

// UTILISATION HORS CONNEXION
self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;

    const url = new URL(event.request.url);

    // Ignorer les requêtes provenant d'autres sites
    if (url.origin !== self.location.origin) return;

    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) {
                return cached;
            }

            return fetch(event.request).catch(() => {
                // Afficher la page d'accueil si elle est demandée
                // mais indisponible hors connexion
                if (event.request.mode === "navigate") {
                    return caches.match("./index.html");
                }

                return new Response("", {
                    status: 503,
                    statusText: "Hors connexion"
                });
            });
        })
    );
});
