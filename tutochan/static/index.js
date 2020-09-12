(function () {
  const app = document.querySelector('#app');
  const container = app.querySelector('.entry-container');
  const loadMore = app.querySelector('.load-more');

  let JSONCache = {}; // url: dict

  async function fetchJSON(url) {
    if (!(url in JSONCache)) {
      const resp = await fetch(url);
      const ret = await resp.json();
      JSONCache[url] = ret;
    }
    return JSONCache[url];
  }

  async function getPosts(page = 1) {
    return await fetchJSON(window.location.origin + '/api/messages/?page=' + page);
  }

  async function loadEntries(page = 1) {
    let entries = [];
    const posts = await getPosts(page);
    for (i in posts.results) {
      const post = posts.results[i];
      const [chan, user] = await Promise.all([fetchJSON(post.chan), fetchJSON(post.user)]);
      entries.push(`<div class="row"><div class="col">${chan.name}</div><div class="col">${post.created}</div><div class="col">${user.username}</div><div class="col-6">${post.message}</div></div>`);
    }
    return entries.join('');
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

// Register service worker to control making site work offline

if('serviceWorker' in navigator) {
  navigator.serviceWorker
           .register('static/sw.js')
           .then(function() { console.log('Service Worker Registered'); });
}

// Code to handle install prompt on desktop

let deferredPrompt;
const addBtn = document.querySelector('.add-button');
addBtn.style.display = 'none';

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
