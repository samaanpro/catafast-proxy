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
  if (!req.path.endsWith('.js') || req.path === '/service-worker.js' || req.path.includes('html5-qrcode') || req.path.includes('supabase.umd')) {
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
    // Strip anti-SW code (unregister + cache delete)
    html = html.replace(/<\/script>\s*<script>\s*if\s*\(\s*['"]serviceWorker['"]\s*in\s*navigator[\s\S]*?unregister\(\)[\s\S]*?caches\.delete[\s\S]*?<\/script>/, '');
    // Replace entire document.write supabase CDN fallback — replace whole script tag
    html = html.replace(
      /<script>if\s*\(\s*typeof\s+window\.supabase\s*===\s*['"]undefined['"]\s*\)\s*\{\s*document\.write\s*\([^)]*\)\s*;?\s*\}\s*<\/script>/,
      '<script>if(typeof window.supabase==="undefined"){var s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";document.head.appendChild(s)}<\/script>'
    );
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
#catafast-install-btn{position:fixed;bottom:100px;left:16px;z-index:99999;background:linear-gradient(135deg,#059669,#34d399);color:#fff;border:none;border-radius:50px;padding:12px 20px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 8px 24px rgba(5,150,105,0.4);display:flex;align-items:center;gap:8px;font-family:Cairo,sans-serif;transition:transform 0.2s ease,opacity 0.2s ease;user-select:none;-webkit-touch-callout:none;pointer-events:auto}
#catafast-install-btn:hover{transform:scale(1.05)}
#catafast-install-btn.hidden{display:none!important}
</style>
<script>
(function(){
  var isStandalone=window.matchMedia('(display-mode:standalone)').matches||window.navigator.standalone===true;
  if(isStandalone)return;
  var defPro=null;
  window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();defPro=e;});
  var btn=document.createElement('div');
  btn.id='catafast-install-btn';
  btn.innerHTML='<i class="fas fa-download"></i> تثبيت التطبيق';
  btn.onclick=function(){
    var s=this;
    if(defPro){defPro.prompt();defPro.userChoice.then(function(){defPro=null;if(window.matchMedia('(display-mode:standalone)').matches||window.navigator.standalone===true)s.classList.add('hidden');});return}
    if(/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream){s.innerHTML='<i class="fas fa-share"></i> مشاركة ← إضافة للشاشة الرئيسية';s.style.pointerEvents='none';setTimeout(function(){s.innerHTML='<i class="fas fa-download"></i> تثبيت التطبيق';s.style.pointerEvents='auto';},6000);return}
    s.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري التخزين...';s.style.pointerEvents='none';
    if(navigator.serviceWorker&&navigator.serviceWorker.controller)navigator.serviceWorker.controller.postMessage({action:'CACHE_ALL'});
    var u=[location.href];[].forEach.call(document.querySelectorAll('[src],[href]'),function(e){var a=e.src||e.href;if(a&&a.startsWith(location.origin))u.push(a.split('?')[0])});
    u=u.filter(function(v,i,a){return a.indexOf(v)===i});
    Promise.all(u.map(function(x){return fetch(x,{cache:'force-cache'}).then(function(r){if(!r.ok)throw Error();return r}).catch(function(){return null})})).then(function(){s.innerHTML='<i class="fas fa-check-circle"></i> تم ✓';s.style.background='linear-gradient(135deg,#22c55e,#4ade80)';setTimeout(function(){s.innerHTML='<i class="fas fa-download"></i> تثبيت التطبيق';s.style.background='';s.style.pointerEvents='auto'},4000)});
  };
  document.body.appendChild(btn);
  if('serviceWorker'in navigator)navigator.serviceWorker.register('/service-worker.js').catch(function(){});
  window.addEventListener('appinstalled',function(){btn.classList.add('hidden')});
})();
</script>
<script>
(function(){
  function kill(){document.body.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0f172a;color:#ef4444;font-family:sans-serif;text-align:center;padding:20px"><div><div style="font-size:64px;margin-bottom:20px">🚫</div><h2 style="color:#fff;margin-bottom:10px">ممنوع فتح أدوات المطور</h2><p style="color:#64748b;font-size:14px">تم إغلاق التطبيق لأسباب أمنية</p></div></div>'}
  function detect(){try{var e=new Error();if(!e.stack)return;var s=e.stack.toLowerCase();if(/devtools|debugger/i.test(s))kill()}catch(e){}}
  setInterval(detect,800);
  window.addEventListener('resize',function(){if(window.outerHeight-window.innerHeight>100||window.outerWidth-window.innerWidth>100)kill()});
  document.addEventListener('contextmenu',function(e){e.preventDefault()});
  document.addEventListener('keydown',function(e){if(e.key==='F12'||e.keyCode===123||(e.ctrlKey&&e.shiftKey&&(e.key==='I'||e.key==='J'||e.key==='C'||e.key==='i'||e.key==='j'||e.key==='c'))||(e.ctrlKey&&e.key==='U')||(e.ctrlKey&&e.shiftKey&&e.key==='Delete')){e.preventDefault();e.stopPropagation()}});
  try{Object.defineProperty(document,'onselectstart',{get:function(){return null}})}catch(e){}
  if(location.protocol!=='file:'){var _c=console.log;console.log=function(){};console.warn=function(){};console.error=function(){};console.info=function(){};console.debug=function(){};console.trace=function(){}}
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

// ======================== Favicon ========================
app.get('/favicon.ico', (req, res) => {
  res.type('image/svg+xml').send('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#059669"/><text x="50" y="68" text-anchor="middle" fill="white" font-size="45" font-weight="bold" font-family="sans-serif">C</text></svg>');
});

// ======================== 404 Fallback ========================
app.use((req, res) => {
  res.status(404).type('text').send('Not Found');
});

module.exports = app;
