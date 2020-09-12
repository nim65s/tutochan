(function () {
  const app = document.querySelector('#app');
  const container = app.querySelector('.entry-container');
  const loadMore = app.querySelector('.load-more');
  const addBtn = app.querySelector('.add-button');
  addBtn.style.display = 'none';
  let deferredPrompt;

  async function getPosts(page = 1) {
    const result = await fetch(window.location.origin + '/api/messages/?page=' + page);
    return await result.json();
  }

  async function getChans() {
    const result = await fetch(window.location.origin + '/api/chans/');
    return await result.json();
  }

  async function getUsers() {
    const result = await fetch(window.location.origin + '/api/users/');
    return await result.json();
  }


  async function loadEntries(page = 1) {
    const [chans, posts, users] = await Promise.all([getChans(), getPosts(page), getUsers()]);
    return posts.map(post => {
      const chan = chans.filter(c => c.url === post.chan)[0];
      const user = users.filter(u => u.url === post.user)[0];
      return `<div class="row"><div class="col">${chan.name}</div><div class="col">${post.created}</div><div class="col">${user.username}</div><div class="col-6">${post.message}</div></div>`;
    }).join('');
  }

  function appendEntries(entries) {
    const output = container.querySelector('output') || container.appendChild(document.createElement('output'));
    output.outerHTML = entries + '<output></output>';
  }

  (async function() {
    let page = 1;

    async function loadMoreEntries() {
      loadMore.disabled = true;
      const entries = await loadEntries(page++);
      appendEntries(entries);
      loadMore.disabled = false;
    }

    loadMore.addEventListener('click', loadMoreEntries, false);
    loadMoreEntries();
  })();
})();

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  e.prompt();
});

if ('serviceWorker' in navigator) {
  try {
    registerServiceWorker();
  } catch (e) {
    console.error('register service worker failed', e);
  }
} else {
  console.error('no support of pwa');
}

async function registerServiceWorker() {
  try {
    const registration = await navigator.serviceWorker.register('static/sw.js');
    console.log('ServiceWorker ok');
  } catch (e) {
    console.error('ServiceWorker failed', e);
  }
}

const files = [
  'static/',
  'static/index.js',
];

self.addEventListener('install', async e => {
  const cache = await caches.open('files');
  cache.addAll(files);
});

self.addEventListener('fetch', async e => {
  const req = e.request;
  const res = isApiCall(req) ? getFromNetwork(req) : getFromCache(req);
  await e.respondWith(res);
});

async function getFromNetwork(req) {
  const cache = await caches.open('data');

  try {
    const res = await fetch(req);
    cache.put(req, res.clone());
    return res;
  } catch (e) {
    const res = await cache.match(req);
    return res || getFallback(req);
  }
}


window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI to notify the user they can add to home screen
  addBtn.style.display = 'block';

  addBtn.addEventListener('click', (e) => {
    // hide our user interface that shows our A2HS button
    addBtn.style.display = 'none';
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        deferredPrompt = null;
      });
  });
});
