// 编织器的 service worker：只负责接住系统分享过来的截图
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "POST" || !url.pathname.endsWith("/share")) return;
  e.respondWith((async () => {
    try {
      const form = await e.request.formData();
      const file = form.getAll("image").find(f => f && f.size);
      if (file) {
        const c = await caches.open("weaver-share");
        await c.put("shared-image", new Response(file, {headers: {"Content-Type": file.type || "image/jpeg"}}));
      }
    } catch (err) {}
    return Response.redirect(new URL("./?shared=1", self.registration.scope).href, 303);
  })());
});
