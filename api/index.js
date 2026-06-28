const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
function findUserDir() {
  const candidates = [
    path.join(__dirname, '..', 'user'),
    path.join(process.cwd(), 'user'),
    path.join(__dirname, '..', '..', 'user'),
    path.join(__dirname, 'user'),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'index.html'))) return dir;
  }
  return candidates[0];
}
const USER_DIR = findUserDir();
const OBFUSCATION_KEY = 'C4t@f@st_GYM_S3cur3_K3y_2026!';
const APP_SECRET_KEY = 'CatafastApp2026';

// ======================== Security Middleware ========================
app.use((req, res, next) => {
  if (req.path === '/service-worker.js' || req.path === '/manifest.json') {
    return next();
  }
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  const key = req.headers['x-app-key'];
  const allowed = key === APP_SECRET_KEY || /catafast|gymapp|katfast/.test(ua);
  if (!allowed) {
    return res.status(403).type('json').send(JSON.stringify({ error: 'Access Denied' }));
  }
  next();
});

// ======================== JS Obfuscation Middleware ========================
function obfuscate(code) {
  const key = OBFUSCATION_KEY;
  let xored = '';
  for (let i = 0; i < code.length; i++) {
    xored += String.fromCharCode(code.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return Buffer.from(xored, 'latin1').toString('base64');
}

app.use((req, res, next) => {
  if (!req.path.endsWith('.js') || req.path === '/service-worker.js') {
    return next();
  }
  const filePath = path.join(USER_DIR, req.path.replace(/^\//, ''));
  if (fs.existsSync(filePath)) {
    const code = fs.readFileSync(filePath, 'utf-8');
    const encoded = obfuscate(code);
    const key = OBFUSCATION_KEY;
    const wrapper = `(function(){var _k="${key}";var _b=atob("${encoded}");var _d='';for(var _i=0;_i<_b.length;_i++){_d+=String.fromCharCode(_b.charCodeAt(_i)^_k.charCodeAt(_i%_k.length));}try{eval(_d)}catch(e){console.error(e)}})();`;
    return res.type('application/javascript').send(wrapper);
  }
  next();
});

// ======================== HTML Injection Middleware ========================
app.use((req, res, next) => {
  if (!req.path.endsWith('.html')) {
    return next();
  }
  const filePath = path.join(USER_DIR, req.path.replace(/^\//, ''));
  if (fs.existsSync(filePath)) {
    let html = fs.readFileSync(filePath, 'utf-8');
    const inject = `
<script>
(function(){
  var swBtn=document.createElement('div');
  swBtn.id='catafast-offline-btn';
  swBtn.innerHTML='<i class="fas fa-download"></i> تخزين للاستخدام بدون نت';
  swBtn.style.cssText='position:fixed;bottom:90px;left:16px;z-index:9999;background:linear-gradient(135deg,#059669,#34d399);color:#fff;border:none;border-radius:50px;padding:10px 18px;font-size:12px;font-weight:700;cursor:pointer;box-shadow:0 8px 24px rgba(5,150,105,0.4);display:flex;align-items:center;gap:8px;font-family:Cairo,sans-serif;transition:transform 0.2s ease,opacity 0.2s ease;';
  swBtn.onmouseenter=function(){this.style.transform='scale(1.05)';};
  swBtn.onmouseleave=function(){this.style.transform='scale(1)';};
  swBtn.onclick=function(){
    var self=this;
    self.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري التخزين...';
    self.style.pointerEvents='none';
    if(navigator.serviceWorker&&navigator.serviceWorker.controller){
      navigator.serviceWorker.controller.postMessage({action:'CACHE_ALL'});
    }
    var urls=[location.href];
    document.querySelectorAll('[src],[href]').forEach(function(el){
      var u=el.src||el.href;
      if(u&&u.startsWith(location.origin))urls.push(u.split('?')[0]);
    });
    urls=urls.filter(function(v,i,a){return a.indexOf(v)===i;});
    Promise.all(urls.map(function(u){return fetch(u,{cache:'force-cache'}).then(function(r){if(!r.ok)throw Error();return r}).catch(function(){return null})})).then(function(){
      self.innerHTML='<i class="fas fa-check-circle"></i> تم التخزين للاستخدام بدون نت ✓';
      self.style.background='linear-gradient(135deg,#22c55e,#4ade80)';
      setTimeout(function(){
        self.innerHTML='<i class="fas fa-download"></i> تخزين للاستخدام بدون نت';
        self.style.background='';
        self.style.pointerEvents='auto';
      },4000);
    });
  };
  document.body.appendChild(swBtn);
  if('serviceWorker'in navigator){
    navigator.serviceWorker.register('/service-worker.js').catch(function(){});
  }
})();
</script>`;
    html = html.replace('</body>', inject + '\n</body>');
    return res.type('text/html').send(html);
  }
  next();
});

// ======================== Manifest JSON ========================
app.get('/manifest.json', (req, res) => {
  res.json({
    name: 'Catafast GYM',
    short_name: 'Catafast',
    description: 'منصة المشتركين الذكية - تطبيق الجيم',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#059669',
    theme_color: '#059669',
    lang: 'ar',
    dir: 'rtl',
    categories: ['fitness', 'health', 'gym'],
    prefer_related_applications: false,
    icons: [
      { src: '/assets/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { src: '/assets/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' }
    ]
  });
});

// ======================== Service Worker Generator ========================
app.get('/service-worker.js', (req, res) => {
  const sw = `
var CACHE_NAME = 'catafast-cache-v1';
var PRECACHE_URLS = [
  '/', '/index.html', '/style.css', '/manifest.json',
  '/assets/fonts/google/fonts.css',
  '/assets/fonts/fontawesome/all.min.css',
  '/assets/icons/icon-192.svg',
  '/assets/icons/icon-512.svg'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(c) {
      return c.addAll(PRECACHE_URLS);
    }).then(function() { self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(ks) {
      return Promise.all(ks.filter(function(k) { return k !== CACHE_NAME; }).map(function(k) { return caches.delete(k); }));
    }).then(function() { self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      var fetched = fetch(e.request).then(function(resp) {
        if (resp && resp.status === 200) {
          var clone = resp.clone();
          caches.open(CACHE_NAME).then(function(c) { c.put(e.request, clone); });
        }
        return resp;
      }).catch(function() { return null; });
      return cached || fetched;
    })
  );
});

self.addEventListener('message', function(e) {
  if (e.data && e.data.action === 'CACHE_ALL') {
    var toCache = PRECACHE_URLS.slice();
    self.clients.matchAll().then(function(clients) {
      clients.forEach(function(client) {
        client.postMessage({ action: 'COLLECT_URLS' });
      });
    });
    caches.open(CACHE_NAME).then(function(c) {
      toCache.forEach(function(url) {
        fetch(url).then(function(r) { if (r.ok) c.put(url, r); }).catch(function() {});
      });
    });
    if (e.ports && e.ports[0]) e.ports[0].postMessage({ status: 'caching' });
  }
});
`;
  res.type('application/javascript').send(sw);
});

// ======================== Static Files ========================
app.use(express.static(USER_DIR, {
  setHeaders: function(res, filePath) {
    if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
    if (filePath.endsWith('.js')) res.setHeader('Cache-Control', 'no-cache');
  }
}));

// ======================== 404 Fallback ========================
app.use((req, res) => {
  res.status(404).type('text').send('Not Found');
});

app.get('/__debug', (req, res) => {
  res.json({
    cwd: process.cwd(),
    dirname: __dirname,
    userDir: USER_DIR,
    files: fs.existsSync(USER_DIR) ? fs.readdirSync(USER_DIR).slice(0, 20) : 'NOT_FOUND',
    hasIndex: fs.existsSync(path.join(USER_DIR, 'index.html')),
    node: process.version,
  });
});

module.exports = app;
