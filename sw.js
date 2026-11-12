// Offline support. The guide's own files are fetched fresh whenever there is a
// connection and fall back to the saved copy when there isn't, so a new version
// shows up on the next online visit without any cache-clearing.
const CACHE = "quad-tuning-v1";
const FILES = ["./", "index.html", "styles.css", "steps.js", "scenes.js", "app.js", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"];
const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const save = (req, res) => {
  if (res.ok || res.type === "opaque") {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(req, copy));
  }
  return res;
};

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Fonts never change, so the saved copy is used first.
  if (FONT_HOSTS.includes(url.hostname)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => save(req, res))));
    return;
  }
  if (url.origin !== location.origin) return;

  // ignoreSearch lets "index.html?anything" fall back to the saved page when offline.
  e.respondWith(
    fetch(req)
      .then(res => save(req, res))
      .catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match("index.html")))
  );
});
