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
  if (!req.path.endsWith('.js') || req.path === '/service-worker.js' || req.path.includes('html5-qrcode') || req.path.includes('supabase.umd') || req.path.includes('exercises_full')) {
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
    // Strip anti-SW code (unregister + cache delete) — keep preceding </script>
    html = html.replace(/\s*<script>\s*if\s*\(\s*['"]serviceWorker['"]\s*in\s*navigator[\s\S]*?unregister\(\)[\s\S]*?caches\.delete[\s\S]*?<\/script>/, '');
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
    // Inject splash overlay right after <body>
    var ss = '<style>html,body{overflow:hidden;height:100%}#_catafast-sp{position:fixed;inset:0;z-index:999999;background:#0f172a;display:flex;align-items:center;justify-content:center;flex-direction:column;font-family:Cairo,sans-serif;text-align:center;padding:20px}#_catafast-sp ._ci{font-size:64px;margin-bottom:20px}#_catafast-sp h2{color:#fff;margin-bottom:10px}#_catafast-sp p{color:#94a3b8;font-size:14px;margin-bottom:30px;max-width:300px}#_catafast-sp ._cb{background:linear-gradient(135deg,#059669,#34d399);color:#fff;border:none;border-radius:50px;padding:14px 28px;font-size:15px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:10px;transition:transform 0.2s}#_catafast-sp ._cb:hover{transform:scale(1.05)}</style>';
    var sd = '<div id="_catafast-sp"><div class="_ci">📵</div><h2>يجب تثبيت التطبيق</h2><p>هذا الموقع لا يعمل في المتصفح. برجاء تثبيت التطبيق أولاً عبر الزر أدناه</p><div class="_cb" id="_catafast-ibtn">📥 تثبيت التطبيق</div></div>';
    html = html.replace('<body>', '<body>\n' + ss + sd);
    // Build injection scripts — avoid nested quote issues by using single-quote JS strings
    var sc = '';
    sc += '<script>';
    sc += 'var _sp=document.getElementById("_catafast-sp");';
    sc += 'if(window.matchMedia("(display-mode:standalone)").matches||window.navigator.standalone===true){if(_sp){_sp.remove()}if("serviceWorker"in navigator){navigator.serviceWorker.register("/service-worker.js").catch(function(){})}}else{';
    sc += 'var _ib=document.getElementById("_catafast-ibtn");if(_ib){';
    sc += 'var _dp=null;';
    sc += 'window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();_dp=e});';
    sc += '_ib.onclick=function(){';
    sc += 'if(_dp){_dp.prompt();_dp.userChoice.then(function(){_dp=null;if(window.matchMedia("(display-mode:standalone)").matches){var s=document.getElementById("_catafast-sp");if(s)s.remove()}});return}';
    sc += 'var _ios=/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream;';
    sc += 'if(_ios){_ib.textContent="⬆️ مشاركة ← إضافة للشاشة الرئيسية";_ib.style.pointerEvents="none";setTimeout(function(){_ib.innerHTML="📥 تثبيت التطبيق";_ib.style.pointerEvents="auto"},6000);return}';
    sc += 'alert("لتثبيت التطبيق:\n1. افتح قائمة المتصفح (⋮)\n2. اختر \\"تثبيت التطبيق\\"\nأو \\"إضافة للشاشة الرئيسية\\"");';
    sc += '};';
    sc += 'if("serviceWorker"in navigator)navigator.serviceWorker.register("/service-worker.js").catch(function(){});';
    sc += 'window.addEventListener("appinstalled",function(){setTimeout(function(){var s=document.getElementById("_catafast-sp");if(s)s.remove()},500)});';
    sc += '}';
    // Anti-devtools — always active
    sc += 'setInterval(function(){try{var e=new Error();if(e.stack&&/devtools|debugger/i.test(e.stack.toLowerCase())){var sp=document.getElementById("_catafast-sp");if(sp)sp.innerHTML="<div style=\'display:flex;align-items:center;justify-content:center;height:100vh;background:#0f172a;color:#ef4444;font-family:sans-serif;text-align:center;padding:20px\'><div><div style=\'font-size:64px;margin-bottom:20px\'>🚫</div><h2 style=\'color:#fff;margin-bottom:10px\'>ممنوع فتح أدوات المطور</h2><p style=\'color:#64748b;font-size:14px\'>تم إغلاق التطبيق لأسباب أمنية</p></div></div>"}}catch(e){}},800);';
    sc += 'window.addEventListener("resize",function(){if(window.outerHeight-window.innerHeight>100||window.outerWidth-window.innerWidth>100){var sp=document.getElementById("_catafast-sp");if(sp)sp.innerHTML="<div style=\'display:flex;align-items:center;justify-content:center;height:100vh;background:#0f172a;color:#ef4444;font-family:sans-serif;text-align:center;padding:20px\'><div><div style=\'font-size:64px;margin-bottom:20px\'>🚫</div><h2 style=\'color:#fff;margin-bottom:10px\'>ممنوع فتح أدوات المطور</h2><p style=\'color:#64748b;font-size:14px\'>تم إغلاق التطبيق لأسباب أمنية</p></div></div>"}});';
    sc += 'document.addEventListener("contextmenu",function(e){e.preventDefault()});';
    sc += 'document.addEventListener("keydown",function(e){if(e.key==="F12"||e.keyCode===123||(e.ctrlKey&&e.shiftKey&&(e.key==="I"||e.key==="J"||e.key==="C"||e.key==="i"||e.key==="j"||e.key==="c"))||(e.ctrlKey&&e.key==="U")||(e.ctrlKey&&e.shiftKey&&e.key==="Delete")){e.preventDefault();e.stopPropagation()}});';
    sc += 'if(location.protocol!=="file:"){console.log=function(){};console.warn=function(){};console.error=function(){};console.info=function(){};console.debug=function(){};console.trace=function(){}}';
    sc += '}</script>';
    html = html.replace('</body>', sc + '\n</body>');
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
    // Cache all exercise GIFs for offline
    fetch('assets/exercises/exercises_full.js').then(function(r) { return r.text(); }).then(function(t) {
      var s = t.indexOf('['); var e = t.lastIndexOf(']');
      if (s !== -1 && e !== -1) {
        try {
          var data = JSON.parse(t.substring(s, e + 1));
          caches.open(CACHE_NAME).then(function(c) {
            data.forEach(function(item) {
              if (item.gif_url) {
                var gif = item.gif_url;
                if (gif.indexOf('//') === -1) gif = '/' + gif.replace(/^\/+/, '');
                fetch(gif).then(function(r) { if (r.ok) c.put(gif, r); }).catch(function() {});
              }
            });
          });
        } catch (_) {}
      }
    }).catch(function() {});
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
