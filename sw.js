// Service worker — notificări memento hrănire (Web Push, payloadless)
// Fără date sensibile: mesajul e fix, decis aici.
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
