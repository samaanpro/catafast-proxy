const express = require('express');
const path = require('path');
const fs = require('fs');
const url = require('url');

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
    sc += 'function _fixScroll(){document.documentElement.style.overflow="auto";document.documentElement.style.height="auto";document.body.style.overflow="auto";document.body.style.height="auto"}';
    sc += 'if(window.matchMedia("(display-mode:standalone)").matches||window.navigator.standalone===true){if(_sp){_sp.remove()}_fixScroll();if("serviceWorker"in navigator){navigator.serviceWorker.register("/service-worker.js").then(function(r){if(r.active)r.active.postMessage({action:"CACHE_ALL"})}).catch(function(){})}}else{';
    sc += 'var _ib=document.getElementById("_catafast-ibtn");if(_ib){';
    sc += 'var _dp=null;';
    sc += 'var _it=setTimeout(function(){var _p=_sp.querySelector("p");if(_p)_p.textContent="التطبيق مثبت - افتحه من الشاشة الرئيسية";var _c=_sp.querySelector("._ci");if(_c)_c.textContent="📲";var _h2=_sp.querySelector("h2");if(_h2)_h2.textContent="التطبيق مثبت";_ib.style.display="none"},3000);';
    sc += 'window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();_dp=e;clearTimeout(_it)});';
    sc += '_ib.onclick=function(){';
    sc += 'if(_dp){_dp.prompt();_dp.userChoice.then(function(){_dp=null;if(window.matchMedia("(display-mode:standalone)").matches){var s=document.getElementById("_catafast-sp");if(s)s.remove();_fixScroll()}});return}';
    sc += 'var _ios=/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream;';
    sc += 'if(_ios){_ib.textContent="⬆️ مشاركة ← إضافة للشاشة الرئيسية";_ib.style.pointerEvents="none";setTimeout(function(){_ib.innerHTML="📥 تثبيت التطبيق";_ib.style.pointerEvents="auto"},6000);return}';
    sc += 'var _h=_sp.querySelector("p");if(_h){_h.style.cssText="color:#94a3b8;font-size:13px;line-height:1.6;margin-top:20px";_h.textContent="1- افتح قائمة المتصفح (⋮) 2- اختر \\"تثبيت التطبيق\\" 3- اضغط تثبيت"};_ib.style.display="none"';
    sc += '};';
    sc += 'if("serviceWorker"in navigator)navigator.serviceWorker.register("/service-worker.js").then(function(r){if(r.active)r.active.postMessage({action:"CACHE_ALL"})}).catch(function(){});';
    sc += 'window.addEventListener("appinstalled",function(){setTimeout(function(){var s=document.getElementById("_catafast-sp");if(s)s.remove();_fixScroll()},500)});';
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
  '/app.js',
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
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(resp) {
        if (resp && resp.status === 200) {
          var clone = resp.clone();
          caches.open(CACHE_NAME).then(function(c) { c.put(e.request, clone); });
        }
        return resp;
      }).catch(function() { return new Response('', { status: 503 }); });
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

// ======================== GIF LFS Restorer ========================
// Vercel deploys Git LFS pointer files instead of real GIFs.
// This middleware detects LFS pointers, checks /tmp for a previously
// restored copy, then falls back to downloading from GitHub's LFS CDN.
const LFS_HEADER = 'version https://git-lfs.github.com/spec/v1';
const GITHUB_LFS_CDN = 'https://media.githubusercontent.com/media/samaanpro/catafast-proxy/main';
const TRANSPARENT_GIF = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
var LFS_CACHE = {}; // In-memory cache keyed by URL path

app.use((req, res, next) => {
  if (!req.path.endsWith('.gif')) return next();
  // Check in-memory cache first (fast)
  if (LFS_CACHE[req.path]) {
    return res.type('image/gif').send(LFS_CACHE[req.path]);
  }
  const filePath = path.join(USER_DIR, req.path.replace(/^\//, ''));
  if (!fs.existsSync(filePath)) return next();
  // Quick check if the file is an LFS pointer (first few bytes)
  const fd = fs.openSync(filePath, 'r');
  const buf = Buffer.alloc(LFS_HEADER.length);
  fs.readSync(fd, buf, 0, LFS_HEADER.length, 0);
  fs.closeSync(fd);
  const header = buf.toString('utf-8');
  if (header !== LFS_HEADER) return next(); // Real binary GIF
  // Check /tmp for previously restored file (persists across invocations on same instance)
  const tmpPath = path.join('/tmp', req.path.replace(/^\//, ''));
  if (fs.existsSync(tmpPath)) {
    var data = fs.readFileSync(tmpPath);
    LFS_CACHE[req.path] = data;
    return res.type('image/gif').send(data);
  }
  // Download real file from GitHub LFS CDN
  var cdnUrl = GITHUB_LFS_CDN + req.path;
  var protocol = url.parse(cdnUrl).protocol === 'https:' ? require('https') : require('http');
  protocol.get(cdnUrl, function(cdnRes) {
    if (cdnRes.statusCode === 200) {
      var chunks = [];
      cdnRes.on('data', function(c) { chunks.push(c); });
      cdnRes.on('end', function() {
        var realBuf = Buffer.concat(chunks);
        LFS_CACHE[req.path] = realBuf;
        try { fs.writeFileSync(tmpPath, realBuf); } catch (_) {}
        res.type('image/gif').send(realBuf);
      });
    } else {
      res.type('image/gif').send(TRANSPARENT_GIF);
    }
  }).on('error', function() {
    res.type('image/gif').send(TRANSPARENT_GIF);
  });
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
