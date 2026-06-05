// Service worker — memento hrănire (Web Push) + auto-update (network-first)
// Fără date sensibile: mesajul push e fix, decis aici.

// Versiune cache — schimbată la fiecare release ca să forțeze înnoirea.
var CACHE = "tati-v2026-06-05a";

// Instalare: activează imediat noul SW (nu aștepta închiderea tab-urilor).
self.addEventListener("install", function () {
  self.skipWaiting();
});

// Activare: preia controlul tuturor paginilor + curăță cache-urile vechi.
self.addEventListener("activate", function (event) {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(function (keys) {
        return Promise.all(
          keys.map(function (k) {
            if (k !== CACHE) return caches.delete(k);
          }),
        );
      }),
    ]),
  );
});

// Fetch: NETWORK-FIRST pentru resursele proprii (GET, same-origin).
// => La refresh, cu internet, primești MEREU ultima versiune publicată.
//    Offline → fallback pe ultima versiune din cache. Cererile către
//    worker-ul AI (alt origin) și POST-urile NU sunt atinse.
self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(req)
      .then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) {
            c.put(req, copy);
          });
        }
        return res;
      })
      .catch(function () {
        return caches.match(req);
      }),
  );
});

// ===== Web Push (memento hrănire) — payloadless, fără date sensibile =====
self.addEventListener("push", function (event) {
  var title = "🍽️ E timpul pentru hrănire";
  var body =
    "Pregătește bolusul: mic, lent (15–30 min), cu capul ridicat 30–45°.";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: "assets/icon-192.png",
      badge: "assets/icon-192.png",
      tag: "feed-reminder",
      renotify: true,
      requireInteraction: true,
      vibrate: [200, 100, 200],
    }),
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (cl) {
        for (var i = 0; i < cl.length; i++) {
          if ("focus" in cl[i]) return cl[i].focus();
        }
        if (clients.openWindow) return clients.openWindow("./");
      }),
  );
});
