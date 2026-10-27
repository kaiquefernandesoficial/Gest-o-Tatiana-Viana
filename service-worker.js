const CACHE_NAME = "tatiana-viana-shell-v2";
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
  evento.waitUntil(
    caches.keys().then(function (nomes) {
      return Promise.all(
        nomes
          .filter(function (nome) { return nome !== CACHE_NAME; })
          .map(function (nome) { return caches.delete(nome); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// Só usamos cache para o "casco" do app (shell).
// O conteúdo do Web App (dentro do iframe) sempre vem direto do Google.
// Estratégia: rede primeiro (pega sempre a versão nova) e cache só se estiver offline.
self.addEventListener("fetch", function (evento) {
  const url = new URL(evento.request.url);

  if (url.origin !== self.location.origin) return;

  const ehShell = ARQUIVOS_SHELL.some(function (arquivo) {
    return url.pathname.endsWith(arquivo.replace("./", "/"));
  }) || url.pathname.endsWith("/");

  if (!ehShell) return;

  evento.respondWith(
    fetch(evento.request)
      .then(function (resposta) {
        const copia = resposta.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(evento.request, copia);
        });
        return resposta;
      })
      .catch(function () {
        return caches.match(evento.request, { ignoreSearch: true });
      })
  );
});
