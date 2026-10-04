// Offline support for Card Night: keeps this page and its icons on the phone, so it opens without internet.
// Each game keeps its own offline copy with its own service worker, which the page sets up. Nothing passes through here.
const PREFIX = "cards-hub-", SHELL = PREFIX + "shell-v1", FONTS = PREFIX + "fonts-v1";
const GAMES = ["card-golf", "casino", "cribbage", "euchre", "flip7", "hand-foot", "hearts", "mao", "pitch", "presidents", "skyjo", "spades", "up-down-river"];
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./apple-touch-icon.png", "./favicon-32.png", "./icon-192.png", ...GAMES.map(g => `./icons/${g}.png`)];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(FILES.map(u => new Request(u, { cache:"reload" })))).then(() => self.skipWaiting()));
});
// only Card Night's old caches: the games and other apps on this site keep theirs
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== SHELL && k !== FONTS).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// the page: the newest copy when online, the saved copy when offline or when the network is too slow (3.5 s)
function page(req){
  return new Promise(resolve => {
    let done = false;
    const saved = () => caches.match("./index.html", { cacheName:SHELL });
    const finish = r => { if (!done && r){ done = true; resolve(r); } };
    const timer = setTimeout(() => saved().then(finish), 3500);
    fetch(req).then(res => {
      if (res.ok){ const copy = res.clone(); caches.open(SHELL).then(c => c.put("./index.html", copy)); }
      clearTimeout(timer); finish(res);
    }).catch(() => { clearTimeout(timer); saved().then(r => finish(r || Response.error())); });
  });
}
// saved copy first, refreshed in the background
function fresh(req, name){
  return caches.open(name).then(c => c.match(req, { ignoreSearch:true }).then(hit => {
    const net = fetch(req).then(res => { if (res.ok) c.put(req, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
}

self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (req.mode === "navigate"){ e.respondWith(page(req)); return; }
  if (url.origin === location.origin){ if (url.pathname.startsWith(new URL("./", location).pathname)) e.respondWith(fresh(req, SHELL)); return; }
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) e.respondWith(fresh(req, FONTS));
});
