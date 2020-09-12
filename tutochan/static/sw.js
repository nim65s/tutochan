console.log('hello world');

const files = [
  '/',
  'static/',
  'static/index.js',
];

self.addEventListener('install', async e => {
  const cache = await caches.open('tutochan');
  cache.addAll(files);
});

self.addEventListener('fetch', async e => {
  const req = e.request;
  console.log('fetching ' + req.url);
  const resp = await caches.match(req);
  console.log('... ' + resp);
  await resp || fetch(req);
});
