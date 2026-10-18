// Oceania LOLBeans web app helper. It doesn't save anything offline yet:
// every request goes straight to the internet, exactly like the normal website.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
