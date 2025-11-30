// public/sw.js
self.addEventListener('install', (event) => {
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
    // Estrategia básica: Solo responde, permite que la app sea "instalable"
    // No hacemos caché complejo para no romper tu app en actualizaciones
})
