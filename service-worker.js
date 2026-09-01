const CACHE_NAME = "tatiana-viana-shell-v1";
const ARQUIVOS_SHELL = [
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", function (evento) {
  evento.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ARQUIVOS_SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (evento) {
  self.clients.claim();
});

// Só usamos cache para o "casco" do app (shell).
// O conteúdo do Web App (dentro do iframe) sempre vem direto do Google.
self.addEventListener("fetch", function (evento) {
  const url = new URL(evento.request.url);

  if (ARQUIVOS_SHELL.some(function (arquivo) {
    return url.pathname.endsWith(arquivo.replace("./", "/"));
  })) {
    evento.respondWith(
      caches.match(evento.request).then(function (resposta) {
        return resposta || fetch(evento.request);
      })
    );
  }
});
