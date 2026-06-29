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
  const referer = (req.headers['referer'] || '').toLowerCase();

  const isBrowser = /mozilla|chrome|safari|edge|firefox|opr\//.test(ua);
  const hasAppKey = key === APP_SECRET_KEY;
  const isAppUA = /catafast|gymapp|katfast/.test(ua);
  const isSameOrigin = referer.includes(req.hostname);

  if (hasAppKey || isAppUA || isBrowser || isSameOrigin) {
    return next();
  }
  return res.status(403).type('json').send(JSON.stringify({ error: 'Access Denied' }));
});

// ======================== JS Obfuscation Middleware ========================
function obfuscate(code) {
  const key = OBFUSCATION_KEY;
  const buf = Buffer.from(code, 'utf-8');
  const xored = Buffer.alloc(buf.length);
  for (let i = 0; i < buf.length; i++) {
    xored[i] = buf[i] ^ key.charCodeAt(i % key.length);
  }
  return xored.toString('base64');
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
    const wrapper = `(function(){var _k="${key}";var _b=atob("${encoded}");var _o=new Uint8Array(_b.length);for(var _i=0;_i<_b.length;_i++){_o[_i]=_b.charCodeAt(_i)^_k.charCodeAt(_i%_k.length);}try{eval(new TextDecoder().decode(_o))}catch(e){console.error(e)}})();`;
    return res.type('application/javascript').send(wrapper);
  }
  next();
});

