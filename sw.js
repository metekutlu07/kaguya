self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  if (event.request.mode !== 'navigate' || event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).catch(() => new Response(
    '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kaguya</title><body style="background:#070b18;color:#eee9dd;font:18px Georgia,serif;display:grid;place-content:center;min-height:95vh;text-align:center;margin:24px"><h1>☾ Kaguya</h1><p>Reconnect to continue your journey.</p><button onclick="location.reload()" style="padding:12px;background:transparent;color:inherit;border:1px solid currentColor">Try again</button></body>',
    {headers: {'Content-Type': 'text/html; charset=utf-8'}, status: 503}
  )));
});
