// Oceania LOLBeans web app helper. It doesn't save anything offline yet:
// every request goes straight to the internet, exactly like the normal website.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});

// Phone notifications (admin): show the ping and open the right page when it's tapped.
self.addEventListener("push", e => {
  let j = {}; try { j = e.data ? e.data.json() : {}; } catch (x) { j = { data: { body: e.data ? e.data.text() : "" } }; }
  const d = j.data || {}, n = j.notification || {};
  e.waitUntil(self.registration.showNotification(d.title || n.title || "Oceania LOLBeans", {
    body: d.body || n.body || "", icon: "icons/icon-192.png", badge: "icons/favicon-32.png", data: { link: d.link || "./" }
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = new URL((e.notification.data || {}).link || "./", self.registration.scope).href;
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(ws => {
    for (const w of ws) if (w.url.split("#")[0] === url && "focus" in w) return w.focus();
    return clients.openWindow(url);
  }));
});
