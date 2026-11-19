/* ============================================================================
   Blocs Équations — service worker (hors ligne)
   Auteur : Tom Rougeaud · Réalisé avec l’aide de l’IA : Claude Sonnet 5.5 (Anthropic)
   IMPORTANT : à chaque mise à jour publiée, changer le numéro dans NOM_CACHE,
   sinon les anciens fichiers restent servis.
   ============================================================================ */
const NOM_CACHE = "blocs-equations-v3.1.1";
const FICHIERS = [
  "./", "index.html", "manifest.webmanifest", "icon.svg",
  "icon-192.png", "icon-512.png", "icon-maskable-512.png", "fiche-revision-equations.pdf"
];

// Installation : on met tous les fichiers de l’appli en cache
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(NOM_CACHE).then((c) => c.addAll(FICHIERS)));
});

// Activation : on supprime les anciens caches de cette appli
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((noms) => Promise.all(noms.filter((n) => n.startsWith("blocs-equations-") && n !== NOM_CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// Mise à jour : la page demande l’activation de la nouvelle version
self.addEventListener("message", (e) => { if (e.data === "activer") self.skipWaiting(); });

// Réponses : d’abord le cache, sinon le réseau (et on garde une copie)
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((rep) => rep || fetch(e.request).then((r) => {
      if (r && r.ok && new URL(e.request.url).origin === location.origin) { const copie = r.clone(); caches.open(NOM_CACHE).then((c) => c.put(e.request, copie)); }
      return r;
    }).catch(() => caches.match("index.html")))
  );
});
