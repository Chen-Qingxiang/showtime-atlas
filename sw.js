/* Only public same-origin app assets are cached. User workspaces stay in IndexedDB. */
const VERSION = "2026-11-09-a";
const SHELL = "showtime-atlas-shell-" + VERSION;
const DATA = "showtime-atlas-public-data-v1";
const ROOT = new URL(self.registration.scope);
const CORE = ["index.html","styles.css","app.js","src/background-recommendations.js","src/browser-selftest.js","src/canvas-interactions.js","src/csv.js","src/diff.js","src/export.js","src/lod.js","src/metadata.js","src/minimap.js","src/probes.js","src/project.js","src/renderer.js","src/search.js","src/share.js","src/state.js","src/statistics.js","src/storage.js","src/time.js","src/ui.js","src/zip.js","background/manifest.json","background/synonyms.json","background/vocabulary.json"];
const URLS = CORE.map(path => new URL(path, ROOT).href);
const CORE_SET = new Set(URLS);
const HOME = new URL("index.html",ROOT).href;
async function networkFirst(request, cacheName, key=request) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") await cache.put(key, response.clone());
    return response;
  } catch (error) {
    const saved = await cache.match(key);
    if (saved) return saved;
    throw error;
  }
}
self.addEventListener("install", event => event.waitUntil(
  caches.open(SHELL).then(cache => cache.addAll(URLS)).then(() => self.skipWaiting())
));
self.addEventListener("activate", event => event.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.filter(key => key.startsWith("showtime-atlas-shell-") && key !== SHELL).map(key => caches.delete(key)));
  await self.clients.claim();
})()));
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== ROOT.origin || !url.pathname.startsWith(ROOT.pathname)) return;
  if (req.mode === "navigate") {
    if (url.pathname === ROOT.pathname || url.pathname === ROOT.pathname + "index.html")
      event.respondWith(networkFirst(req,SHELL,HOME));
    return;
  }
  const key = new URL(url.href); key.search = ""; key.hash = "";
  if (CORE_SET.has(key.href)) { event.respondWith(networkFirst(req,SHELL,key.href)); return; }
  const rel = url.pathname.slice(ROOT.pathname.length);
  if (/^(?:background|examples)\/.*\.(?:csv|json|zip)$/i.test(rel)) event.respondWith(networkFirst(req,DATA));
});