// ======================== HTML Injection Middleware ========================
app.use((req, res, next) => {
  const isHtmlPath = req.path.endsWith('.html');
  const isRoot = req.path === '/' || req.path === '';
  const userPath = req.path.replace(/^\//, '');
  let filePath;
  if (isHtmlPath || isRoot) {
    if (isRoot) {
      filePath = path.join(USER_DIR, 'index.html');
    } else {
      filePath = path.join(USER_DIR, userPath);
    }
  } else {
    return next();
  }
  if (fs.existsSync(filePath)) {
    let html = fs.readFileSync(filePath, 'utf-8');
    // Strip anti-SW code (unregister + cache delete) — single contiguous script block
    html = html.replace(/<\/script>\s*<script>\s*if\s*\(\s*['"]serviceWorker['"]\s*in\s*navigator[\s\S]*?unregister\(\)[\s\S]*?caches\.delete[\s\S]*?<\/script>/, '');
    // Replace document.write for supabase CDN fallback with proper script injection
    html = html.replace(/if\s*\(\s*(?:typeof\s+window\.supabase\s*===\s*['"]undefined['"]|window\.supabase\s*==\s*null)\s*\)\s*\{\s*document\.write\s*\(/,
      'if(typeof window.supabase==="undefined"){var s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";document.head.appendChild(s);document.write(');
    // Strip Capacitor UA spoofing + old anti-devtools (same script block)
    var capIdx = html.indexOf('try { if (window.Capacitor)');
    if (capIdx !== -1) {
      var openIdx = html.lastIndexOf('<script>', capIdx);
      var closeIdx = html.indexOf('</script>', capIdx);
      if (openIdx !== -1 && closeIdx !== -1) {
        html = html.substring(0, openIdx) + html.substring(closeIdx + 9);
      }
    }
    const inject = `
<style>
#catafast-install-btn{position:fixed;bottom:90px;left:16px;z-index:9999;background:linear-gradient(135deg,#059669,#34d399);color:#fff;border:none;border-radius:50px;padding:10px 18px;font-size:12px;font-weight:700;cursor:pointer;box-shadow:0 8px 24px rgba(5,150,105,0.4);display:flex;align-items:center;gap:8px;font-family:Cairo,sans-serif;transition:transform 0.2s ease,opacity 0.2s ease;user-select:none;-webkit-touch-callout:none}
#catafast-install-btn:hover{transform:scale(1.05)}
#catafast-install-btn.hidden{display:none!important}
</style>
<script>
(function(){
  function isInstalled(){return window.matchMedia('(display-mode:standalone)').matches||window.navigator.standalone===true}
  function isMobile(){return/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/.test(navigator.userAgent)}
  if(isInstalled())return;
  if(!isMobile())return;
  var deferredPrompt=null;
  window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferredPrompt=e;});
  var btn=document.createElement('div');
  btn.id='catafast-install-btn';
  btn.innerHTML='<i class="fas fa-download"></i> تثبيت التطبيق';
  btn.onclick=function(){
    var self=this;
    if(deferredPrompt){
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function(){deferredPrompt=null;if(isInstalled())self.classList.add('hidden');});
      return;
    }
    var isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream;
    if(isIOS){
      self.innerHTML='<i class="fas fa-share"></i> مشاركة ← إضافة للشاشة الرئيسية';
      self.style.pointerEvents='none';
      setTimeout(function(){
        self.innerHTML='<i class="fas fa-download"></i> تثبيت التطبيق';
        self.style.pointerEvents='auto';
      },6000);
      return;
    }
    self.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري التخزين...';
    self.style.pointerEvents='none';
    if(navigator.serviceWorker&&navigator.serviceWorker.controller){
      navigator.serviceWorker.controller.postMessage({action:'CACHE_ALL'});
    }
    var urls=[location.href];
    [].forEach.call(document.querySelectorAll('[src],[href]'),function(el){
      var u=el.src||el.href;
      if(u&&u.startsWith(location.origin))urls.push(u.split('?')[0]);
    });
    urls=urls.filter(function(v,i,a){return a.indexOf(v)===i;});
    Promise.all(urls.map(function(u){return fetch(u,{cache:'force-cache'}).then(function(r){if(!r.ok)throw Error();return r}).catch(function(){return null})})).then(function(){
      self.innerHTML='<i class="fas fa-check-circle"></i> تم التخزين ✓';
      self.style.background='linear-gradient(135deg,#22c55e,#4ade80)';
      setTimeout(function(){
        self.innerHTML='<i class="fas fa-download"></i> تثبيت التطبيق';
        self.style.background='';
        self.style.pointerEvents='auto';
      },4000);
    });
  };
  document.body.appendChild(btn);
  if('serviceWorker'in navigator){
    navigator.serviceWorker.register('/service-worker.js').catch(function(){});
  }
  window.addEventListener('appinstalled',function(){btn.classList.add('hidden');});
})();
</script>
<script>
(function(){
  function dev(){var e=new Error();if(!e.stack)return;var s=e.stack.toLowerCase();if(/devtools|debugger|chrome\s+dev/i.test(s)||s.match(/\(.*:\d+:\d+\)/g)&&s.match(/\(.*:\d+:\d+\)/g).length>3){document.title='🛑';document.body.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0f172a;color:#ef4444;font-family:sans-serif;text-align:center;padding:20px"><div><div style="font-size:64px;margin-bottom:20px">🚫</div><h2 style="color:#fff;margin-bottom:10px">ممنوع فتح أدوات المطور</h2><p style="color:#64748b;font-size:14px">تم إغلاق التطبيق لأسباب أمنية</p></div></div>'}}
  setInterval(dev,1e3);
  document.addEventListener('contextmenu',function(e){e.preventDefault();return false});
  document.addEventListener('keydown',function(e){
    if(e.key==='F12'||e.keyCode===123||(e.ctrlKey&&e.shiftKey&&(e.key==='I'||e.key==='J'||e.key==='C'))||(e.ctrlKey&&e.key==='U')||(e.ctrlKey&&e.shiftKey&&e.key==='Delete')){e.preventDefault();e.stopPropagation();return false}
    if(e.ctrlKey&&e.shiftKey&&e.keyCode===73){e.preventDefault();e.stopPropagation();return false}
  });
  document.addEventListener('keyup',function(e){
    if(e.key==='F12'||e.keyCode===123){e.preventDefault();e.stopPropagation();return false}
  });
  if(location.protocol!=='file:'){var c=console.log;console.log=function(){};console.warn=function(){};console.error=function(){};console.info=function(){};console.debug=function(){};console.trace=function(){}}
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
  var url = new URL(e.request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  var isJS = url.pathname.endsWith('.js') || url.pathname.endsWith('.js?v=');
  if (isJS) {
    e.respondWith(
      fetch(e.request).then(function(resp) {
        if (resp && resp.status === 200) return resp;
        return new Response('', { status: 503, statusText: 'Offline' });
      }).catch(function() {
        return new Response(
          'document.body.innerHTML=\'<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0f172a;color:#94a3b8;font-family:sans-serif;text-align:center;padding:20px"><div><div style="font-size:64px;margin-bottom:20px">📡</div><h2 style="color:#fff;margin-bottom:10px">يتطلب اتصال بالإنترنت</h2><p style="color:#64748b;font-size:14px">هذا التطبيق لا يعمل بدون نت لحماية البيانات</p></div></div>\';',
          { status: 503, headers: { 'Content-Type': 'text/html;charset=utf-8' } }
        );
      })
    );
    return;
  }
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

// ======================== GIF LFS Pointer Placeholder ========================
const LFS_HEADER = 'version https://git-lfs.github.com/spec/v1';
const PLACEHOLDER_SVG = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">' +
  '<rect width="300" height="300" fill="#1e293b" rx="16"/>' +
  '<circle cx="150" cy="120" r="50" fill="none" stroke="#059669" stroke-width="6"/>' +
  '<rect x="90" y="85" width="120" height="10" rx="5" fill="#059669"/>' +
  '<rect x="90" y="145" width="120" height="10" rx="5" fill="#059669"/>' +
  '<rect x="75" y="110" width="10" height="60" rx="5" fill="#059669"/>' +
  '<rect x="215" y="110" width="10" height="60" rx="5" fill="#059669"/>' +
  '<text x="150" y="210" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="16">تمرين</text>' +
  '<text x="150" y="235" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="12">غير متوفر حالياً</text>' +
  '</svg>'
);

app.use((req, res, next) => {
  if (!req.path.endsWith('.gif')) return next();
  const filePath = path.join(USER_DIR, req.path.replace(/^\//, ''));
  if (!fs.existsSync(filePath)) return next();
  const firstBytes = fs.readFileSync(filePath, 'utf-8').slice(0, LFS_HEADER.length);
  if (firstBytes === LFS_HEADER) {
    return res.type('image/svg+xml').send(PLACEHOLDER_SVG);
  }
  next();
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

module.exports = app;
