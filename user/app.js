// ==================== Catafast GYM - User App ====================
const SUPABASE_URL = 'https://amqxrxpasxrhfwqyynsa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtcXhyeHBhc3hyaGZ3cXl5bnNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMTU2OTksImV4cCI6MjA5MzU5MTY5OX0.xPRzGBcpzNaHIy7vjmJuyRGSh2zmjTvxcA1yPfr5Xfg';

function userCopyDevPhone() {
    var u = normalizeUpdateRecord(appSettings.app_update || {});
    var num = u.developer_phone || '01063353900';
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(num).catch(function(){}); }
    else { var i = document.createElement('input'); i.value = num; document.body.appendChild(i); i.select(); document.execCommand('copy'); i.remove(); }
    showToast('✅ تم نسخ رقم المطور');
}
async function hashPassword(pw) {
    const data = new TextEncoder().encode(pw);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}
let db = null;
let currentUser = null;
const CURRENT_APP_VERSION = '2.0.0';
try { localStorage.setItem('katfast_app_version', CURRENT_APP_VERSION); } catch (_) { }

// ==================== Unified Premium Theme (Dark/Light) + Flicker Guard ====================
(function() {
    var _s = document.createElement('style');
    _s.id = 'premium-theme';
    var _t = localStorage.getItem('katfast_user_theme') || localStorage.getItem('katfast_theme');
    if (_t !== 'dark' && _t !== 'light') _t = 'dark';
    // Minified CSS: :root dark defaults + body.light-mode overrides + all animations + dark/light selectors via _t
    var _nt = _t === 'dark' ? 'dark' : 'light';
_s.textContent = ':root{--u-bg:#080B11;--u-surface:rgba(14,18,30,0.88);--u-text:#e2e8f0;--u-text2:rgba(226,232,240,0.55);--u-line:rgba(0,212,255,0.1);--u-blue:#00D4FF;--u-green:#00FF41;--u-cyan:#00D4AA;--u-glow-b:0 0 24px rgba(0,212,255,0.18);--u-glow-g:0 0 20px rgba(0,255,65,0.15);--u-card:var(--u-surface);--u-btn-text:#080B11;--u-modal-shadow:0 20px 60px rgba(0,0,0,0.6);--u-input-bg:rgba(0,0,0,0.3);--u-dev-bg:rgba(11,15,25,0.95)}body.light-mode{--u-bg:#F8FAFC;--u-surface:rgba(255,255,255,0.85);--u-text:#1e293b;--u-text2:rgba(30,41,59,0.5);--u-line:rgba(0,212,255,0.06);--u-card:rgba(255,255,255,0.92);--u-btn-text:#fff;--u-modal-shadow:0 20px 40px rgba(0,0,0,0.08);--u-input-bg:rgba(255,255,255,0.85);--u-dev-bg:rgba(248,250,252,0.96)}@keyframes cascadeFade{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}@keyframes modalEnter{0%{opacity:0;transform:scale(0.85)rotateX(8deg);backdrop-filter:blur(0)}60%{transform:scale(1.02)rotateX(-2deg)}100%{opacity:1;transform:scale(1)rotateX(0);backdrop-filter:blur(8px)}}@keyframes shrinkFade{0%{opacity:1;max-height:200px;padding:12px 16px;transform:scale(1)}60%{opacity:0.3;max-height:60px;padding:4px 16px;transform:scale(0.97)}100%{opacity:0;max-height:0;padding:0 16px;transform:scale(0.9)}}body.'+_nt+'-mode{background:var(--u-bg)!important}body.'+_nt+'-mode .glass-card,body.'+_nt+'-mode .modal-card,body.'+_nt+'-mode .tracking-input{background:var(--u-card)!important;backdrop-filter:blur(16px)!important;-webkit-backdrop-filter:blur(16px)!important;border:1px solid var(--u-line)!important;border-radius:16px!important;transition:all 0.35s cubic-bezier(0.25,0.46,0.45,0.94)!important}body.'+_nt+'-mode .btn-premium,body.'+_nt+'-mode .btn-primary{background:linear-gradient(135deg,#00D4FF,#00FF41)!important;background-size:200% 200%!important;color:var(--u-btn-text)!important;font-weight:800!important;border:none!important;box-shadow:var(--u-glow-b)!important;transition:all 0.4s ease!important}body.'+_nt+'-mode .btn-premium:hover{background-position:100% 50%!important;transform:translateY(-2px)!important}body.'+_nt+'-mode .badge-gold{background:rgba(0,255,65,0.12)!important;color:var(--u-green)!important;border:1px solid rgba(0,255,65,0.2)!important}body.'+_nt+'-mode .bottom-nav{background:var(--u-card)!important;backdrop-filter:blur(20px)!important;border-top:1px solid var(--u-line)!important}body.'+_nt+'-mode input,body.'+_nt+'-mode select,body.'+_nt+'-mode textarea{background:var(--u-input-bg)!important;border:1px solid var(--u-line)!important;color:var(--u-text)!important;border-radius:10px!important;padding:12px 14px!important}body.'+_nt+'-mode input:focus{border-color:var(--u-blue)!important;box-shadow:0 0 0 3px rgba(0,212,255,0.08)!important}body.'+_nt+'-mode .dev-panel{background:var(--u-dev-bg)!important;border:1px solid var(--u-blue)!important;box-shadow:0 0 40px rgba(0,212,255,0.08)!important;border-radius:16px!important;margin:16px}body.'+_nt+'-mode .dev-panel h3{color:var(--u-green)!important;font-family:"Courier New",monospace!important}body.'+_nt+'-mode .dev-panel .stat-box{background:rgba(0,255,65,0.03)!important;border:1px solid rgba(0,255,65,0.08)!important;border-radius:10px!important;padding:12px!important}body.'+_nt+'-mode .dev-panel .stat-value{color:var(--u-green)!important;font-family:"Courier New",monospace!important;font-size:18px!important;font-weight:700!important}body.'+_nt+'-mode .modal-overlay[style*="display: flex"],body.'+_nt+'-mode .modal-overlay[style*="display:flex"]{animation:modalEnter 0.45s cubic-bezier(0.34,1.56,0.64,1) both!important;backdrop-filter:blur(6px)!important}body.'+_nt+'-mode .modal-overlay>div{background:var(--u-card)!important;backdrop-filter:blur(18px)!important;border:1px solid var(--u-line)!important;border-radius:20px!important;box-shadow:var(--u-modal-shadow)!important}body.'+_nt+'-mode tr.deleting-row{animation:shrinkFade 0.45s cubic-bezier(0.55,0,0.1,1) forwards!important;overflow:hidden!important}body.'+_nt+'-mode table tbody tr{animation:cascadeFade 0.5s ease-out both;transition:all 0.3s ease!important}body.'+_nt+'-mode table tbody tr:hover{transform:translateY(-4px)!important;border-color:rgba(0,212,255,0.2)!important;box-shadow:0 8px 30px rgba(0,212,255,0.08)!important}';
    document.head.appendChild(_s);
    document.documentElement.classList.add('theme-ready');
    if (document.body) document.body.classList.add(_nt + '-mode');
    else document.addEventListener('DOMContentLoaded', function() { document.body.classList.add(_nt + '-mode'); });
})();

// ==================== DB Translation Mapper ====================
var _dbTransMap = {
    'ذكر':'Male','أنثى':'Female','لاعب':'Athlete','كابتن':'Captain','مطور برمجيات':'Programmer',
    'نشط':'Active','منتهي':'Expired','معلق':'Pending','قيد المراجعة':'Pending Review','منشور':'Published',
    'غير مدفوع':'Unpaid','مدفوع':'Paid','مديونية':'Debt','اجمالي':'Total','المتبقي':'Remaining',
    'السبت':'Saturday','الأحد':'Sunday','الاثنين':'Monday','الثلاثاء':'Tuesday','الأربعاء':'Wednesday',
    'الخميس':'Thursday','الجمعة':'Friday',
    'يناير':'January','فبراير':'February','مارس':'March','أبريل':'April','مايو':'May','يونيو':'June',
    'يوليو':'July','أغسطس':'August','سبتمبر':'September','أكتوبر':'October','نوفمبر':'November','ديسمبر':'December'
};
function translateDB(str) {
    if (!str || window.userCurrentLang !== 'en') return str;
    return _dbTransMap[str] || str;
}
function translateDBObj(obj, keys) {
    if (!obj || window.userCurrentLang !== 'en') return obj;
    var out = {};
    for (var k in obj) { out[k] = obj[k]; }
    (keys || Object.keys(out)).forEach(function(key) {
        if (typeof out[key] === 'string') out[key] = translateDB(out[key]);
    });
    return out;
}

// ==================== System Log Capture ====================
var _devLogs = [];
var _origConsoleWarn = console.warn;
console.warn = function() {
    _devLogs.push({ ts: new Date().toISOString(), args: Array.from(arguments).join(' ') });
    if (_devLogs.length > 200) _devLogs.shift();
    _origConsoleWarn.apply(console, arguments);
};
function cacheSave(key, data, ttlMs) {
    try {
        var entry = { data: data, ts: Date.now(), ttl: ttlMs || 3600000 };
        localStorage.setItem('kf_cache_' + key, JSON.stringify(entry));
    } catch (_) { console.warn('[SWALLOWED]', _.message || _); }
}
function cacheLoad(key, maxAgeMs) {
    try {
        var raw = localStorage.getItem('kf_cache_' + key);
        if (!raw) return null;
        var entry = JSON.parse(raw);
        if (Date.now() - entry.ts > (maxAgeMs || entry.ttl || 3600000)) return null;
        return entry.data;
    } catch (_) { return null; }
}


// QR and Training Session Tracking
let currentSessionActive = false;
let sessionStartTime = null;
let html5QrScanner = null;
let qrScannerReadyPromise = null;
let attendanceCodeProcessing = false;
var _rawCode = localStorage.getItem('katfast_gym_code');
var cachedGymCode = (_rawCode && _rawCode !== 'null' && _rawCode !== 'undefined') ? _rawCode : null;
['katfast_attendance_records', 'katfast_current_attendance_id', 'katfast_check_in_time', 'katfast_last_attendance_date', 'katfast_current_workout_id'].forEach(function (key) {
    try { localStorage.removeItem(key); } catch (_) { }
});

// ==================== Settings Manager ====================
let appSettings = {};
function loadAppSettingsFromCache() {
    try {
        const cached = localStorage.getItem('katfast_settings_cache');
        if (cached) {
            const parsed = JSON.parse(cached);
            Object.keys(parsed).forEach(k => { appSettings[k] = parsed[k]; });
            applyAppSettings();
        }
        const updateCached = localStorage.getItem('katfast_app_update_cache');
        if (updateCached) {
            appSettings.app_update = JSON.parse(updateCached);
            applyAppSettings();
        }
    } catch (_) { console.warn('[SWALLOWED]', _.message || _); }
}
async function loadAppSettings() {
    loadAppSettingsFromCache();
    try {
        const { data } = await db.from('settings').select('*');
        if (data && data.length > 0) {
            data.forEach(s => { appSettings[s.key] = s.value; });
            localStorage.setItem('katfast_settings_cache', JSON.stringify(appSettings));
            applyAppSettings();
        }
    } catch (_) { console.warn('[SWALLOWED]', _.message || _); }
}
function applyAppSettings() {
    const t = appSettings.theme || {};
    const logoUrl = t.logo_image;
    const logoText = t.logo || '⚡';
    const displayName = String(t.name || 'Catafast GYM').replace(/katfast/ig, 'Catafast').replace(/catafast/ig, 'Catafast').replace(/\s+/g, ' ').trim() || 'Catafast GYM';
    document.querySelectorAll('.app-logo').forEach(el => {
        if (logoUrl) {
            el.innerHTML = '<img src="' + logoUrl + '" style="height:24px;width:auto;vertical-align:middle;margin-inline-end:6px;border-radius:4px;"> ' + displayName;
        } else {
            el.textContent = logoText + ' ' + displayName;
        }
    });
    if (t.name) {
        document.querySelectorAll('.login-logo h1').forEach(el => el.textContent = displayName);
    }
    applyAdSettings();
    checkForcedUpdate();
    applyUserDeveloperBranding();
}
// --- Bottom Nav Zoom Control (50%-100%) ---
window.zoomLevel = parseInt(localStorage.getItem('katfast_zoom') || '100', 10);
function applyUserZoom(level) {
    if (level === undefined) level = window.zoomLevel;
    level = Math.max(50, Math.min(100, level));
    window.zoomLevel = level;
    var nav = document.querySelector('.bottom-nav');
    if (nav) nav.style.zoom = level / 100;
    localStorage.setItem('katfast_zoom', String(level));
    var slider = document.getElementById('userZoomSlider');
    if (slider) slider.value = level;
    var label = document.getElementById('userZoomLabel');
    if (label) label.textContent = level + '%';
}
window.applyUserZoom = applyUserZoom;
function applyUserDeveloperBranding() {
    const u = normalizeUpdateRecord(appSettings.app_update || {});
    const devName = u.developer_name || 'Samaan Nady';
    const devPhone = u.developer_phone || '01063353900';
    var devInfo = document.getElementById('userDevInfo');
    if (devInfo) devInfo.innerHTML = '<i class="fas fa-code"></i> ' + devName + ' — <a href="#" onclick="event.preventDefault();userCopyDevPhone();return false;" style="color:#25D366;text-decoration:none;cursor:pointer;"><i class="fab fa-whatsapp"></i> واتساب</a>';
    var footerName = document.getElementById('userFooterName');
    if (footerName) footerName.textContent = devName;
    var footerPhone = document.getElementById('userFooterPhone');
    if (footerPhone) { footerPhone.textContent = devPhone; footerPhone.href = 'tel:' + devPhone; }
    var profName = document.getElementById('userDevNameInProfile');
    if (profName) profName.textContent = devName;
    var waBtns = ['profileWhatsAppBtn', 'aboutWhatsAppBtn'];
    waBtns.forEach(function(id){
        var btn = document.getElementById(id);
        if (btn) {
            btn.href = '#';
            btn.onclick = function(e) { e.preventDefault(); userCopyDevPhone(); };
            btn.target = '';
            btn.innerHTML = '<i class="fab fa-whatsapp" style="font-size:20px;"></i> واتساب';
        }
    });
    ['userProfileFooterName','userAboutFooterName'].forEach(function(id){
        var el = document.getElementById(id);
        if (el) el.textContent = devName;
    });
    ['userProfileFooterPhone','userAboutFooterPhone'].forEach(function(id){
        var el = document.getElementById(id);
        if (el) el.innerHTML = '<a href="#" onclick="event.preventDefault();userCopyDevPhone();return false;" style="color:#25D366;text-decoration:none;cursor:pointer;"><i class="fab fa-whatsapp"></i> واتساب</a>';
    });
}

var _capBase = 'assets/img_cap/';
const CAPTAIN_PROFILE = {
    nameAr: 'اكرم يوسف',
    titleAr: 'مدرب معتمد - تدريب رياضي متكامل',
    phone: '01063760246',
    whatsapp: '201063760246',
    bioAr: 'مدرب معتمد بخبرة واسعة في التدريب الرياضي وبناء الأجسام. حاصل على شهادات معتمدة في التدريب الرياضي المتقدم، تصحيح الأداء الحركي، التغذية الرياضية، والتأهيل البدني. متخصص في تصميم برامج تدريبية مخصصة تناسب مستوى كل لاعب مع متابعة يومية مستمرة لضمان تحقيق أفضل النتائج بأمان.',
    certificates: [
        { image: _capBase + '1.jpg' },
        { image: _capBase + '2.jpg' },
        { image: _capBase + 'IMG-20260620-WA0005.jpg' },
        { image: _capBase + 'IMG-20260620-WA0006.jpg' },
        { image: _capBase + 'IMG-20260620-WA0007.jpg' },
        { image: _capBase + 'IMG-20260620-WA0008.jpg' },
        { image: _capBase + 'IMG-20260620-WA0009.jpg' },
        { image: _capBase + 'IMG-20260620-WA0010.jpg' },
        { image: _capBase + 'IMG-20260620-WA0011.jpg' },
        { image: _capBase + 'IMG-20260620-WA0012.jpg' }
    ],
    image: _capBase + 'profile.jpg'
};

async function copyCaptainPhone() {
    const text = CAPTAIN_PROFILE.phone;
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
        } else {
            const input = document.createElement('input');
            input.value = text;
            document.body.appendChild(input);
            input.select();
            input.setSelectionRange(0, input.value.length);
            document.execCommand('copy');
            input.remove();
        }
        showToast('✅ تم نسخ الرقم');
    } catch (_) {
        showToast('✅ تم نسخ الرقم');
    }
}

function renderCaptainAboutPage() {
    var photo = document.getElementById('captainPhoto');
    if (photo && photo.src !== CAPTAIN_PROFILE.image) photo.src = CAPTAIN_PROFILE.image;
    var name = document.getElementById('captainName');
    var title = document.getElementById('captainTitle');
    var bio = document.getElementById('captainBio');
    var certs = document.getElementById('captainCertificates');
    var nameSmall = document.getElementById('captainNameSmall');
    var phone = document.getElementById('captainPhone');
    var callBtn = document.getElementById('captainCallBtn');
    var waBtn = document.getElementById('captainWhatsAppBtn');
    var footerNote = document.getElementById('captainFooterNote');
    if (name) name.textContent = CAPTAIN_PROFILE.nameAr;
    if (title) title.textContent = CAPTAIN_PROFILE.titleAr;
    if (bio) bio.textContent = CAPTAIN_PROFILE.bioAr;
    if (certs) {
        certs.innerHTML = CAPTAIN_PROFILE.certificates.map(function (item) {
            return '<div style="max-width:100%;margin-bottom:12px;border-radius:12px;overflow:hidden;text-align:center;"><img src="' + item.image + '" alt="" style="display:block;max-width:100%;height:auto;border-radius:12px;"></div>';
        }).join('');
        certs.style.display = 'block';
    }
    if (nameSmall) nameSmall.textContent = CAPTAIN_PROFILE.nameAr;
    if (phone) phone.textContent = CAPTAIN_PROFILE.phone;
    if (callBtn) {
        callBtn.href = '#';
        callBtn.onclick = function (e) {
            e.preventDefault();
            copyCaptainPhone();
        };
    }
    if (waBtn) {
        waBtn.href = '#';
        waBtn.onclick = function (e) {
            e.preventDefault();
            copyCaptainPhone();
        };
    }
    if (footerNote) footerNote.textContent = '';
}

function checkForcedUpdate() {
    let storedUpdate = {};
    try { storedUpdate = JSON.parse(localStorage.getItem('katfast_app_update_cache') || '{}') || {}; } catch (_) { storedUpdate = {}; }
    const u = normalizeUpdateRecord(appSettings.app_update || storedUpdate);
    const targetVersion = u.version || u.version_number;
    const targetUrl = u.download_url || u.apk_url || '';
    const isMobileOrTablet = window.matchMedia && window.matchMedia('(max-width: 1024px), (pointer: coarse)').matches;
    const overlay = document.getElementById('updateOverlay');
    const desktopNotice = document.getElementById('desktopUpdateNotice');
    // Only prompt when the device is online and the remote version is newer than this installed build.
    // Offline must never trap the user in the update screen.
    if (!navigator.onLine || !targetVersion || !targetUrl || !isRemoteVersionNewer(targetVersion, CURRENT_APP_VERSION)) {
        if (overlay) overlay.style.display = 'none';
        if (desktopNotice) desktopNotice.style.display = 'none';
        return;
    }
    if (overlay) overlay.style.display = isMobileOrTablet ? 'flex' : 'none';
    if (desktopNotice) {
        desktopNotice.style.display = isMobileOrTablet ? 'none' : 'flex';
        desktopNotice.querySelector('.desktop-update-version').textContent = targetVersion;
        desktopNotice.querySelector('.desktop-update-desc').textContent = u.notes || __('updateRequired');
    }
    const versionNode = document.getElementById('updateVersionDisplay');
    const notesNode = document.getElementById('updateNotesDisplay');
    if (versionNode) versionNode.textContent = __('newVersion') + targetVersion;
    if (notesNode) notesNode.textContent = u.notes || '';
    const dlBtn = document.getElementById('updateDownloadBtn');
    if (dlBtn) {
        dlBtn.href = targetUrl || '#';
        dlBtn.onclick = function (ev) {
            if (!targetUrl) {
                ev.preventDefault();
                return false;
            }
            recordUpdateClick(u);
        };
        dlBtn.style.pointerEvents = targetUrl ? 'auto' : 'none';
        dlBtn.style.opacity = targetUrl ? '1' : '0.55';
        dlBtn.innerHTML = '<i class="fas fa-download"></i> <span data-i18n="downloadUpdate">تحميل التحديث</span>';
    }
}

window.addEventListener('focus', function () {
    if (appSettings && appSettings.app_update) checkForcedUpdate();
});
window.addEventListener('online', function () {
    if (appSettings && appSettings.app_update) checkForcedUpdate();
});
window.addEventListener('offline', function () {
    const overlay = document.getElementById('updateOverlay');
    const desktopNotice = document.getElementById('desktopUpdateNotice');
    if (overlay) overlay.style.display = 'none';
    if (desktopNotice) desktopNotice.style.display = 'none';
});
document.addEventListener('visibilitychange', function () {
    if (!document.hidden && appSettings && appSettings.app_update) checkForcedUpdate();
});
setInterval(function () {
    if (appSettings && appSettings.app_update) checkForcedUpdate();
}, 60000);

function applyAdSettings() {
    const ads = appSettings.ads || {};
    const enabled = ads.enabled !== false;
    for (let i = 1; i <= 3; i++) {
        const slot = document.getElementById('adSlot' + i);
        if (!slot) continue;
        if (!enabled || !ads['code' + i]) {
            slot.style.display = 'none';
            continue;
        }
        slot.style.display = 'flex';
        slot.className = 'ad-slot ad-slot-filled';
        slot.innerHTML = ads['code' + i];
    }
}

function isMobileWhatsAppDevice() {
    if (navigator.userAgentData && typeof navigator.userAgentData.mobile === 'boolean') {
        return navigator.userAgentData.mobile;
    }
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
}

window.openWhatsAppSmart = function (phone, text) {
    var digits = String(phone || '').replace(/\D/g, '');
    var msg = text ? encodeURIComponent(text) : '';
    var appUrl = 'whatsapp://send?phone=' + digits + (msg ? '&text=' + msg : '');
    var webUrl = 'https://wa.me/' + digits + (msg ? '?text=' + msg : '');
    if (isMobileWhatsAppDevice()) {
        window.location.href = appUrl;
        setTimeout(function () {
            if (document.visibilityState === 'visible') window.location.href = webUrl;
        }, 700);
    } else {
        window.open(webUrl, '_blank', 'noopener');
    }
};

function normalizeUpdateRecord(raw) {
    var src = raw || {};
    return {
        version: String(src.version_number || src.version || src.versionNo || '').trim(),
        version_number: String(src.version_number || src.version || src.versionNo || '').trim(),
        site_url: String(src.site_url || src.page_url || src.portal_url || '').trim(),
        apk_url: String(src.download_url || src.apk_url || src.url || '').trim(),
        download_url: String(src.download_url || src.apk_url || src.url || '').trim(),
        notes: String(src.notes || src.release_notes || '').trim(),
        force: src.force !== false,
        developer_name: String(src.developer_name || src.developer || '').trim(),
        developer_phone: String(src.developer_phone || src.phone || '').trim()
    };
}

function _splitVersion(v) {
    return String(v || '').trim().split(/[^0-9]+/).filter(Boolean).map(function (n) { return parseInt(n, 10) || 0; });
}

function isRemoteVersionNewer(remoteVersion, currentVersion) {
    var remote = _splitVersion(remoteVersion);
    var current = _splitVersion(currentVersion);
    var len = Math.max(remote.length, current.length);
    for (var i = 0; i < len; i++) {
        var rv = remote[i] || 0;
        var cv = current[i] || 0;
        if (rv > cv) return true;
        if (rv < cv) return false;
    }
    return false;
}

async function loadLatestAppUpdate() {
    try {
        const cached = normalizeUpdateRecord(appSettings.app_update || {});
        if (!db) return cached;
        const { data, error } = await db.from('app_updates').select('*').order('id', { ascending: false }).limit(1);
        if (error) throw error;
        if (data && data[0]) {
            appSettings.app_update = Object.assign({}, cached, normalizeUpdateRecord(data[0]));
        } else {
            try {
                const fallback = await db.from('settings').select('value').eq('key', 'app_update').maybeSingle();
                const fallbackUpdate = normalizeUpdateRecord(fallback?.data?.value || {});
                appSettings.app_update = Object.assign({}, cached, fallbackUpdate);
            } catch (_) {
                appSettings.app_update = cached;
            }
        }
        localStorage.setItem('katfast_app_update_cache', JSON.stringify(appSettings.app_update));
        localStorage.setItem('katfast_settings_cache', JSON.stringify(appSettings));
        checkForcedUpdate();
    } catch (_) { console.warn('[SWALLOWED]', _.message || _); }
    return normalizeUpdateRecord(appSettings.app_update);
}

async function recordUpdateClick(update) {
    try {
        if (!db) return;
        const current = normalizeUpdateRecord(update || appSettings.app_update);
        await db.from('app_update_events').insert([{
            user_id: currentUser && currentUser.id ? currentUser.id : null,
            user_email: currentUser && currentUser.email ? currentUser.email : null,
            version_number: current.version || current.version_number || '',
            action: 'click_update',
            clicked_at: new Date().toISOString()
        }]);
    } catch (_) { console.warn('[SWALLOWED]', _.message || _); }
}

window.recordUpdateClick = recordUpdateClick;

// ==================== i18n Helper ====================
window.__ = function (key, replacements) {
    var dict = window.userI18n || {};
    var val = dict[key] || key;
    if (replacements && typeof replacements === 'object') {
        for (var k in replacements) {
            val = val.split('{' + k + '}').join(replacements[k]);
        }
    }
    return val;
};

// ==================== Init ====================
var USER_TIP_KEYS = ['tip1', 'tip2', 'tip3', 'tip4', 'tip5', 'tip6', 'tip7', 'tip8'];
function rotateUserTip() {
    const el = document.getElementById('userTip');
    if (el) {
        const day = new Date().getDate();
        el.textContent = __(USER_TIP_KEYS[day % USER_TIP_KEYS.length]);
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    rotateUserTip();
    await initSyncQueue();
    if (window.supabase) {
        db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.warn('Supabase library not loaded — offline mode only');
    }
    // Apply saved zoom level immediately
    applyUserZoom(window.zoomLevel);
    renderCaptainAboutPage();

    // Load cached settings early for branding on login page
    loadAppSettingsFromCache();
    if (db) await loadLatestAppUpdate();
    // Re-apply branding after server fetch (app_updates may have developer info)
    applyAppSettings();
    // Load cached notifications
    try {
        const cachedNotifs = localStorage.getItem('katfast_notif_cache');
        if (cachedNotifs) { userNotifications = JSON.parse(cachedNotifs); updateNotifBadge(); }
    } catch (_) { console.warn('[SWALLOWED]', _.message || _); }

    ensureQrScannerReady().catch(function () {});

    // Preload exercise library for picker — deferred to avoid blocking
    if (document.readyState === 'complete') {
        loadUserExerciseLibrary();
    } else {
        window.addEventListener('load', function () { loadUserExerciseLibrary(); });
    }

    // Adapt user login form dynamically for Email & Password authentication
    enrichUserLoginForm();

    // Check saved session
    const saved = localStorage.getItem('katfast_user');
    if (saved) {
        currentUser = JSON.parse(saved);
        // Auto-migrate old btoa password to SHA-256
        const oldPw = localStorage.getItem('katfast_user_pw');
        if (oldPw && oldPw.length !== 64) {
            try { localStorage.setItem('katfast_user_pw', await hashPassword(currentUser.password || oldPw)); } catch (_) { console.warn('[SWALLOWED]', _.message || _); }
        }
        checkSubscription();
        await syncUserSubscription(); // ✅ Fix #4: awaited to avoid race condition
    }

    if (currentUser) {
        loadAppSettings().catch(function () {});
        showApp();
        updateUserUI();
        loadOfficialSchedules();
        loadMySchedule();
        fetchGymCode();
        loadProgressPhotos();
        rotateDailyTips();
        
        // Phase 3 Checkpoints
        checkOfflineLock();
        setupSyncListeners();
        setupAccountStateWatchers();
        updateSyncBadge();
        processSyncQueue();
        restoreActiveSession();
        loadUserNotifications();

        // Auto-refresh: update data periodically and on connectivity change
        setupAutoRefresh();
    } else {
        showLogin();
    }
    document.body?.classList.add('boot-ready');
    window.setTimeout(hideBootSplash, 420);

    // Event Listeners

    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('addPhotoBtn').addEventListener('click', () => document.getElementById('photoInput').click());
    document.getElementById('photoInput').addEventListener('change', function(e) { window.handlePhotoCapture(e); });
    
    document.getElementById('createMyScheduleBtn')?.addEventListener('click', () => {
        document.getElementById('createScheduleForm').style.display = 'block';
        document.getElementById('createMyScheduleBtn').style.display = 'none';
    });
    document.getElementById('saveMyScheduleBtn')?.addEventListener('click', saveMySchedule);
    // requestShareBtn uses onclick in HTML

    // Page navigation - bottom nav
    document.querySelectorAll('[data-page]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (checkOfflineLock()) return; // Block actions if locked
            navigateTo(btn.dataset.page);
            const p = btn.dataset.page;
            if (p === 'profile') populateUserProfile();
            if (p === 'tracking') { renderWeightChart(); renderTodayWorkouts(); }
            if (p === 'challenges') renderChallenge();
        });
    });

    // Tab switching in schedules
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.schedule-content').forEach(s => s.classList.remove('active'));
            btn.classList.add('active');
            const target = document.getElementById(btn.dataset.tab);
            if (target) target.classList.add('active');
        });
    });

    // Attendance UI removed from the user app; schedules open directly.
});

// ==================== Dynamic Form Enrichment ====================
function enrichUserLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    form.dataset.enriched = "true";
}

// ==================== Navigation ====================
function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('[data-page]').forEach(b => b.classList.remove('active'));
    const target = document.getElementById(page + 'Page');
    if (target) target.classList.add('active');
    document.querySelectorAll(`[data-page="${page}"]`).forEach(b => b.classList.add('active'));
    if (page === 'attendance') loadAttendancePage();
    if (page === 'profile') populateUserProfile();
    if (page === 'about') renderCaptainAboutPage();
}

window.retrySyncAttendance = function () {
    var queue = getSyncQueue();
    var pending = queue.filter(function (t) { return t.type === 'attendance' || t.type === 'update_attendance'; });
    if (pending.length === 0) { showToast('⚠️ لا توجد مهام معلقة للمزامنة'); return; }
    processSyncQueue().then(function () {
        showToast('✅ تمت المزامنة');
        loadAttendancePage();
    }).catch(function () {
        showToast('❌ فشلت المزامنة', 'error');
    });
};

function _renderAttendancePage(records) {
    var el = document.getElementById('attendanceList');
    if (!el) return;
    var totalDates = {};
    var total = 0;
    var thisMonthStr = new Date().toISOString().substring(0, 7);
    var thisMonthDates = {};
    var thisMonth = 0;
    var now = new Date();
    for (var ri = 0; ri < records.length; ri++) {
        var rd = records[ri].date;
        if (rd && !totalDates[rd]) {
            totalDates[rd] = true;
            total++;
        }
        if (rd && rd.substring(0, 7) === thisMonthStr && !thisMonthDates[rd]) {
            thisMonthDates[rd] = true;
            thisMonth++;
        }
    }
    var sorted = records.slice().sort(function (a, b) {
        var da = (a.date || '') + 'T' + (a.check_in_time || '');
        var db = (b.date || '') + 'T' + (b.check_in_time || '');
        return da > db ? -1 : da < db ? 1 : 0;
    });
    var streak = 0;
    var today = now.toISOString().split('T')[0];
    var streakDates = {};
    var streakList = [];
    for (var sd = 0; sd < sorted.length; sd++) {
        if (sorted[sd].date && !streakDates[sorted[sd].date]) {
            streakDates[sorted[sd].date] = true;
            streakList.push(sorted[sd].date);
        }
    }
    for (var si = 0; si < streakList.length; si++) {
        var expected = new Date();
        expected.setDate(expected.getDate() - si);
        var expectedStr = expected.toISOString().split('T')[0];
        if (streakList[si] === expectedStr) streak++;
        else break;
    }
    document.getElementById('attTotalDays').textContent = String(total);
    document.getElementById('attThisMonth').textContent = String(thisMonth);
    document.getElementById('attStreak').textContent = String(streak);
    el.innerHTML = sorted.slice(0, 50).map(function (r) {
        var d = r.date || '—';
        var inTime = _formatAttendanceTime(r.check_in_time || r.created_at);
        var outTime = _formatAttendanceTime(r.check_out_time);
        var dateLabel = _formatAttendanceDate(r.created_at || r.date);
        var wn = '';
        if (r.workout_id) {
            var cached = cacheLoad('official_schedules', 31536000000) || [];
            var found = cached.find(function (s) { return String(s.id) === String(r.workout_id); });
            if (found) wn = found.name || '';
        }
        var dur = r.duration_minutes ? r.duration_minutes + ' د' : '—';
        var syncIcon = r.synced ? '' : '<span style="color:var(--warning);margin-left:4px;" title="لم تتم المزامنة">🔄</span>';
        return '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;padding:10px 12px;background:rgba(255,255,255,0.03);border:1px solid var(--line);border-radius:12px;font-size:12px;box-shadow:0 10px 24px rgba(0,0,0,0.08);">' +
            '<div style="flex:1;min-width:0;">' +
                '<div style="display:flex;align-items:center;gap:6px;font-weight:700;">' + syncIcon + '<span>' + d + '</span><span style="opacity:0.45;font-size:10px;">' + dateLabel + '</span></div>' +
                '<div style="margin-top:5px;display:flex;flex-wrap:wrap;gap:8px;line-height:1.5;opacity:0.78;">' +
                    '<span><i class="fas fa-sign-in-alt"></i> دخول ' + inTime + '</span>' +
                    '<span><i class="fas fa-sign-out-alt"></i> خروج ' + outTime + '</span>' +
                    (wn ? '<span><i class="fas fa-dumbbell"></i> ' + wn + '</span>' : '') +
                '</div>' +
            '</div>' +
            '<span style="opacity:0.55;white-space:nowrap;">' + dur + '</span></div>';
    }).join('');
}

async function loadAttendancePage() {
    var el = document.getElementById('attendanceList');
    if (!el) return;
    el.innerHTML = '<div style="text-align:center;padding:20px;font-size:13px;opacity:0.5;">جاري التحميل...</div>';
    try {
        var records = _attendanceList();
        var uid = currentUser && currentUser.id;
        if (uid) {
            records = records.filter(function (r) { return String(r.user_id) === String(uid); });
        }
        // Try to fetch server records in background to merge
        if (navigator.onLine && db && uid) {
            db.from('attendance_log').select('*').eq('user_id', uid).order('date', { ascending: false }).limit(90).then(function (res) {
                if (res.data && res.data.length > 0) {
                    var local = _attendanceList().filter(function (r) { return String(r.user_id) === String(uid); });
                    res.data.forEach(function (sr) {
                        var exists = false;
                        for (var li = 0; li < local.length; li++) {
                            if ((sr.id && String(local[li].id) === String(sr.id)) ||
                                (local[li].date == sr.date && String(local[li].created_at || '') === String(sr.created_at || '') && String(local[li].check_in_time || '') === String(sr.check_in_time || ''))) {
                                exists = true;
                                break;
                            }
                        }
                        if (!exists) { sr.synced = true; local.push(sr); }
                    });
                    localStorage.setItem('katfast_attendance_records', JSON.stringify(local));
                    _renderAttendancePage(local);
                }
            }).catch(function () {});
        }
        if (records.length === 0) {
            el.innerHTML = '<div style="text-align:center;padding:20px;font-size:13px;opacity:0.5;">لا توجد سجلات حضور بعد</div>';
            document.getElementById('attTotalDays').textContent = '0';
            document.getElementById('attThisMonth').textContent = '0';
            document.getElementById('attStreak').textContent = '0';
            return;
        }
        _renderAttendancePage(records);
    } catch (_) {
        el.innerHTML = '<div style="text-align:center;padding:20px;font-size:13px;color:var(--danger);">خطأ في تحميل بيانات الحضور</div>';
    }
}

function showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('appContainer').style.display = 'none';
    document.body?.classList.add('boot-ready');
}
function showApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appContainer').style.display = 'block';
    document.body?.classList.add('boot-ready');
}

function normalizeLoginEmail(value) {
    const raw = String(value || '').trim().toLowerCase();
    if (!raw) return '';
    if (raw.includes('@')) return raw;
    return raw + '@catafast.com';
}

function updateBootSplash(mode) {
    const splash = document.getElementById('bootSplash');
    if (!splash) return;
    const text = document.getElementById('bootSplashText');
    const net = document.getElementById('bootSplashNet');
    const modeEl = document.getElementById('bootSplashMode');
    if (text) text.textContent = navigator.onLine ? 'جاري تجهيز الواجهة وتحميل بياناتك بأسرع شكل ممكن.' : 'جاري تجهيز الواجهة محليًا لأن الإنترنت غير متاح الآن.';
    if (net) net.textContent = navigator.onLine ? 'Online ready' : 'Offline ready';
    if (modeEl) modeEl.textContent = mode === 'admin' ? 'Admin Mode' : 'User Mode';
}

function showBootSplash(mode) {
    const splash = document.getElementById('bootSplash');
    if (!splash) return;
    updateBootSplash(mode || 'user');
    splash.classList.remove('hide');
    splash.style.display = 'flex';
}

function hideBootSplash() {
    const splash = document.getElementById('bootSplash');
    if (!splash) return;
    splash.classList.add('hide');
    window.setTimeout(() => { splash.style.display = 'none'; }, 240);
}

// ==================== Authentication (Email & Password with device lock) ====================
async function handleLogin(e) {
    e.preventDefault();
    let email = normalizeLoginEmail(document.getElementById('userEmail')?.value);
    let password = document.getElementById('userPassword')?.value;
    const btn = document.getElementById('loginBtn');
    const originalBtnHTML = btn.innerHTML;
    // ✅ Fix #3: spinner animation on button
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + __('checking');
    btn.disabled = true;

    // Online verification
    if (navigator.onLine && db) {
        try {
            const { data, error } = await db.from('users').select('*').eq('email', email).eq('password', password).single();

            // ✅ Fix #1: specific error messages by error type
            if (error || !data) {
                if (error?.message?.includes('Failed to fetch') || error?.name === 'TypeError') {
                    throw new Error(__('serverError'));
                } else if (error?.code === 'PGRST116' || !data) {
                    throw new Error(__('invalidCredentials'));
                } else {
                    throw new Error(__('serverError') + (error?.message || __('tryAgain')));
                }
            }

            // Redirect roles appropriately
            if (data.role_id === 1 || data.role_id === 2) {
                showToast(__('adminAccountRedirect'), 'error');
                btn.innerHTML = originalBtnHTML; btn.disabled = false;
                return;
            }

            // Device lock check
            const deviceId = getDeviceId();
            if (data.device_id && data.device_id !== deviceId) {
                showToast(__('deviceLinked'), 'error');
                btn.innerHTML = originalBtnHTML; btn.disabled = false;
                return;
            }
            // First login — lock device
            if (!data.device_id) {
                await db.from('users').update({ device_id: deviceId }).eq('id', data.id);
                data.device_id = deviceId;
            }
            if (_isAccountLockedRow(data)) {
                showToast(_accountLockMessage(data), 'error');
                btn.innerHTML = originalBtnHTML; btn.disabled = false;
                return;
            }
            if (_isSubscriptionExpiredRow(data)) {
                showToast('❌ انتهى الاشتراك، تم إغلاق الحساب', 'error');
                btn.innerHTML = originalBtnHTML; btn.disabled = false;
                return;
            }

            delete data.password;
            currentUser = { ...data };
            localStorage.setItem('katfast_user', JSON.stringify(currentUser));
            localStorage.setItem('katfast_user_pw', await hashPassword(password));
            updateSyncTimestamp();
            showBootSplash('user');
            showApp();
            window.setTimeout(hideBootSplash, 420);
            checkSubscription();
            updateUserUI();
            loadOfficialSchedules();
            loadMySchedule();
            loadProgressPhotos();
            setupSyncListeners();
            setupAccountStateWatchers();
            processSyncQueue();
            return;
        } catch (err) {
            console.error('Login error:', err);
            // ✅ Fix #1: distinguish network errors from auth errors
            let errMsg = err.message || __('unexpectedError');
            if (err.name === 'TypeError' || errMsg.includes('fetch')) {
                errMsg = __('noInternetServer');
            }
            showToast(errMsg, 'error');
            btn.innerHTML = originalBtnHTML; btn.disabled = false;
            return;
        }
    }

    // Offline verification using cache
    const cachedUser = localStorage.getItem('katfast_user');
    if (cachedUser) {
        const userObj = JSON.parse(cachedUser);
        var storedPw = localStorage.getItem('katfast_user_pw');
        if (userObj.email === email && storedPw && (await hashPassword(password) === storedPw || btoa(password) === storedPw)) {
            // Migrate old btoa format to SHA-256
            if (btoa(password) === storedPw) localStorage.setItem('katfast_user_pw', await hashPassword(password));
            currentUser = userObj;
            showBootSplash('user');
            showApp(); 
            window.setTimeout(hideBootSplash, 420);
            checkSubscription();
            updateUserUI();
            loadOfficialSchedules(); 
            loadMySchedule(); 
            loadProgressPhotos();
            checkOfflineLock();
            setupSyncListeners();
            setupAccountStateWatchers();
            processSyncQueue();
            showToast(__('loginOffline'));
            return;
        }
    }

    showToast(__('loginNoMatch'), 'error');
    btn.innerHTML = originalBtnHTML; btn.disabled = false;
}

function handleLogout() {
    currentUser = null;
    currentSessionActive = false;
    sessionStartTime = null;
    localStorage.removeItem('katfast_user');
    localStorage.removeItem('katfast_user_pw');
    localStorage.removeItem('katfast_session_start');
    localStorage.removeItem('katfast_session_active');
    localStorage.removeItem('katfast_last_sync');
    showLogin();
}

function getDeviceId() {
    let id = localStorage.getItem('katfast_device_id');
    if (!id) {
        id = 'dev_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
        localStorage.setItem('katfast_device_id', id);
    }
    return id;
}

// ==================== Subscription & Offline Grace Check ====================
function checkSubscription() {
    if (!currentUser) return;
    if (!currentUser.subscription_start) return;
    const start = new Date(currentUser.subscription_start);
    if (isNaN(start.getTime())) return;
    const end = new Date(start);
    end.setDate(end.getDate() + (currentUser.subscription_duration || 30));
    const daysLeft = Math.max(0, Math.ceil((end - new Date()) / 86400000));
    if (daysLeft <= 0) {
        window._subExpired = true;
        injectExpiredBanner();
    } else {
        window._subExpired = false;
        hideExpiredBanner();
    }
}

var _expiredBannerEl = null;
function injectExpiredBanner() {
    hideExpiredBanner();
    _expiredBannerEl = document.createElement('div');
    _expiredBannerEl.id = 'expired-banner';
    _expiredBannerEl.style.cssText = 'position:fixed;top:0;left:0;width:100%;z-index:9998;background:linear-gradient(135deg,#E74C3C,#c0392b);padding:12px 16px;text-align:center;font-family:Cairo,sans-serif;direction:rtl;color:#fff;font-size:13px;box-shadow:0 4px 20px rgba(231,76,60,0.3);';
    _expiredBannerEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ' + __('subscriptionExpiredView') + ' <a href="#" onclick="event.preventDefault();handleLogout()" style="color:#FFD700;text-decoration:underline;margin-right:8px;">' + __('logout') + '</a>';
    document.body.insertBefore(_expiredBannerEl, document.body.firstChild);
}
function hideExpiredBanner() {
    if (_expiredBannerEl) { _expiredBannerEl.remove(); _expiredBannerEl = null; }
}

async function syncUserSubscription() {
    if (!navigator.onLine || !db || !currentUser) return;
    try {
        var { data, error } = await db.from('users')
            .select('id,name,email,device_id,subscription_start,subscription_duration,total_amount_due,amount_paid,debt_status,role_id')
            .eq('id', currentUser.id)
            .maybeSingle();
        if (error && error.code !== 'PGRST116') {
            console.warn('syncUserSubscription soft-fail:', error.message || error);
            return true;
        }
        if (!data) {
            showToast('❌ الحساب لم يعد موجودًا أو تم حذفه من الإدارة', 'error');
            handleLogout();
            return false;
        }
        if (_isAccountLockedRow(data)) {
            showToast(_accountLockMessage(data), 'error');
            handleLogout();
            return false;
        }
        if (_isSubscriptionExpiredRow(data)) {
            showToast('❌ انتهى الاشتراك، تم إغلاق الحساب', 'error');
            handleLogout();
            return false;
        }
        if (data.device_id && currentUser.device_id && data.device_id !== currentUser.device_id) {
            showToast('❌ تم تسجيل الدخول من جهاز آخر — تم طردك من هذا الجهاز', 'error');
            handleLogout();
            return false;
        }
        var changed = false;
        if (data.subscription_start && data.subscription_start !== currentUser.subscription_start) { currentUser.subscription_start = data.subscription_start; changed = true; }
        if (data.subscription_duration && data.subscription_duration !== currentUser.subscription_duration) { currentUser.subscription_duration = data.subscription_duration; changed = true; }
        if (data.total_amount_due !== currentUser.total_amount_due) { currentUser.total_amount_due = data.total_amount_due; changed = true; }
        if (data.amount_paid !== currentUser.amount_paid) { currentUser.amount_paid = data.amount_paid; changed = true; }
        if (data.debt_status !== currentUser.debt_status) { currentUser.debt_status = data.debt_status; changed = true; }
        if (changed) {
            delete currentUser.password;
            localStorage.setItem('katfast_user', JSON.stringify(currentUser));
            checkSubscription();
            updateUserUI();
        }
        return true;
    } catch (err) { console.error('syncUserSubscription error:', err); }
    return false;
}

async function validateCurrentUserAccess(source) {
    if (!currentUser) return false;
    if (!navigator.onLine || !db) return true;
    const ok = await syncUserSubscription();
    if (!ok && currentUser) {
        console.warn('[ACCESS]', 'Current user blocked during', source || 'validation');
    }
    return ok;
}

function _isAccountLockedRow(row) {
    if (!row) return true;
    return (row.device_id && String(row.device_id).startsWith('deleted_'));
}

function _accountLockMessage(row) {
    if (!row) return '❌ تم إيقاف الحساب';
    if (row.device_id && String(row.device_id).startsWith('deleted_')) return '❌ تم أرشفة/حذف الحساب من الإدارة';
    return '❌ انتهى الاشتراك أو تم تعطيل الحساب';
}

function _isSubscriptionExpiredRow(row) {
    if (!row || !row.subscription_start) return false;
    var start = new Date(row.subscription_start);
    if (isNaN(start.getTime())) return false;
    var end = new Date(start);
    end.setDate(end.getDate() + (row.subscription_duration || 30));
    return end.getTime() <= Date.now();
}

function getDaysLeft() {
    if (!currentUser || !currentUser.subscription_start) return 0;
    const start = new Date(currentUser.subscription_start);
    if (isNaN(start.getTime())) return 0;
    const end = new Date(start);
    end.setDate(end.getDate() + (currentUser.subscription_duration || 30));
    return Math.max(0, Math.ceil((end - new Date()) / 86400000));
}

function getProgress() {
    if (!currentUser || !currentUser.subscription_start) return 0;
    const start = new Date(currentUser.subscription_start);
    if (isNaN(start.getTime())) return 0;
    const duration = currentUser.subscription_duration || 30;
    const daysPassed = Math.floor((new Date() - start) / 86400000);
    return Math.min(100, Math.max(0, (daysPassed / duration) * 100));
}

// Phase 3: Strict 48-Hour Offline Lock Check
function checkOfflineLock() {
    if (!currentUser) return false;
    
    let lastSync = localStorage.getItem('katfast_last_sync');
    if (!lastSync) {
        lastSync = Date.now().toString();
        localStorage.setItem('katfast_last_sync', lastSync);
    }

    const elapsedMs = Date.now() - parseInt(lastSync);
    const elapsedHours = elapsedMs / (1000 * 60 * 60);

    if (elapsedHours > 48) {
        injectOfflineOverlay(true); // Freeze and overlay UI
        return true;
    } else {
        injectOfflineOverlay(false); // Hide overlay
        return false;
    }
}

function updateSyncTimestamp() {
    localStorage.setItem('katfast_last_sync', Date.now().toString());
}

let _accountStateWatchersReady = false;
function setupAccountStateWatchers() {
    if (_accountStateWatchersReady) return;
    _accountStateWatchersReady = true;
    var refresh = function () {
        if (!currentUser || !navigator.onLine || !db) return;
        validateCurrentUserAccess('watcher').catch(function () {});
    };
    window.addEventListener('online', refresh);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) refresh();
    });
    setInterval(refresh, 5 * 60 * 1000);
}

// Dynamic injection of full-screen lock and offline crash overlays
function injectOfflineOverlay(isLocked) {
    let overlay = document.getElementById('offline-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'offline-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(10,10,15,0.98);z-index:9999;display:none;align-items:center;justify-content:center;padding:24px;text-align:center;font-family:Cairo,sans-serif;direction:rtl;';
        document.body.appendChild(overlay);
    }

    if (isLocked) {
        overlay.innerHTML = `
            <div style="background:rgba(20,20,30,0.95); border: 2px solid #E74C3C; border-radius:24px; padding:40px 24px; max-width:400px; box-shadow: 0 0 40px rgba(231,76,60,0.15);">
                <div style="width:80px; height:80px; background:rgba(231,76,60,0.1); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; color:#E74C3C; font-size:40px;">
                    <i class="fas fa-lock"></i>
                </div>
                <h2 style="color:#fff; font-weight:900; font-size:22px; margin-bottom:12px;">${__('syncLockTitle')}</h2>
                <p style="color:rgba(255,255,255,0.7); font-size:13px; line-height:1.7; margin-bottom:24px;">
                    ${__('syncLockDesc')}
                </p>
                <button onclick="tryUnlockOnline()" style="width:100%; padding:14px; background:linear-gradient(135deg,#FFD700,#FFA500); border:none; border-radius:12px; color:#000; font-weight:bold; font-size:14px; cursor:pointer;">
                    <i class="fas fa-sync"></i> ${__('syncLockBtn')}
                </button>
            </div>
        `;
        overlay.style.display = 'flex';
    } else {
        overlay.style.display = 'none';
    }
}

window.tryUnlockOnline = async function() {
    if (!navigator.onLine) {
        showToast(__('noInternetNow'), 'error');
        return;
    }
    showToast(__('connecting'));
    const synced = await processSyncQueue();
    if (synced) {
        updateSyncTimestamp();
        injectOfflineOverlay(false);
        showToast(__('syncUpdated'));
        location.reload();
    } else {
        showToast(__('syncFailed'), 'error');
    }
};

// ==================== UI ====================
function updateUserUI() {
    if (!currentUser) return;
    const daysLeft = getDaysLeft();
    const progress = getProgress();
    
    document.getElementById('displayUserName').textContent = currentUser.name;
    const daysEl = document.getElementById('displayDaysLeft');
    if (daysEl) {
        if (daysLeft === 0) daysEl.textContent = __('subscriptionExpiredShort');
        else if (daysLeft <= 3) daysEl.textContent = __('expiresInDays').replace('{n}', daysLeft);
        else daysEl.textContent = __('remainingDays').replace('{n}', daysLeft).replace('{m}', currentUser.subscription_duration || 30);
    }
    document.getElementById('headerDaysLeft').textContent = daysLeft;
    document.getElementById('progressFill').style.width = progress + '%';

    renderFinancialWarningBanner();
    renderExpiryWarningBanner();
    updateWeeklySummary();
    updateOfflineAnalytics();
    updateProgressSummary();
    updateHomeHeroStats(daysLeft, progress);
    updateHeaderAvatar();
}

function updateHeaderAvatar() {
    if (!currentUser) return;
    const header = document.getElementById('headerAvatar');
    if (!header) return;
    const saved = localStorage.getItem('katfast_user_avatar_' + currentUser.id);
    if (saved) {
        header.innerHTML = `<img src="${saved}" alt="avatar" style="width:100%;height:100%;object-fit:cover;object-position:top center;display:block;">`;
    } else {
        header.innerHTML = '<i class="fas fa-user" style="font-size:16px;color:var(--accent);"></i>';
    }
}

function updateHomeHeroStats(daysLeft, progress) {
    const levelEl = document.getElementById('homeDailyLevel');
    const subEl = document.getElementById('homeSubState');
    const visitEl = document.getElementById('homeLastVisit');
    if (levelEl) {
        if (progress >= 75) levelEl.textContent = 'قوي';
        else if (progress >= 35) levelEl.textContent = 'ثابت';
        else levelEl.textContent = 'بداية';
    }
    if (subEl) {
        subEl.textContent = daysLeft <= 0 ? __('subscriptionExpiredShort') : (daysLeft <= 3 ? __('expiresInDays', { n: daysLeft }) : __('remainingDays', { n: daysLeft, m: currentUser.subscription_duration || 30 }));
    }
    if (visitEl) {
        const now = new Date();
        visitEl.textContent = now.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
    }
}

function updateWeeklySummary() {
    const weekAgo = Date.now() - 7 * 86400000;
    
    // 1. Workouts count
    const log = JSON.parse(localStorage.getItem('katfast_workout_log') || '[]');
    const workoutsLastWeek = log.filter(e => new Date(e.date).getTime() >= weekAgo).length;
    
    // 2. Photos count
    const photos = JSON.parse(localStorage.getItem('katfast_photos') || '[]');
    const photosLastWeek = photos.filter(p => (p.timestamp && p.timestamp >= weekAgo) || (p.date && new Date(p.date).getTime() >= weekAgo)).length;
    
    // 3. Weight change
    const weights = JSON.parse(localStorage.getItem('katfast_weight_log') || '[]');
    let weightChangeStr = '--';
    if (weights.length >= 2) {
        const sorted = [...weights].sort((a,b) => new Date(a.date) - new Date(b.date));
        const first = sorted[0].weight;
        const last = sorted[sorted.length - 1].weight;
        const diff = (last - first).toFixed(1);
        weightChangeStr = diff > 0 ? '+' + diff : diff;
    }
    
    const wsWorkoutsEl = document.getElementById('wsSummaryWorkouts');
    const wsPhotosEl = document.getElementById('wsSummaryPhotos');
    const wsWeightEl = document.getElementById('wsSummaryWeight');
    
    if (wsWorkoutsEl) wsWorkoutsEl.textContent = workoutsLastWeek;
    if (wsPhotosEl) wsPhotosEl.textContent = photosLastWeek;
    if (wsWeightEl) {
        wsWeightEl.textContent = weightChangeStr;
        wsWeightEl.style.color = weightChangeStr.startsWith('-') ? 'var(--success)' : (weightChangeStr === '--' ? '#FFD700' : 'var(--danger)');
    }
}

function updateOfflineAnalytics() {
    const totalEl = document.getElementById('analyticsTotalWorkouts');
    const avgWeightEl = document.getElementById('analyticsAvgWeight');
    const streakEl = document.getElementById('analyticsStreak');
    const topExEl = document.getElementById('analyticsTopExercise');
    
    if (!totalEl || !avgWeightEl || !streakEl || !topExEl) return;
    
    // Load Workout Log
    const workoutLog = JSON.parse(localStorage.getItem('katfast_workout_log') || '[]');
    totalEl.textContent = workoutLog.length;
    
    // 1. Avg Weight (last 30 days)
    const weightLog = JSON.parse(localStorage.getItem('katfast_weight_log') || '[]');
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentWeights = weightLog.filter(item => new Date(item.date).getTime() >= thirtyDaysAgo);
    
    if (recentWeights.length > 0) {
        const sum = recentWeights.reduce((s, item) => s + parseFloat(item.weight), 0);
        const avg = (sum / recentWeights.length).toFixed(1);
        avgWeightEl.textContent = avg + ' ' + __('kg');
    } else if (weightLog.length > 0) {
        const sum = weightLog.reduce((s, item) => s + parseFloat(item.weight), 0);
        const avg = (sum / weightLog.length).toFixed(1);
        avgWeightEl.textContent = avg + ' ' + __('kg');
    } else {
        avgWeightEl.textContent = '--';
    }
    
    // 2. Workout Streak (consecutive days)
    const workoutDates = [...new Set(workoutLog.map(item => item.date.split('T')[0]))].sort();
    let currentStreak = 0;
    
    if (workoutDates.length > 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        let checkDateStr = workoutDates.includes(todayStr) ? todayStr : (workoutDates.includes(yesterdayStr) ? yesterdayStr : null);
        
        if (checkDateStr) {
            currentStreak = 1;
            let checkDate = new Date(checkDateStr);
            while (true) {
                checkDate.setDate(checkDate.getDate() - 1);
                const prevDateStr = checkDate.toISOString().split('T')[0];
                if (workoutDates.includes(prevDateStr)) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        }
    }
    streakEl.textContent = currentStreak + ' ' + __('dayAbbrev');
    
    // 3. Most Logged Exercise
    if (workoutLog.length > 0) {
        const counts = {};
        workoutLog.forEach(item => {
            const name = (item.exercise || item.name || '').trim();
            if (name) {
                counts[name] = (counts[name] || 0) + 1;
            }
        });
        
        let topEx = '--';
        let maxCount = 0;
        Object.entries(counts).forEach(([name, count]) => {
            if (count > maxCount) {
                maxCount = count;
                topEx = name;
            }
        });
        
        topExEl.textContent = topEx;
        topExEl.title = topEx;
    } else {
        topExEl.textContent = '--';
    }
}

function updateProgressSummary() {
    const lastWorkoutEl = document.getElementById('psLastWorkout');
    const currentStreakEl = document.getElementById('psCurrentStreak');
    const lastWeightEl = document.getElementById('psLastWeight');
    
    if (!lastWorkoutEl || !currentStreakEl || !lastWeightEl) return;
    
    // 1. Last Workout
    const workoutLog = JSON.parse(localStorage.getItem('katfast_workout_log') || '[]');
    if (workoutLog.length > 0) {
        const sortedWorkouts = [...workoutLog].sort((a, b) => new Date(b.date) - new Date(a.date));
        const last = sortedWorkouts[0];
        const dateObj = new Date(last.date);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        lastWorkoutEl.textContent = `${last.exercise || last.name || '—'} (${day}/${month})`;
    } else {
        lastWorkoutEl.textContent = '--';
    }
    
    // 2. Current Streak
    const workoutDates = [...new Set(workoutLog.map(item => item.date.split('T')[0]))].sort();
    let currentStreak = 0;
    
    if (workoutDates.length > 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        let checkDateStr = workoutDates.includes(todayStr) ? todayStr : (workoutDates.includes(yesterdayStr) ? yesterdayStr : null);
        
        if (checkDateStr) {
            currentStreak = 1;
            let checkDate = new Date(checkDateStr);
            while (true) {
                checkDate.setDate(checkDate.getDate() - 1);
                const prevDateStr = checkDate.toISOString().split('T')[0];
                if (workoutDates.includes(prevDateStr)) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        }
    }
    currentStreakEl.textContent = currentStreak + ' ' + __('dayAbbrev');
    
    // 3. Last Logged Weight
    const weightLog = JSON.parse(localStorage.getItem('katfast_weight_log') || '[]');
    if (weightLog.length > 0) {
        const sortedWeights = [...weightLog].sort((a, b) => new Date(b.date) - new Date(a.date));
        const last = sortedWeights[0];
        lastWeightEl.textContent = last.weight + ' ' + __('kg');
    } else {
        lastWeightEl.textContent = '--';
    }
}

function renderExpiryWarningBanner() {
    const daysLeft = getDaysLeft();
    const homePage = document.getElementById('homePage');
    if (!homePage || daysLeft > 3) return;
    const old = document.getElementById('expiryWarningBanner');
    if (old) old.remove();
    if (daysLeft <= 0) {
        const banner = document.createElement('div');
        banner.id = 'expiryWarningBanner';
        banner.style.cssText = 'background:linear-gradient(135deg,rgba(239,68,68,0.15),rgba(239,68,68,0.05));border:1px solid rgba(239,68,68,0.25);border-radius:12px;padding:14px;margin-bottom:12px;display:flex;align-items:center;gap:10px;';
        banner.innerHTML = '<div style="font-size:24px;">⛔</div><div style="flex:1;"><div style="font-weight:700;font-size:14px;color:#EF4444;">' + __('expiredTitle') + '</div><div style="font-size:12px;opacity:0.7;">' + __('expiredDesc') + '</div></div>';
        homePage.insertBefore(banner, homePage.firstChild);
    } else if (daysLeft <= 3) {
        const banner = document.createElement('div');
        banner.id = 'expiryWarningBanner';
        banner.style.cssText = 'background:linear-gradient(135deg,rgba(245,158,11,0.12),rgba(245,158,11,0.04));border:1px solid rgba(245,158,11,0.2);border-radius:12px;padding:14px;margin-bottom:12px;display:flex;align-items:center;gap:10px;';
        banner.innerHTML = '<div style="font-size:24px;">⚠️</div><div style="flex:1;"><div style="font-weight:700;font-size:14px;color:#F59E0B;">' + __('expiringSoon') + '</div><div style="font-size:12px;opacity:0.7;">' + __('expiringDesc', {n: daysLeft}) + '</div></div>';
        homePage.insertBefore(banner, homePage.firstChild);
    }
}

function renderFinancialWarningBanner() {
    const homePage = document.getElementById('homePage');
    if (!homePage) return;

    // Remove existing if any
    const oldBanner = document.getElementById('financialWarningBanner');
    if (oldBanner) oldBanner.remove();

    if (currentUser.debt_status === true) {
        const remainingDebt = (currentUser.total_amount_due || 0) - (currentUser.amount_paid || 0);
        const banner = document.createElement('div');
        banner.id = 'financialWarningBanner';
        banner.style.cssText = 'background: linear-gradient(135deg, #d35400, #c0392b); border: 1px solid #e74c3c; border-radius: 16px; padding: 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 12px; font-family: Cairo; direction: rtl; box-shadow: 0 4px 15px rgba(192, 57, 43, 0.3);';
        banner.innerHTML = `
            <div style="width:40px; height:40px; background:rgba(255,255,255,0.15); border-radius:10px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:20px; flex-shrink:0;">
                <i class="fas fa-hand-holding-usd"></i>
            </div>
            <div style="flex:1;">
                <div style="font-weight:900; font-size:14px; color:#fff; margin-bottom:2px;">${__('debtWarning')}</div>
                <div style="font-size:12px; color:rgba(255,255,255,0.9); line-height:1.5;">
                    ${__('debtGreeting', {name: currentUser.name})} ${__('debtBody', {amount: remainingDebt})} ${__('debtFooter')}
                </div>
            </div>
        `;
        homePage.insertBefore(banner, homePage.firstChild);
    }
}

// ==================== User Profile ====================
window.populateUserProfile = async function () {
    if (!currentUser) return;
    var profile = { ...currentUser };
    if (navigator.onLine && db && currentUser.id) {
        try {
            const { data } = await db.from('users').select('*').eq('id', currentUser.id).single();
            if (data) {
                profile = { ...profile, ...data };
                currentUser = { ...currentUser, ...data };
                delete currentUser.password;
                localStorage.setItem('katfast_user', JSON.stringify(currentUser));
            }
        } catch (_) { console.warn('[SWALLOWED]', _.message || _); }
    }
    const nameEl = document.getElementById('profileDisplayName');
    const emailEl = document.getElementById('profileDisplayEmail');
    const roleEl = document.getElementById('profileDisplayRole');
    const phoneEl = document.getElementById('profileDisplayPhone');
    const ageEl = document.getElementById('profileDisplayAge');
    const subEl = document.getElementById('profileDisplaySubscription');
    const debtEl = document.getElementById('profileDisplayDebt');
    const nameInp = document.getElementById('userProfileName');
    const phoneInp = document.getElementById('userProfilePhone');
    const ageInp = document.getElementById('userProfileAge');
    const passInp = document.getElementById('userProfilePassword');
    const genderEl = document.getElementById('userProfileGender');
    const statusEl = document.getElementById('userProfileStatus');
    if (nameEl) nameEl.textContent = profile.name || '';
    if (emailEl) emailEl.textContent = profile.email || '';
    if (roleEl) roleEl.textContent = (profile.gender === __('female') ? '♀️' : '♂️') + ' ' + (profile.role_id === 3 ? __('roleAthlete') : profile.role_id === 2 ? __('roleCaptain') : __('roleProgrammer'));
    if (nameInp) nameInp.value = profile.name || '';
    if (phoneInp) phoneInp.value = profile.phone || '';
    if (ageInp) ageInp.value = profile.age || '';
    if (passInp) passInp.value = '';
    if (genderEl) genderEl.value = profile.gender || __('male');
    if (statusEl) statusEl.textContent = '';
    if (phoneEl) phoneEl.textContent = profile.phone || '—';
    if (ageEl) ageEl.textContent = profile.age ? String(profile.age) : '—';
    if (subEl) {
        const daysLeft = getDaysLeft();
        const duration = profile.subscription_duration || 30;
        subEl.textContent = daysLeft <= 0 ? __('subscriptionExpiredShort') : __('remainingDays', { n: daysLeft, m: duration });
    }
    if (debtEl) debtEl.textContent = profile.debt_status === true ? __('debt') : __('active');
    const saved = localStorage.getItem('katfast_user_avatar_' + profile.id);
    const preview = document.getElementById('userAvatarPreview');
    if (preview) {
        preview.innerHTML = saved
            ? `<img src="${saved}" style="width:100%;height:100%;object-fit:cover;object-position:top center;display:block;">`
            : '<i class="fas fa-user" style="font-size:30px;color:#FFD700;"></i>';
    }
    if (typeof loadBodyMeasurements === 'function') setTimeout(loadBodyMeasurements, 50);
};
// Body measurements
window.loadBodyMeasurements = async function () {
    if (!currentUser) return;
    const cached = localStorage.getItem('katfast_body_data_' + currentUser.id);
    if (cached) {
        const d = JSON.parse(cached);
        document.getElementById('bodyHeight').value = d.height || '';
        document.getElementById('bodyWeight').value = d.weight || '';
        document.getElementById('bodyChest').value = d.chest || '';
        document.getElementById('bodyArm').value = d.arm || '';
        document.getElementById('bodyWaist').value = d.waist || '';
        document.getElementById('bodyThigh').value = d.thigh || '';
    }
    if (navigator.onLine && db) {
        try {
            const { data } = await db.from('health_log').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }).limit(1);
            if (data && data[0]) {
                const d = data[0];
                document.getElementById('bodyHeight').value = d.height || '';
                document.getElementById('bodyWeight').value = d.weight || '';
                document.getElementById('bodyChest').value = d.chest || '';
                document.getElementById('bodyArm').value = d.arm || '';
                document.getElementById('bodyWaist').value = d.waist || '';
                document.getElementById('bodyThigh').value = d.thigh || '';
                localStorage.setItem('katfast_body_data_' + currentUser.id, JSON.stringify(d));
            }
        } catch (_) { console.warn('[SWALLOWED]', _.message || _); }
    }
};
window.saveBodyMeasurements = async function () {
    if (!currentUser) return;
    const data = {
        height: parseFloat(document.getElementById('bodyHeight').value) || null,
        weight: parseFloat(document.getElementById('bodyWeight').value) || null,
        chest: parseFloat(document.getElementById('bodyChest').value) || null,
        arm: parseFloat(document.getElementById('bodyArm').value) || null,
        waist: parseFloat(document.getElementById('bodyWaist').value) || null,
        thigh: parseFloat(document.getElementById('bodyThigh').value) || null
    };
    localStorage.setItem('katfast_body_data_' + currentUser.id, JSON.stringify(data));
    const hPayload = {
        user_id: currentUser.id,
        date: new Date().toISOString().split('T')[0],
        weight: data.weight,
        height: data.height,
        chest: data.chest,
        arm: data.arm,
        waist: data.waist,
        thigh: data.thigh
    };
    if (navigator.onLine && db) {
        try {
            const { error } = await db.from('health_log').insert([hPayload]);
            if (error) pushToSyncQueue('health_log', hPayload);
        } catch (_) { pushToSyncQueue('health_log', hPayload); }
    } else {
        pushToSyncQueue('health_log', hPayload);
    }
    document.getElementById('bodyMeasurementsStatus').textContent = '✅ ' + __('measurementsSaved');
    document.getElementById('bodyMeasurementsStatus').style.color = 'var(--success)';
    showToast(__('measurementsSaved'));
};
window.saveUserProfile = async function () {
    if (!currentUser) return;
    const name = document.getElementById('userProfileName').value.trim();
    const phone = document.getElementById('userProfilePhone').value.trim();
    const age = parseInt(document.getElementById('userProfileAge').value) || null;
    const pass = document.getElementById('userProfilePassword').value.trim();
    if (!name) { showToast(__('nameRequired'), 'error'); return; }
    if (pass && pass.length < 6) { showToast(__('passwordMin'), 'error'); return; }
    var gender = document.getElementById('userProfileGender')?.value || currentUser.gender || __('male');
    currentUser.name = name;
    currentUser.phone = phone;
    currentUser.age = age;
    currentUser.gender = gender;
    if (pass) {
        currentUser.password = pass;
        localStorage.setItem('katfast_user_pw', await hashPassword(pass));
        delete currentUser.password;
    }
    localStorage.setItem('katfast_user', JSON.stringify(currentUser));
    document.getElementById('profileDisplayName').textContent = name;
    const phoneEl = document.getElementById('profileDisplayPhone');
    const ageEl = document.getElementById('profileDisplayAge');
    if (phoneEl) phoneEl.textContent = phone || '—';
    if (ageEl) ageEl.textContent = age ? String(age) : '—';
    document.getElementById('userProfileStatus').textContent = __('changesSaved');
    updateUserUI();
    if (navigator.onLine && db) {
        const payload = { name, phone, age };
        if (gender) payload.gender = gender;
        if (pass) payload.password = pass;
        var { error } = await db.from('users').update(payload).eq('id', currentUser.id);
        if (error && error.message && error.message.toLowerCase().includes('gender') && payload.gender) {
            delete payload.gender;
            var { error: e2 } = await db.from('users').update(payload).eq('id', currentUser.id);
            if (e2) error = e2; else error = null;
        }
        if (error) pushToSyncQueue('profile_update', { id: currentUser.id, ...payload });
    } else {
        pushToSyncQueue('profile_update', { id: currentUser.id, name, gender, password: pass || undefined });
    }
    showToast(__('accountUpdated'));
};
window.uploadUserAvatar = function (event) {
    const file = event.target.files[0];
    if (!file || !currentUser) return;
    fallbackUserAvatar(file);
    event.target.value = '';
};
function fallbackUserAvatar(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        localStorage.setItem('katfast_user_avatar_' + currentUser.id, e.target.result);
        const preview = document.getElementById('userAvatarPreview');
        if (preview) preview.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;object-position:top center;display:block;">`;
        updateHeaderAvatar();
        showToast(__('photoLocal'));
    };
    reader.readAsDataURL(file);
}

// ==================== Notifications System ====================
let userNotifications = [];
const NOTIF_READ_KEY_PREFIX = 'katfast_notif_read_ids_';
const NOTIF_CACHE_KEY_PREFIX = 'katfast_notif_cache_';

function getStoredReadNotifIds() {
    const key = NOTIF_READ_KEY_PREFIX + String(currentUser?.id || 'guest');
    try { return new Set(JSON.parse(localStorage.getItem(key) || '[]')); } catch (_) { return new Set(); }
}

function saveStoredReadNotifIds(setLike) {
    const key = NOTIF_READ_KEY_PREFIX + String(currentUser?.id || 'guest');
    try { localStorage.setItem(key, JSON.stringify(Array.from(setLike || []))); } catch (_) { }
}

function getNotifCacheKey() {
    return NOTIF_CACHE_KEY_PREFIX + String(currentUser?.id || 'guest');
}

window.toggleNotifPanel = function () {
    const panel = document.getElementById('notifPanel');
    if (!panel) return;
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    if (panel.style.display === 'block') loadUserNotifications();
};
async function loadUserNotifications() {
    const list = document.getElementById('notifList');
    if (!list) return;
    list.innerHTML = '<p style="text-align:center;opacity:0.5;font-size:13px;padding:20px;">' + __('loading') + '</p>';
    try {
        const readIds = getStoredReadNotifIds();
        if (navigator.onLine && db && currentUser) {
            const { data } = await db.from('notifications').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }).limit(20);
            if (data) {
                userNotifications = data.map(function (n) {
                    return Object.assign({}, n, { read: !!n.read || readIds.has(String(n.id)) });
                });
                localStorage.setItem(getNotifCacheKey(), JSON.stringify(data));
            }
        } else {
            const cached = localStorage.getItem(getNotifCacheKey());
            if (cached) {
                userNotifications = JSON.parse(cached).map(function (n) {
                    return Object.assign({}, n, { read: !!n.read || readIds.has(String(n.id)) });
                });
            }
        }
    } catch (_) {
        const cached = localStorage.getItem(getNotifCacheKey());
        if (cached) {
            const readIds = getStoredReadNotifIds();
            userNotifications = JSON.parse(cached).map(function (n) {
                return Object.assign({}, n, { read: !!n.read || readIds.has(String(n.id)) });
            });
        }
    }
    renderNotifications();
    updateNotifBadge();
}
function renderNotifications() {
    const list = document.getElementById('notifList');
    if (!list) return;
    if (userNotifications.length === 0) {
        list.innerHTML = '<p style="text-align:center;opacity:0.5;font-size:13px;padding:20px;">' + __('noNotifs') + '</p>';
        return;
    }
    list.innerHTML = userNotifications.map(n => `
        <div style="display:flex;gap:10px;padding:12px 14px;border:1px solid ${n.read ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.22)'};border-radius:14px;margin:8px 10px;background:${n.read ? 'rgba(255,255,255,0.03)' : 'linear-gradient(135deg, rgba(99,102,241,0.14), rgba(5,150,105,0.08))'};box-shadow:0 10px 24px rgba(0,0,0,0.16);${n.read ? 'opacity:0.82;' : ''}">
            <div style="font-size:22px;flex-shrink:0;width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.08);">${n.icon || '📢'}</div>
            <div style="flex:1;min-width:0;">
                <div style="font-weight:${n.read ? '500' : '800'};font-size:13px;color:var(--ink);line-height:1.5;">${n.title}</div>
                ${n.body ? '<div style="font-size:12px;opacity:0.82;margin-top:4px;color:var(--ink-2);line-height:1.7;">' + n.body + '</div>' : ''}
                <div style="font-size:10px;opacity:0.55;margin-top:6px;color:var(--ink-3);">${n.created_at ? new Date(n.created_at).toLocaleDateString('ar-EG', { hour:'2-digit', minute:'2-digit' }) : ''}</div>
            </div>
            ${!n.read ? `<button onclick="markNotifRead(${n.id})" style="background:none;border:none;color:var(--primary);cursor:pointer;font-size:12px;padding:4px;flex-shrink:0;"><i class="fas fa-check"></i></button>` : ''}
        </div>
    `).join('');
}
function updateNotifBadge() {
    const badge = document.getElementById('notifBadge');
    if (!badge) return;
    const unread = userNotifications.filter(n => !n.read).length;
    if (unread > 0) { badge.style.display = ''; badge.textContent = unread; }
    else badge.style.display = 'none';
}
window.markNotifRead = async function (id) {
    const n = userNotifications.find(x => x.id === id);
    if (n) n.read = true;
    const readIds = getStoredReadNotifIds();
    readIds.add(String(id));
    saveStoredReadNotifIds(readIds);
    try {
        const cached = JSON.parse(localStorage.getItem(getNotifCacheKey()) || '[]').map(function (item) {
            if (String(item.id) === String(id)) item.read = true;
            return item;
        });
        localStorage.setItem(getNotifCacheKey(), JSON.stringify(cached));
    } catch (_) { }
    renderNotifications();
    updateNotifBadge();
    if (navigator.onLine && db) {
        await db.from('notifications').update({ read: true }).eq('id', id).catch(() => {});
    }
};
window.markAllNotifsRead = async function () {
    userNotifications.forEach(n => n.read = true);
    saveStoredReadNotifIds(new Set(userNotifications.map(function (n) { return String(n.id); })));
    try {
        const cached = JSON.parse(localStorage.getItem(getNotifCacheKey()) || '[]').map(function (item) {
            item.read = true;
            return item;
        });
        localStorage.setItem(getNotifCacheKey(), JSON.stringify(cached));
    } catch (_) { }
    renderNotifications();
    updateNotifBadge();
    if (navigator.onLine && db && currentUser) {
        await db.from('notifications').update({ read: true }).eq('user_id', currentUser.id).eq('read', false).catch(() => {});
    }
};

function showToast(msg, type = 'success') {
    const t = document.createElement('div');
    const bg = type === 'error' ? '#E74C3C' : '#27AE60';
    t.style.cssText = `position:fixed;top:70px;left:50%;transform:translateX(-50%);background:${bg};color:#fff;padding:12px 24px;border-radius:12px;font-size:14px;z-index:9999;font-family:Cairo,sans-serif;box-shadow:0 4px 20px rgba(0,0,0,0.4);max-width:90vw;text-align:center`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3500);
}

// ==================== Gym Code Verification ====================
function _normalizeGymCode(value) {
    if (value === null || value === undefined) return null;
    var text = String(value)
        .replace(/[\u200e\u200f\u061c\u2066-\u2069]/g, '')
        .replace(/[٠١٢٣٤٥٦٧٨٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); })
        .replace(/[۰۱۲۳۴۵۶۷۸۹]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); })
        .trim();
    if (!text || text === 'null' || text === 'undefined') return null;
    return text;
}

function _extractGymCodeCandidate(value) {
    var text = _normalizeGymCode(value);
    if (!text) return null;
    if (text[0] === '{' || text[0] === '[') {
        try {
            return _extractGymCodeCandidate(JSON.parse(text));
        } catch (_) { }
    }
    if (typeof value === 'object') {
        var keys = ['gym_code', 'code', 'token', 'value', 'qr', 'barcode', 'text'];
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (value && value[key] !== undefined && value[key] !== null) {
                var nested = _extractGymCodeCandidate(value[key]);
                if (nested) return nested;
            }
        }
    }
    var compact = text.replace(/\s+/g, '');
    var digitNormalized = compact.replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }).replace(/[۰-۹]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); });
    var match = digitNormalized.match(/\d{6}/);
    return match ? match[0] : digitNormalized;
}

function _gymCodeDigits(value) {
    var text = _extractGymCodeCandidate(value);
    return text ? String(text).replace(/\D/g, '') : '';
}

function readCachedGymCode() {
    var settingsCode = _extractGymCodeCandidate(appSettings && appSettings.gym_code);
    if (settingsCode) {
        cachedGymCode = settingsCode;
        localStorage.setItem('katfast_gym_code', settingsCode);
        localStorage.setItem('katfast_qr_token', settingsCode);
        return settingsCode;
    }
    var direct = _extractGymCodeCandidate(cachedGymCode) || _extractGymCodeCandidate(localStorage.getItem('katfast_gym_code'));
    if (direct) {
        cachedGymCode = direct;
        localStorage.setItem('katfast_gym_code', direct);
        return direct;
    }
    var adminToken = _extractGymCodeCandidate(localStorage.getItem('katfast_qr_token'));
    if (adminToken) {
        cachedGymCode = adminToken;
        localStorage.setItem('katfast_gym_code', adminToken);
        return adminToken;
    }
    try {
        var settings = JSON.parse(localStorage.getItem('katfast_settings_cache') || '{}');
        var cachedCode = _extractGymCodeCandidate(settings.gym_code);
        if (cachedCode) {
            cachedGymCode = cachedCode;
            localStorage.setItem('katfast_gym_code', cachedCode);
            return cachedCode;
        }
    } catch (_) { console.warn('[SWALLOWED]', _.message || _); }
    return null;
}

async function fetchGymCode() {
    try {
        if (!db) return readCachedGymCode();
        const { data, error } = await db.from('settings').select('key, value').eq('key', 'gym_code').limit(1);
        if (error) throw error;
        var remoteRow = data && data.length ? data[0] : null;
        var remoteCode = _extractGymCodeCandidate(remoteRow && remoteRow.value);
        if (!remoteCode) {
            const fallback = await db.from('settings').select('key, value');
            if (!fallback.error && fallback.data && fallback.data.length > 0) {
                var match = fallback.data.find(function (row) { return String(row.key) === 'gym_code'; });
                remoteCode = _extractGymCodeCandidate(match && match.value);
            }
        }
        if (remoteCode) {
            cachedGymCode = remoteCode;
            localStorage.setItem('katfast_gym_code', remoteCode);
            localStorage.setItem('katfast_qr_token', remoteCode);
        }
        return readCachedGymCode();
    } catch (_) { console.warn('[SWALLOWED]', _.message || _); }
    return readCachedGymCode();
}

async function ensureGymCodeAvailable() {
    if (db) {
        var remoteCode = await fetchGymCode();
        if (remoteCode) return remoteCode;
    }
    var code = readCachedGymCode();
    if (code) return code;
    code = await fetchGymCode();
    if (code) return code;
    if (db) {
        await new Promise(function (resolve) { setTimeout(resolve, 250); });
        code = await fetchGymCode();
        if (code) return code;
    }
    return readCachedGymCode();
}

function isValidGymCode(text, expectedCode) {
    var code = _gymCodeDigits(expectedCode) || _gymCodeDigits(readCachedGymCode());
    var actual = _gymCodeDigits(text);
    return !!code && !!actual && actual === code;
}

// ==================== QR Code Session Scanner Wall ====================
function injectQRScannerContainer() {
    return;
}
function getRecentCodes() {
    try { return JSON.parse(localStorage.getItem('katfast_recent_codes') || '[]'); } catch(_){return [];}
}
function saveRecentCode(code) {
    var codes = getRecentCodes();
    codes = codes.filter(function(c){return c !== code;});
    codes.unshift(code);
    if (codes.length > 10) codes = codes.slice(0, 10);
    localStorage.setItem('katfast_recent_codes', JSON.stringify(codes));
    renderRecentCodes();
}
function renderRecentCodes() {
    var container = document.getElementById('recentCodesContainer');
    var list = document.getElementById('recentCodesList');
    if (!container || !list) return;
    var codes = getRecentCodes();
    if (codes.length === 0) { container.style.display = 'none'; return; }
    container.style.display = 'block';
    list.innerHTML = codes.map(function(c){
        return '<button onclick="useRecentCode(\'' + c.replace(/'/g,"\\'") + '\')" style="padding:6px 12px;background:rgba(255,215,0,0.08);border:1px solid rgba(255,215,0,0.15);border-radius:8px;color:#FFD700;font-size:12px;font-weight:700;cursor:pointer;font-family:monospace;direction:ltr;">' + c + ' <i class="fas fa-sign-in-alt" style="font-size:10px;"></i></button>';
    }).join('');
}
window.useRecentCode = function(code) {
    document.getElementById('manualCodeEntry').style.display = 'none';
    handleDecodedAttendanceCode(code, 'manual');
};

function ensureQrScannerReady() {
    if (window.Html5Qrcode) return Promise.resolve(window.Html5Qrcode);
    if (qrScannerReadyPromise) return qrScannerReadyPromise;
    qrScannerReadyPromise = new Promise(function (resolve, reject) {
        function finish() {
            if (window.Html5Qrcode) resolve(window.Html5Qrcode);
            else reject(new Error('QR scanner library did not expose Html5Qrcode'));
        }
        var localScript = document.createElement('script');
        localScript.src = 'assets/lib/html5-qrcode.min.js';
        localScript.dataset.katfastQrLoader = 'local';
        localScript.onload = finish;
        localScript.onerror = function () {
            var cdnScript = document.createElement('script');
            cdnScript.src = 'https://unpkg.com/html5-qrcode';
            cdnScript.dataset.katfastQrLoader = 'cdn';
            cdnScript.onload = finish;
            cdnScript.onerror = function () { reject(new Error('QR scanner library failed to load')); };
            document.head.appendChild(cdnScript);
        };
        document.head.appendChild(localScript);
    });
    return qrScannerReadyPromise;
}

function isMobileScannerDevice() {
    var ua = navigator.userAgent || '';
    return !!window.Capacitor ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
        (navigator.maxTouchPoints > 1 && Math.min(screen.width || 0, screen.height || 0) <= 900);
}

function openQrFilePicker() {
    var input = document.getElementById('qrFileInput');
    if (input) input.click();
}

function hideQrReader() {
    var reader = document.getElementById('qrReaderContainer');
    if (reader) reader.style.display = 'none';
}

async function stopQrScanner() {
    if (!html5QrScanner) {
        hideQrReader();
        return;
    }
    var scanner = html5QrScanner;
    html5QrScanner = null;
    try {
        if (typeof scanner.stop === 'function') await scanner.stop();
    } catch (_) {
        var msg = _.message || '';
        if (!/not running or paused/i.test(msg)) console.warn('[SWALLOWED]', msg || _);
    }
    try {
        if (typeof scanner.clear === 'function') await scanner.clear();
    } catch (_) { console.warn('[SWALLOWED]', _.message || _); }
    hideQrReader();
}

function resumeSessionWithoutNewAttendance() {
    currentSessionActive = true;
    sessionStartTime = new Date().toISOString();
    var today = new Date().toISOString().split('T')[0];
    localStorage.setItem('katfast_session_active', 'true');
    localStorage.setItem('katfast_session_start', sessionStartTime);
    localStorage.setItem('katfast_session_date', today);
    updateSessionUI(true);
    showToast('✅ ' + __('sessionRestored'));
}

async function handleDecodedAttendanceCode(decodedText, source) {
    if (attendanceCodeProcessing) return;
    attendanceCodeProcessing = true;
    try {
        showToast('ℹ️ تم إلغاء نظام الحضور في هذا التطبيق');
    } finally {
        attendanceCodeProcessing = false;
    }
}

window.startQRScanner = async function () {
    showToast('ℹ️ تم إلغاء نظام الحضور في هذا التطبيق');
};

window.handleQRFile = async function (event) {
    var file = event.target.files[0];
    if (!file) return;
    var startBtn = document.getElementById('startScanBtn');
    try {
        if (startBtn) {
            startBtn.disabled = true;
            startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + __('readingQrImage');
        }
        await ensureQrScannerReady();
        await stopQrScanner();
        html5QrScanner = new Html5Qrcode('qrReader');
        var decodedText = await html5QrScanner.scanFile(file, true);
        await handleDecodedAttendanceCode(decodedText, 'file');
    } catch (e) {
        showToast('❌ ' + __('invalidQr'), 'error');
    } finally {
        event.target.value = '';
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.innerHTML = '<i class="fas ' + (isMobileScannerDevice() ? 'fa-camera' : 'fa-image') + '"></i> ' + (isMobileScannerDevice() ? __('scanCode') : __('chooseQrImage'));
        }
    }
};

window.toggleManualEntry = function () {
    const el = document.getElementById('manualCodeEntry');
    const btn = document.getElementById('showManualEntryBtn');
    if (!el) return;
    if (el.style.display === 'block') {
        el.style.display = 'none';
        if (btn) btn.innerHTML = '<i class="fas fa-keyboard"></i> ' + __('manualEntry');
    } else {
        el.style.display = 'block';
        if (btn) btn.innerHTML = '<i class="fas fa-times"></i> ' + __('cancel');
        document.getElementById('manualCodeInput')?.focus();
    }
};

window.submitManualCode = function () {
    const input = document.getElementById('manualCodeInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) { showToast('❌ ' + __('enterCode'), 'error'); return; }
    document.getElementById('manualCodeEntry').style.display = 'none';
    handleDecodedAttendanceCode(text, 'manual');
};

function showWorkoutPicker(callback) {
    var container = document.getElementById('workoutPickerList');
    var modal = document.getElementById('workoutPickerModal');
    if (!container || !modal) return callback();
    var schedules = cacheLoad('official_schedules', 31536000000) || [];
    if (schedules.length === 0) return callback();
    container.innerHTML = schedules.map(function (w) {
        var wName = [w.name, w.name_en].filter(Boolean).join(' / ') || 'جدول';
        var daysCount = (w.data?.days || []).length;
        return '<div onclick="pickWorkout(\'' + String(w.id).replace(/'/g,"\\'") + '\')" style="display:flex;align-items:center;gap:10px;padding:12px;background:var(--glass-bg);border:1px solid var(--line);border-radius:12px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background=\'var(--glass-hover)\'" onmouseout="this.style.background=\'var(--glass-bg)\'">' +
            '<div style="width:40px;height:40px;border-radius:10px;background:var(--primary-glow);display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fas fa-dumbbell" style="color:var(--primary);font-size:16px;"></i></div>' +
            '<div style="flex:1;"><div style="font-size:13px;font-weight:700;">' + wName + '</div><div style="font-size:10px;opacity:0.5;">' + daysCount + ' أيام</div></div>' +
            '<i class="fas fa-chevron-left" style="opacity:0.3;font-size:12px;"></i></div>';
    }).join('') +
    '<div onclick="pickWorkout(null)" style="display:flex;align-items:center;gap:10px;padding:12px;background:transparent;border:1px dashed var(--line);border-radius:12px;cursor:pointer;margin-top:4px;" onmouseover="this.style.background=\'var(--glass-bg)\'" onmouseout="this.style.background=\'transparent\'">' +
        '<i class="fas fa-times" style="opacity:0.4;font-size:14px;"></i>' +
        '<span style="font-size:12px;opacity:0.6;">بدون جدول (تسجيل حضور فقط)</span></div>';
    window._wpCallback = callback;
    document.getElementById('workoutPickerModal').style.display = 'flex';
}
window.pickWorkout = function (wId) {
    document.getElementById('workoutPickerModal').style.display = 'none';
    if (typeof window._wpCallback === 'function') window._wpCallback(wId);
    window._wpCallback = null;
};

async function activateSessionSuccess(workoutId) {
    if (html5QrScanner) {
        html5QrScanner.stop().then(() => {
            document.getElementById('qrReaderContainer').style.display = 'none';
        }).catch(err => {
            document.getElementById('qrReaderContainer').style.display = 'none';
        });
    }

    currentSessionActive = true;
    var now = new Date();
    sessionStartTime = now.toISOString();
    var today = now.toISOString().split('T')[0];
    
    localStorage.setItem('katfast_session_active', 'true');
    localStorage.setItem('katfast_session_start', sessionStartTime);
    localStorage.setItem('katfast_session_date', today);

    _recordAttendance(today, workoutId);

    updateSessionUI(true);
}

// ========== نظام حضور جديد كلياً ==========
function _recordAttendance(today, workoutId) {
    var now = new Date();
    var uid = currentUser && currentUser.id;
    if (!uid) return;
    // Attendance records are disabled in the user app.
    localStorage.removeItem('katfast_current_attendance_id');
    localStorage.setItem('katfast_last_attendance_date', today);
    localStorage.setItem('katfast_check_in_time', now.toISOString());
    if (workoutId) localStorage.setItem('katfast_current_workout_id', String(workoutId));
}

function _attendanceList() {
    try { return JSON.parse(localStorage.getItem('katfast_attendance_records') || '[]'); } catch (_) { return []; }
}

function _saveAttendanceList(list) {
    localStorage.setItem('katfast_attendance_records', JSON.stringify(list));
}

function _formatAttendanceTime(value) {
    if (value === undefined || value === null || value === '') return '—';
    if (typeof value === 'string') {
        var trimmed = value.trim();
        if (!trimmed) return '—';
        if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(trimmed)) return trimmed.substring(0, 5);
        if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed) || trimmed.indexOf(' ') > -1) {
            var parsed = new Date(trimmed);
            if (!isNaN(parsed.getTime())) {
                return parsed.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: false });
            }
        }
        if (trimmed.indexOf(':') > -1) return trimmed.substring(0, 5);
        return trimmed;
    }
    var d = new Date(value);
    if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    return '—';
}

function _formatAttendanceDate(value) {
    if (value === undefined || value === null || value === '') return '—';
    var d = null;
    if (typeof value === 'string') {
        var trimmed = value.trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
            d = new Date(trimmed + 'T00:00:00');
        } else {
            var parsed = new Date(trimmed);
            if (!isNaN(parsed.getTime())) d = parsed;
        }
    } else {
        var parsedValue = new Date(value);
        if (!isNaN(parsedValue.getTime())) d = parsedValue;
    }
    if (!d) return '—';
    return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
}

function _findIndex(list, date, userId) {
    var uid = userId !== undefined && userId !== null ? String(userId) : (currentUser && currentUser.id !== undefined && currentUser.id !== null ? String(currentUser.id) : null);
    for (var i = 0; i < list.length; i++) {
        if (list[i].date == date && (!uid || String(list[i].user_id) === uid)) return i;
    }
    return -1;
}

function _findAttendanceRecordIndex(list, userId, date, recordId, createdAt) {
    if (recordId) {
        for (var i = 0; i < list.length; i++) {
            if (String(list[i].id) === String(recordId)) return i;
        }
    }
    if (createdAt) {
        for (var j = 0; j < list.length; j++) {
            if (String(list[j].user_id) === String(userId) && list[j].date == date && String(list[j].created_at) === String(createdAt)) return j;
        }
    }
    return _findIndex(list, date, userId);
}

function _cleanAttendancePayload(payload) {
    var clean = Object.assign({}, payload || {});
    delete clean._local_id;
    return clean;
}

function _markLocalAttendanceSynced(userId, date, serverId, localId, createdAt) {
    var list = _attendanceList();
    var idx = _findAttendanceRecordIndex(list, userId, date, localId || serverId, createdAt);
    if (idx >= 0) {
        if (serverId) list[idx].id = serverId;
        list[idx].synced = true;
        _saveAttendanceList(list);
    }
    if (currentUser && String(currentUser.id) === String(userId) && date === new Date().toISOString().split('T')[0]) {
        if (serverId) localStorage.setItem('katfast_current_attendance_id', serverId);
        localStorage.setItem('katfast_last_attendance_date', date);
    }
}

function restoreActiveSession() {
    var today = new Date().toISOString().split('T')[0];
    var sessionDate = localStorage.getItem('katfast_session_date');
    var active = localStorage.getItem('katfast_session_active');
    var start = localStorage.getItem('katfast_session_start');
    
    if (sessionDate !== today || active !== 'true' || !start) {
        currentSessionActive = false;
        localStorage.removeItem('katfast_session_active');
        localStorage.removeItem('katfast_session_start');
        localStorage.removeItem('katfast_session_date');
        updateSessionUI(false);
        return;
    }
    
    currentSessionActive = true;
    sessionStartTime = start;
    updateSessionUI(true);
}

function updateSessionUI(active) {
    const badge = document.getElementById('sessionStatusBadge');
    const desc = document.getElementById('sessionStatusDesc');
    const endBtn = document.getElementById('endWorkoutBtn');
    const startBtn = document.getElementById('startScanBtn');
    const uploadBtn = document.getElementById('uploadQrBtn');
    const qrWrapper = document.getElementById('qrScannerWrapper');
    var quickBtn = document.getElementById('quickResumeBtn');

    if (active) {
        if (qrWrapper) qrWrapper.style.display = '';
        if (badge) {
            badge.textContent = __('sessionActive');
            badge.style.background = '#27AE60';
        }
        if (desc) {
            desc.textContent = __('sessionActiveDesc');
        }
        if (endBtn) {
            endBtn.style.display = 'block';
            endBtn.innerHTML = '<i class="fas fa-stop-circle"></i> ' + __('endWorkoutLabel');
        }
        if (startBtn) startBtn.style.display = 'none';
        if (uploadBtn) uploadBtn.style.display = 'none';
        if (qrWrapper) qrWrapper.style.border = '1px solid rgba(39, 174, 96, 0.4)';
        if (quickBtn) quickBtn.style.display = 'none';
        // Re-render schedules to show preview button
        var schedContainer = document.getElementById('officialScheduleList');
        var schedData = cacheLoad('official_schedules', 31536000000);
        if (schedContainer && schedData && schedData.length > 0) renderSchedules(schedData, schedContainer);
    } else {
        var lastAttendDate = localStorage.getItem('katfast_last_attendance_date');
        var today = new Date().toISOString().split('T')[0];
        if (lastAttendDate === today) {
            if (qrWrapper) qrWrapper.style.display = 'none';
        } else {
            if (qrWrapper) qrWrapper.style.display = '';
            if (badge) {
                badge.textContent = __('sessionInactive');
                badge.style.background = '#E74C3C';
            }
            if (desc) {
                desc.textContent = __('sessionInactiveDesc');
            }
            if (endBtn) {
                endBtn.style.display = 'none';
                endBtn.innerHTML = '<i class="fas fa-stop-circle"></i> ' + __('endWorkoutLabel');
            }
            if (startBtn) {
                startBtn.style.display = 'block';
                startBtn.innerHTML = '<i class="fas ' + (isMobileScannerDevice() ? 'fa-camera' : 'fa-image') + '"></i> ' + (isMobileScannerDevice() ? __('scanCode') : __('chooseQrImage'));
            }
            if (uploadBtn) uploadBtn.style.display = 'none';
            if (qrWrapper) qrWrapper.style.border = '1px solid rgba(255, 215, 0, 0.2)';
            // Show quick resume button if last code saved
            var lastCode = localStorage.getItem('katfast_last_gym_code');
            if (lastCode && qrWrapper) {
                if (!quickBtn) {
                    quickBtn = document.createElement('button');
                    quickBtn.id = 'quickResumeBtn';
                    quickBtn.style.cssText = 'width:100%;margin-top:8px;padding:10px;background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.3);border-radius:10px;color:#FFD700;font-weight:bold;font-size:12px;cursor:pointer;font-family:inherit;';
                    quickBtn.onclick = function () {
                        handleDecodedAttendanceCode(lastCode, 'resume').then(function () {
                            if (readCachedGymCode() && !isValidGymCode(lastCode)) {
                                localStorage.removeItem('katfast_last_gym_code');
                                quickBtn.style.display = 'none';
                            }
                        });
                    };
                    qrWrapper.appendChild(quickBtn);
                }
                quickBtn.innerHTML = '<i class="fas fa-history"></i> ' + __('resumeLastCode') + ': ' + lastCode;
                quickBtn.style.display = 'block';
            } else if (quickBtn) {
                quickBtn.style.display = 'none';
            }
        }
    }
}

window.currentSessionRatingValue = 0;

window.setSessionStars = function(rating) {
    window.currentSessionRatingValue = rating;
    const stars = document.querySelectorAll('#sessionStarsContainer .session-star');
    stars.forEach((star, idx) => {
        if (idx < rating) {
            star.style.color = '#FFD700';
        } else {
            star.style.color = 'var(--star-empty)';
        }
    });
};

window.submitSessionRating = function() {
    const rating = window.currentSessionRatingValue;
    if (rating === 0) {
        showToast(__('selectRating'), 'error');
        return;
    }
    const note = document.getElementById('sessionRatingNote')?.value || '';
    const date = new Date().toISOString();
    
    const ratings = JSON.parse(localStorage.getItem('katfast_session_ratings') || '[]');
    ratings.push({ rating, note, date });
    localStorage.setItem('katfast_session_ratings', JSON.stringify(ratings));
    
    const modal = document.getElementById('sessionRatingModal');
    if (modal) modal.style.display = 'none';
    
    showToast('👋 ' + __('sessionEnded') + ' ' + __('goodbye'));
    if (window.updateWeeklySummary) window.updateWeeklySummary();
};

window.endWorkoutSession = async function() {
    if (!currentSessionActive || !sessionStartTime) return;

    if (!confirm(__('endSessionConfirm'))) return;

    var now = new Date();
    var today = now.toISOString().split('T')[0];
    var realDuration = Math.max(1, Math.round((Date.now() - new Date(sessionStartTime).getTime()) / 60000));
    localStorage.removeItem('katfast_current_attendance_id');
    localStorage.removeItem('katfast_check_in_time');
    localStorage.setItem('katfast_last_attendance_date', today);

    currentSessionActive = false;
    sessionStartTime = null;
    localStorage.removeItem('katfast_session_active');
    localStorage.removeItem('katfast_session_start');
    localStorage.setItem('katfast_session_date', today);
    updateSessionUI(false);
    
    showToast('🏋️ ' + __('sessionEnded') + ' (' + realDuration + ' ' + __('minutes') + ')');
    
    window.currentSessionRatingValue = 0;
    const noteField = document.getElementById('sessionRatingNote');
    if (noteField) noteField.value = '';
    window.setSessionStars(0);
    const modal = document.getElementById('sessionRatingModal');
    if (modal) modal.style.display = 'flex';
};

// ==================== Schedules (QR Lock Embedded) ====================
async function loadOfficialSchedules() {
    const container = document.getElementById('officialScheduleList');
    if (!container) return;

    // Show cached data immediately if available
    var cached = cacheLoad('official_schedules', 31536000000);
    if (cached && cached.length > 0) {
        renderSchedules(cached, container);
    }

    // Try server first when online
    if (db && navigator.onLine) {
        try {
            if (!cached || cached.length === 0) container.innerHTML = '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>جاري تحميل الجداول...</p></div>';
            const { data, error } = await db.from('workouts').select('*').eq('is_public', true).eq('is_approved', true).order('created_at', { ascending: false });
            if (error) throw error;
            if (data && data.length > 0) {
                cacheSave('official_schedules', data, 31536000000);
                renderSchedules(data, container);
            } else if (!cached || cached.length === 0) {
                container.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-times"></i><p>' + __('noOfficialSchedules') + '</p></div>';
            }
            return;
        } catch (err) {
            console.warn('[loadOfficialSchedules] server fetch failed:', err.message);
        }
    }

    // Fallback: offline or server error
    if (!cached || cached.length === 0) {
        if (db && !navigator.onLine) container.innerHTML = '<div class="empty-state"><i class="fas fa-wifi-slash"></i><p>' + __('noInternetSchedule') + '</p></div>';
        else container.innerHTML = `<div class="empty-state"><i class="fas fa-wifi"></i><p>${__('scheduleLoadError')}</p></div>`;
    }
}
function refreshOfficialSchedules() {
    loadOfficialSchedules();
}

window.filterOfficialSchedules = function() {
    const query = (document.getElementById('searchOfficialSchedulesInput')?.value || '').toLowerCase().trim();
    const container = document.getElementById('officialScheduleList');
    if (!container) return;
    
    const cached = cacheLoad('official_schedules', 31536000000) || [];
    if (cached.length === 0) return;
    
    if (!query) {
        renderSchedules(cached, container);
        return;
    }
    
    const filtered = cached.filter(w => {
        const name = (w.name || '').toLowerCase();
        const nameEn = (w.name_en || '').toLowerCase();
        const days = w.data?.days || [];
        const matchesName = name.includes(query) || nameEn.includes(query);
        const matchesMuscle = days.some(day => {
            const dayName = (day.name || '').toLowerCase();
            const dayNameEn = (day.nameEn || '').toLowerCase();
            const exercises = day.exercises || [];
            return dayName.includes(query) || dayNameEn.includes(query) || exercises.some(ex => {
                const exName = (ex.name || '').toLowerCase();
                const exDesc = (ex.desc || '').toLowerCase();
                const exCategory = (ex.category || '').toLowerCase();
                return exName.includes(query) || exDesc.includes(query) || exCategory.includes(query);
            });
        });
        return matchesName || matchesMuscle;
    });
    
    renderSchedules(filtered, container);
};


// ==================== Workout Session (Step-by-Step) ====================
let wsExercises = [];
let wsCurrentIndex = 0;
let wsWorkoutId = null;
let wsDayId = null;

window.startDayWorkout = async function (wId, dayIdx) {
    var schedules = cacheLoad('official_schedules', 31536000000) || [];
    var w = schedules.find(s => String(s.id) === String(wId));
    if (!w && navigator.onLine && db) {
        try {
            var { data } = await db.from('workouts').select('*').eq('id', wId).single();
            if (data) { w = data; }
        } catch (_) { console.warn('[SWALLOWED]', _.message || _); }
    }
    if (!w || !w.data?.days[dayIdx]) { showToast(__('scheduleNotFound'), 'error'); return; }
    var dayData = w.data.days[dayIdx];
    var dayId = dayData.id || dayData.uid || 'd' + (parseInt(dayIdx) + 1);
    wsExercises = dayData.exercises || [];
    wsWorkoutId = wId;
    wsDayId = dayId;
    wsCurrentIndex = 0;
    if (wsExercises.length === 0) { showToast(__('noExercises'), 'error'); return; }
    currentSessionActive = true;
    sessionStartTime = Date.now();
    showToast(__('startingWorkout', { n: wsExercises.length }));
    renderWsExercise();
    document.getElementById('workoutSessionModal').style.display = 'flex';
};

function renderWsExercise() {
    const ex = wsExercises[wsCurrentIndex];
    if (!ex) { closeWorkoutSession(); return; }
    const total = wsExercises.length;
    var lang = window.userCurrentLang || 'ar';
    const pct = Math.round((wsCurrentIndex + 1) / total * 100);
    const progressLabel = document.getElementById('wsProgressLabel');
    const progressPct = document.getElementById('wsProgressPct');
    const progressBar = document.getElementById('wsProgressBar');
    if (progressLabel) progressLabel.textContent = __('exerciseOf', {n: wsCurrentIndex + 1, total: total});
    if (progressPct) progressPct.textContent = pct + '%';
    if (progressBar) progressBar.style.width = pct + '%';
    const imgSrc = resolveUserExerciseImage(ex);
    const wsContainer = document.getElementById('wsImageContainer');
    if (!wsContainer) return;
    if (imgSrc) {
        wsContainer.innerHTML = '<img id="wsExerciseImage" src="' + imgSrc + '" style="width:100%;height:100%;object-fit:contain;" onerror="showExerciseFallback(this)">';
    } else {
        wsContainer.innerHTML = '<div style="font-size:60px;opacity:0.2;"><i class="fas fa-dumbbell"></i></div>';
    }
    const exName = ex.name_ar || ex.name || __('exercise');
    const nameEl = document.getElementById('wsExerciseName');
    const detailEl = document.getElementById('wsExerciseDetail');
    const descEl = document.getElementById('wsExerciseDesc');
    const prevBtn = document.getElementById('wsPrevBtn');
    if (nameEl) nameEl.textContent = exName;
    if (detailEl) detailEl.textContent = (ex.sets || 3) + ' × ' + (ex.reps || 12) + (ex.rest ? __('restSeconds', {n: ex.rest}) : '');
    if (descEl) descEl.textContent = ex.description_ar || ex.description || '';
    if (prevBtn) prevBtn.style.display = wsCurrentIndex > 0 ? '' : 'none';
    const isLast = wsCurrentIndex === total - 1;
    const nextLabel = document.getElementById('wsNextLabel');
    const nextBtn = document.getElementById('wsNextBtn');
    if (nextLabel) nextLabel.textContent = isLast ? __('finish') : __('next');
    if (nextBtn) nextBtn.innerHTML = isLast
        ? '<i class="fas fa-flag-checkered"></i> ' + __('finish')
        : '<i class="fas fa-check-circle"></i> ' + __('next');
}

window.wsNextExercise = function () {
    const ex = wsExercises[wsCurrentIndex];
    if (ex) {
        const dayIdx = parseInt(wsDayId.replace('d', '')) - 1;
        const exIdx = wsCurrentIndex;
        const wId = wsWorkoutId;
        toggleExercise(wId, wsDayId, exIdx, null, { forceComplete: true });
    }
    if (wsCurrentIndex < wsExercises.length - 1) {
        wsCurrentIndex++;
        renderWsExercise();
        // Start rest timer
        const restTime = parseInt(ex?.rest) || 60;
        window.startRestTimer(restTime);
    } else {
        showToast('🎉 ' + __('workoutComplete'));
        closeWorkoutSession();
        // Re-render schedules to unlock next day
        const container = document.getElementById('officialScheduleList');
        if (container) {
            const cached = cacheLoad('official_schedules', 31536000000) || [];
            if (cached.length > 0) renderSchedules(cached, container);
        }
        // Don't end the gym session — persists until user ends it manually
    }
};

window.wsPrevExercise = function () {
    if (wsCurrentIndex > 0) {
        wsCurrentIndex--;
        renderWsExercise();
        window.skipRestTimer();
    }
};

window.closeWorkoutSession = function () {
    document.getElementById('workoutSessionModal').style.display = 'none';
    wsExercises = [];
    wsCurrentIndex = 0;
    window.skipRestTimer();
};

let _restTimerInterval = null;

window.startRestTimer = function(seconds) {
    const timerSection = document.getElementById('restTimerSection');
    const timerDisplay = document.getElementById('restTimerDisplay');
    const timerRing = document.getElementById('restTimerRing');
    if (!timerSection || !timerDisplay) return;
    
    clearInterval(_restTimerInterval);
    
    let remaining = seconds;
    const circumference = 163.36;
    timerSection.style.display = 'block';
    if (timerRing) timerRing.style.strokeDashoffset = '0';
    
    function updateDisplay() {
        const m = Math.floor(remaining / 60).toString().padStart(2, '0');
        const s = (remaining % 60).toString().padStart(2, '0');
        timerDisplay.textContent = m + ':' + s;
        if (timerRing) {
            const offset = circumference * (1 - remaining / seconds);
            timerRing.style.strokeDashoffset = offset;
        }
    }
    updateDisplay();
    
    _restTimerInterval = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
            clearInterval(_restTimerInterval);
            timerDisplay.textContent = '00:00';
            if (timerRing) timerRing.style.strokeDashoffset = circumference;
            timerSection.style.display = 'none';
            playRestBeep();
        } else {
            updateDisplay();
        }
    }, 1000);
};

window.skipRestTimer = function() {
    clearInterval(_restTimerInterval);
    const timerSection = document.getElementById('restTimerSection');
    if (timerSection) timerSection.style.display = 'none';
};

function playRestBeep() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        osc.connect(ctx.destination);
        osc.frequency.value = 800;
        osc.start();
        setTimeout(() => { osc.stop(); ctx.close(); }, 300);
    } catch(e) { console.warn('Audio not supported'); }
}

let _epExerciseList = [];
let _epExerciseIndex = 0;

function _showEpExercise(index) {
    const exercises = _epExerciseList;
    if (!exercises || exercises.length === 0) return;
    const idx = Math.max(0, Math.min(index, exercises.length - 1));
    _epExerciseIndex = idx;
    const ex = exercises[idx];
    document.getElementById('epProgressLabel').textContent = __('exerciseOf', {n: idx + 1, total: exercises.length});
    const imgSrc = resolveUserExerciseImage(ex);
    let imgEl = document.getElementById('epImage');
    const epContainer = document.getElementById('epImageContainer');
    if (!epContainer) return;
    epContainer.innerHTML = '';
    if (imgSrc) {
        const newImg = document.createElement('img');
        newImg.id = 'epImage';
        newImg.src = imgSrc;
        newImg.style.cssText = 'width:100%;height:100%;object-fit:contain;';
        newImg.onerror = function () { showExerciseFallback(newImg); };
        epContainer.appendChild(newImg);
    } else {
        epContainer.innerHTML = '<div style="font-size:60px;opacity:0.2;"><i class="fas fa-dumbbell"></i></div>';
    }
    document.getElementById('epName').textContent = ex.name_ar || ex.name || __('exercisesFallback');
    document.getElementById('epDetail').textContent = (ex.sets || '—') + ' × ' + (ex.reps || '—') + (ex.rest ? __('restSeconds', {n: ex.rest}) : '');
    document.getElementById('epDesc').textContent = ex.description_ar || ex.description || '';
    document.getElementById('epPrevBtn').style.display = idx > 0 ? '' : 'none';
    document.getElementById('epNextBtn').style.display = idx < exercises.length - 1 ? '' : 'none';
}

window.previewDayExercises = function (wId, dayIdx) {
    const schedules = cacheLoad('official_schedules', 31536000000) || [];
    const w = schedules.find(s => String(s.id) === String(wId));
    if (!w || !w.data?.days[parseInt(dayIdx)]) { return; }
    const exercises = w.data.days[parseInt(dayIdx)].exercises || [];
    if (exercises.length === 0) {         showToast(__('noExercisesErr'), 'error'); return; }
    _epExerciseList = exercises;
    _epExerciseIndex = 0;
    _showEpExercise(0);
    document.getElementById('exercisePreviewModal').style.display = 'flex';
};

window.epNextExercise = function () {
    if (_epExerciseIndex < _epExerciseList.length - 1) _showEpExercise(_epExerciseIndex + 1);
};
window.epPrevExercise = function () {
    if (_epExerciseIndex > 0) _showEpExercise(_epExerciseIndex - 1);
};

let userPublisherCache = {};
let userRatingCache = {};
async function renderSchedules(workouts, container) {
    if (!workouts || workouts.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-times"></i><p>' + __('noOfficialSchedules') + '</p></div>';
        return;
    }
    // Load cached publisher names + ratings immediately (render won't wait for DB)
    const creatorIds = [...new Set(workouts.map(w => w.created_by).filter(Boolean))];
    if (Object.keys(userRatingCache).length === 0) {
        try { Object.assign(userRatingCache, JSON.parse(localStorage.getItem('katfast_workout_ratings') || '{}')); } catch (_) {}
    }
    // Fetch publisher names + fresh ratings from DB in background (non-blocking)
    if (db && navigator.onLine) {
        if (creatorIds.length > 0 && Object.keys(userPublisherCache).length === 0) {
            db.from('users').select('id,name').in('id', creatorIds).then(function(r) {
                if (r.data) r.data.forEach(function(u) { userPublisherCache[u.id] = u.name || '—'; });
            }).catch(function(){});
        }
        db.from('workout_ratings').select('*').then(function(r) {
            if (r.data) {
                r.data.forEach(function(r2) {
                    var k = String(r2.workout_id);
                    if (!userRatingCache[k]) userRatingCache[k] = [];
                    if (!userRatingCache[k].some(function(x) { return x.user_id === r2.user_id; })) userRatingCache[k].push({ user_id: r2.user_id, rating: r2.rating });
                });
                localStorage.setItem('katfast_workout_ratings', JSON.stringify(userRatingCache));
            }
        }).catch(function(){});
    }
    function getAvgRating(wId) {
        const arr = userRatingCache[String(wId)] || [];
        if (arr.length === 0) return { avg: 0, count: 0 };
        const sum = arr.reduce((s, r) => s + (r.rating || 0), 0);
        return { avg: (sum / arr.length).toFixed(1), count: arr.length };
    }
    container.innerHTML = workouts.map(w => {
        const days = w.data?.days || [];
        const wName = [w.name, w.name_en].filter(Boolean).join(' / ');
        const pubName = userPublisherCache[w.created_by] || '—';
        const rating = getAvgRating(w.id);
        const stars = Math.round(parseFloat(rating.avg) || 0);
        const starHtml = '<span style="display:inline-flex;gap:2px;direction:ltr;pointer-events:none;">' + [1,2,3,4,5].map(s => `<span style="color:${s <= stars ? '#FFD700' : 'var(--star-empty)'};">★</span>`).join('') + '</span>';
        const daysHtml = days.map((day, di) => {
            const dayName = [day.name, day.nameEn].filter(Boolean).join(' / ');
            const exercises = day.exercises || [];
            // Check if all exercises in this day are completed
            const allDone = exercises.every((_, i) => isCompleted(w.id, day.id, i));
            return `
            <details class="glass-card workout-day-accordion" style="padding:0;margin-bottom:8px;border:1px solid var(--line);border-radius:12px;border-right:3px solid ${di === 0 ? 'var(--primary)' : di === 1 ? 'var(--cyan)' : 'var(--pink)'};overflow:hidden;background:rgba(255,255,255,0.02);">
                <summary style="display:flex;justify-content:space-between;align-items:center;gap:10px;list-style:none;cursor:pointer;padding:12px 14px;outline:none;">
                    <h4 style="font-size:14px;font-weight:700;color:${di === 0 ? 'var(--primary)' : di === 1 ? 'var(--cyan)' : 'var(--pink)'};margin:0;display:flex;align-items:center;gap:6px;">
                        ${allDone ? '<i class="fas fa-check-circle" style="color:var(--success);font-size:14px;"></i>' : '<i class="fas fa-sun"></i>'}
                        ${dayName}
                    </h4>
                    <div style="display:flex;gap:4px;">
                        <button type="button" onclick="event.preventDefault();event.stopPropagation();previewDayExercises('${String(w.id).replace(/'/g,"\\'")}','${di}')" style="padding:6px 10px;background:rgba(255,255,255,0.06);border:1px solid var(--line);border-radius:8px;color:var(--text-secondary);font-size:11px;font-weight:600;cursor:pointer;"><i class="fas fa-eye"></i> معاينه</button>
                        <button type="button" onclick="event.preventDefault();event.stopPropagation();startDayWorkout('${String(w.id).replace(/'/g,"\\'")}','${di}')" style="padding:6px 14px;background:linear-gradient(135deg,var(--primary),var(--cyan));border:none;border-radius:8px;color:#fff;font-size:11px;font-weight:700;cursor:pointer;"><i class="fas fa-play"></i> ${__('startBtn')}</button>
                        <span style="font-size:14px;opacity:0.4;"><i class="fas fa-chevron-down"></i></span>
                    </div>
                </summary>
                <div style="display:flex;flex-direction:column;gap:6px;padding:0 14px 12px 14px;">
                ${exercises.map((ex, i) => {
                    const exName = [ex.name_ar || ex.name || '', ex.name_en || ''].filter(Boolean).join(' / ') || __('exercisesFallback');
                    const imgSrc = resolveUserExerciseImage(ex);
                    const done = isCompleted(w.id, day.id, i);
                    return `
                    <div class="exercise-item ${done ? 'completed' : ''}" id="uex_${w.id}_${day.id}_${i}" style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:${done ? 'rgba(74,222,128,0.05)' : 'rgba(255,255,255,0.02)'};border-radius:10px;">
                        ${imgSrc ? `<img src="${imgSrc}" style="width:48px;height:48px;border-radius:10px;object-fit:cover;flex-shrink:0;" onerror="this.style.display='none'">` : `<div style="width:48px;height:48px;border-radius:10px;background:rgba(255,255,255,0.04);display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fas fa-dumbbell" style="font-size:18px;color:var(--text-secondary);"></i></div>`}
                        <div style="flex:1;min-width:0;">
                            <div style="font-size:13px;font-weight:600;">${exName}</div>
                            <div style="font-size:10px;opacity:0.5;">${ex.sets||3}×${ex.reps||12}${ex.rest ? __('restSeconds', {n: ex.rest}) : ''}</div>
                        </div>
                        ${done ? '<span style="color:var(--success);font-size:16px;"><i class="fas fa-check-circle"></i></span>' : ''}
                    </div>`}).join('')}
                </div>
            </details>`;
        }).join('');
        return `<div style="margin-bottom:24px;background:rgba(255,255,255,0.02);border-radius:16px;padding:16px;border:1px solid var(--line);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:4px;">
                <h3 style="color:#FFD700;font-size:16px;font-weight:800;margin:0;"><i class="fas fa-dumbbell"></i> ${wName}</h3>
                <div style="display:flex;align-items:center;gap:8px;font-size:11px;">
                    <span style="opacity:0.6;">👤 ${pubName}</span>
                    <span style="display:flex;align-items:center;gap:3px;cursor:pointer;" onclick="showUserRatingModal('${String(w.id).replace(/'/g,"\\'")}','','${String(wName).replace(/'/g,"\\'")}')">${starHtml}<span style="opacity:0.4;font-size:10px;">(${rating.count})</span></span>
                </div>
            </div>
            ${daysHtml}
        </div>`;
    }).join('');
}

function resolveUserExerciseImage(ex) {
    if (!ex) return '';
    const exId = ex.exercise_id || ex.id;
    // Always prefer local library lookup — it has correct image_url with random suffix
    if (exId) {
        const padded = String(exId).padStart(4, '0');
        const cached = sessionStorage.getItem('katfast_full_exercises');
        if (cached) {
            try {
                const lib = JSON.parse(cached);
                const found = lib.find(e => String(e.id).padStart(4, '0') === padded);
                if (found && found.image_url) return found.image_url.replace(/^\.\.\//, '');
            } catch (_) { console.warn('[SWALLOWED]', _.message || _); }
        }
    }
    // Fallback to DB image_url if local lookup didn't find it
    if (ex.image_url) {
        let url = ex.image_url;
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        if (url.startsWith('../')) return url.substring(3);
        return url;
    }
    // Final fallback: generate path from exercise ID
    if (exId) {
        const padded = String(exId).padStart(4, '0');
        return 'assets/exercises/gifs/' + padded + '.gif';
    }
    return '';
}

window.handleCheckboxClick = function(wId, dayId, exIdx, btn) {
    if (!currentSessionActive) {
        alert(__('startWorkoutFirst'));
        return;
    }
    toggleExercise(wId, dayId, exIdx, btn);
};

window.toggleCollapse = function (id) {
    const el = document.getElementById(id);
    if (el) el.style.display = el.style.display === 'none' ? 'flex' : 'none';
};

function getCompletedKey() {
    var sd = localStorage.getItem('katfast_session_date');
    var d = sd ? new Date(sd + 'T00:00:00') : new Date();
    return 'katfast_completed_' + d.toDateString();
}
function isCompleted(wId, dayId, exIdx) {
    const data = JSON.parse(localStorage.getItem(getCompletedKey()) || '{}');
    return !!data[`${wId}_${dayId}_${exIdx}`];
}
function toggleExercise(wId, dayId, exIdx, btn, opts) {
    if (!currentUser) return;
    const key = getCompletedKey();
    const data = JSON.parse(localStorage.getItem(key) || '{}');
    const exKey = `${wId}_${dayId}_${exIdx}`;
    const item = document.getElementById(`uex_${wId}_${dayId}_${exIdx}`);
    if (data[exKey]) {
        if (opts && opts.forceComplete) return;
        delete data[exKey];
        item?.classList.remove('completed');
    } else {
        if (window._subExpired) {
            showToast(__('subscriptionExpiredStart'), 'error');
            return;
        }
        data[exKey] = true;
        item?.classList.add('completed');
        showMotivation();
        pushToSyncQueue('workout_complete', { user_id: currentUser.id, date: new Date().toISOString().split('T')[0], type: 'workout_complete', value: { workoutId: wId, dayId, exerciseIndex: exIdx } });
        processSyncQueue();
        // Check if all exercises in this day are now complete → re-render to unlock next day
        try {
            const cached = cacheLoad('official_schedules', 31536000000) || [];
            const w = cached.find(s => String(s.id) === String(wId));
            if (w && w.data?.days) {
                const day = w.data.days.find(d => String(d.id) === String(dayId) || d.uid === dayId);
                if (day && (day.exercises || []).length > 0) {
                    const allDayDone = day.exercises.every((_, i) => isCompleted(wId, day.id, i));
                    if (allDayDone) {
                        showToast('🎉 ' + (day.name || '') + ' تم الإنتهاء من');
                        const container = document.getElementById('officialScheduleList');
                        if (container) renderSchedules(cached, container);
                    }
                }
            }
        } catch (_) { console.warn('[SWALLOWED]', _.message || _); }
    }
    localStorage.setItem(key, JSON.stringify(data));
}

// ==================== Professional Tips & Motivation ====================
const motivationTips = [
    { icon: 'fa-dumbbell', title: 'استمرارية', text: 'النجاح ليس غياب الفشل، بل الاستمرار بعد كل محاولة فاشلة.' },
    { icon: 'fa-clock', title: 'البداية', text: 'أفضل وقت لبدء التمرين هو اليوم. الغد ليس وعداً.' },
    { icon: 'fa-dumbbell', title: 'قوة الإرادة', text: 'قوة الإرادة مثل العضلة — تزداد قوة مع كل تمرين.' },
    { icon: 'fa-chart-line', title: 'تطور ذاتي', text: 'لا تقارن نفسك بالآخرين، قارن نفسك بنسخة الأمس منك.' },
    { icon: 'fa-check-double', title: 'الانضباط', text: 'الانضباط هو الفارق بين الحلم والواقع.' },
    { icon: 'fa-fire', title: 'الجهد', text: 'جسمك يكافئك على كل قطرة عرق تذرفها في التمرين.' },
    { icon: 'fa-rocket', title: 'النمو', text: 'التقدم الحقيقي يحدث خارج منطقة الراحة.' },
    { icon: 'fa-coins', title: 'استثمار', text: 'استثمارك في صحتك هو أعلى عائد يمكنك تحقيقه.' },
    { icon: 'fa-shoe-prints', title: 'خطوات', text: 'كل خطوة صغيرة تقربك من هدفك الكبير.' },
    { icon: 'fa-redo', title: 'التكرار', text: 'التكرار هو أم التعلم وجدار بناء الأجساد القوية.' },
    { icon: 'fa-play-circle', title: 'المثالية', text: 'لا تنتظر الظروف المثالية، ابدأ بما لديك الآن.' },
    { icon: 'fa-brain', title: 'العقل والجسم', text: 'العقل السليم في الجسم السليم — تدرب لجسم وعقل أفضل.' },
    { icon: 'fa-bed', title: 'الراحة', text: 'الراحة جزء من التدريب، وليس هروباً منه.' },
    { icon: 'fa-apple-alt', title: 'التغذية', text: 'التغذية الجيدة تبنى في المطبخ، والجسم يبنى في صالة الرياضة.' },
    { icon: 'fa-calendar-check', title: 'الاستمرارية', text: 'الاستمرارية أهم من الشدة — تمرن بانتظام وسترى النتائج.' },
    { icon: 'fa-bolt', title: 'التحدي', text: 'كل تمرين لم ترغب في أدائه هو الذي يصنع الفارق الأكبر.' },
    { icon: 'fa-bullseye', title: 'الأهداف', text: 'الهدف دون خطة مجرد أمنية. ضع خطة والتزم بها.' },
    { icon: 'fa-moon', title: 'النوم', text: 'خذ قسطاً كافياً من النوم — فالتعافي يبدأ عندما تنام.' },
    { icon: 'fa-heartbeat', title: 'الإحماء', text: 'الإحماء ليس خياراً، إنه استثمار في سلامة مفاصلك.' },
    { icon: 'fa-tint', title: 'الترطيب', text: 'اشرب الماء بانتظام — جفاف الجسم يخفض أداءك بنسبة تصل إلى 30%.' },
    { icon: 'fa-pen-alt', title: 'التسجيل', text: 'سجل تقدمك — الكتابة تزيد الالتزام وتظهر التحسن.' },
    { icon: 'fa-shield-alt', title: 'السلامة', text: 'الإصابات تحدث عندما تستعجل النتائج. تحلى بالصبر.' },
    { icon: 'fa-cubes', title: 'الأساسيات', text: 'التمارين الأساسية مثل السكوات والديدليفت تبني قاعدة قوية.' },
    { icon: 'fa-lungs', title: 'التنفس', text: 'التنفس الصحيح أثناء التمرين يضاعف فعالية الحركة.' },
    { icon: 'fa-sun', title: 'صباحك', text: 'المواظبة على التمرين في الصباح تحسن إنتاجيتك طوال اليوم.' },
    { icon: 'fa-balance-scale', title: 'التوازن', text: 'التوازن بين التدريب والتغذية والنوم هو سر النجاح.' },
    { icon: 'fa-hand-peace', title: 'الإطالة', text: 'لا تهمل تمارين الإطالة — فهي تحسن مرونتك وتقلل الإصابات.' },
    { icon: 'fa-weight', title: 'القرار', text: 'كل كيلوغرام تفقده أو تبنيه يبدأ بقرار تتخذه اليوم.' },
    { icon: 'fa-trophy', title: 'التحديات', text: 'التحديات ليست عقبات، إنها فرص لإثبات قدراتك.' },
    { icon: 'fa-headphones', title: 'الاستماع', text: 'استمع لجسمك — الألم تحذير، والتعب رسالة.' },
    { icon: 'fa-utensils', title: 'التغذية المتكاملة', text: 'البروتين ليس كل شيء — الكربوهيدرات والدهون الصحية شركاؤك في الطاقة.' },
    { icon: 'fa-handshake', title: 'الشريك', text: 'تمرن مع شريك لزيادة الحافز وتحسين الأداء.' },
    { icon: 'fa-fist-raised', title: 'التغلب على الكسل', text: 'اليوم الذي تتكاسل فيه هو بالضبط اليوم الذي تحتاج للتمرين فيه.' },
    { icon: 'fa-seedling', title: 'الصبر', text: 'التطور الحقيقي بطيء لكنه ثابت — لا تيأس من بطء النتائج.' },
    { icon: 'fa-heart', title: 'الاهتمام', text: 'كل عضلة في جسمك تستحق الاهتمام — لا تهمل أياً منها.' },
    { icon: 'fa-search-plus', title: 'التقنية', text: 'التركيز على التقنية الصحيحة أهم من رفع أوزان ثقيلة.' },
    { icon: 'fa-drumstick-bite', title: 'التعافي', text: 'الوجبة بعد التمرين هي المفتاح لتعافي أسرع ونتائج أفضل.' },
    { icon: 'fa-walking', title: 'التعافي النشط', text: 'التعافي النشط (مشي، سباحة) أفضل من الجلوس المطلق في يوم الراحة.' },
    { icon: 'fa-calendar-alt', title: 'الروتين', text: 'اصنع روتيناً يناسب حياتك — الاستمرارية تبدأ بالملاءمة.' },
    { icon: 'fa-gem', title: 'الاحتفال', text: 'احتفل بالإنجازات الصغيرة — كل تكرار صحيح هو فوز.' },
];
function getDailyTipIndex(count) {
    const today = new Date().toISOString().split('T')[0];
    let hash = 0;
    for (let i = 0; i < today.length; i++) { hash = ((hash << 5) - hash) + today.charCodeAt(i); hash |= 0; }
    return Math.abs(hash) % count;
}
function renderDailyTips() {
    const container = document.getElementById('dailyTipsContainer');
    if (!container) return;
    const startIdx = getDailyTipIndex(motivationTips.length - 4);
    const dailyTips = [];
    for (let i = 0; i < 5; i++) {
        dailyTips.push(motivationTips[(startIdx + i) % motivationTips.length]);
    }
    const tipImages = [
        'assets/exercises/gifs/3293-72BC5Za.gif',
        'assets/exercises/gifs/3294-A9qxk2F.gif',
        'assets/exercises/gifs/3672-fNGumX0.gif',
        'assets/exercises/gifs/3545-TVdivgY.gif',
        'assets/exercises/gifs/3220-f9lVSSI.gif'
    ];
    container.innerHTML = dailyTips.map((tip, idx) => {
        const img = tipImages[idx % tipImages.length];
        return `
        <article class="tip-card glass-card">
            <div class="tip-card-media">
                <img src="${img}" alt="${tip.title}">
            </div>
            <div class="tip-card-body">
                <div class="tip-card-icon"><i class="fas ${tip.icon}"></i></div>
                <div class="tip-card-title">${tip.title}</div>
                <div class="tip-card-text">${tip.text}</div>
            </div>
        </article>`;
    }).join('');
}
function showMotivation() {
    const card = document.getElementById('motivationCard');
    const text = document.getElementById('motivationText');
    if (!card || !text) return;
    const idx = getDailyTipIndex(motivationTips.length);
    text.innerHTML = '💪 ' + motivationTips[idx].text;
    card.style.display = 'block';
}
function rotateDailyTips() {
    renderDailyTips();
    showMotivation();
}

// ==================== Exercise Fallback (built-in, no file needed) ====================
var EXERCISE_FALLBACK_LIST = [
  {id:1,name_ar:'3/4 sit-up',category:'بطن',body_part_ar:'بطن',image_url:'assets/exercises/gifs/0001-2gPfomN.gif'},
  {id:2,name_ar:'45° side bend',category:'بطن',body_part_ar:'بطن',image_url:'assets/exercises/gifs/0002-Hy9D21L.gif'},
  {id:3,name_ar:'air bike',category:'بطن',body_part_ar:'بطن',image_url:'assets/exercises/gifs/0003-1ZFqTDN.gif'},
  {id:1512,name_ar:'all fours squad stretch',category:'أرجل (أمامي)',body_part_ar:'أرجل (أمامي)',image_url:'assets/exercises/gifs/1512-qBcKorM.gif'},
  {id:6,name_ar:'alternate heel touchers',category:'بطن',body_part_ar:'بطن',image_url:'assets/exercises/gifs/0006-qaZVsGk.gif'},
  {id:7,name_ar:'alternate lateral pulldown',category:'ظهر',body_part_ar:'ظهر',image_url:'assets/exercises/gifs/0007-4IKbhHV.gif'},
  {id:1368,name_ar:'ankle circles',category:'أرجل (سفلي)',body_part_ar:'أرجل (سفلي)',image_url:'assets/exercises/gifs/1368-uL9CsKm.gif'},
  {id:3293,name_ar:'archer pull up',category:'ظهر',body_part_ar:'ظهر',image_url:'assets/exercises/gifs/3293-72BC5Za.gif'},
  {id:3294,name_ar:'archer push up',category:'صدر',body_part_ar:'صدر',image_url:'assets/exercises/gifs/3294-A9qxk2F.gif'},
  {id:2355,name_ar:'arm slingers hanging bent knee legs',category:'بطن',body_part_ar:'بطن',image_url:'assets/exercises/gifs/2355-uWpxD4v.gif'},
  {id:2333,name_ar:'arm slingers hanging straight legs',category:'بطن',body_part_ar:'بطن',image_url:'assets/exercises/gifs/2333-PXTIwgu.gif'},
  {id:3214,name_ar:'arms apart circular toe touch (male)',category:'أرجل (أمامي)',body_part_ar:'أرجل (أمامي)',image_url:'assets/exercises/gifs/3214-RtyAsy1.gif'},
  {id:3204,name_ar:'arms overhead full sit-up (male)',category:'بطن',body_part_ar:'بطن',image_url:'assets/exercises/gifs/3204-NAkmgdx.gif'},
  {id:9,name_ar:'assisted chest dip (kneeling)',category:'صدر',body_part_ar:'صدر',image_url:'assets/exercises/gifs/0009-PAgTVaK.gif'},
  {id:11,name_ar:'assisted hanging knee raise',category:'بطن',body_part_ar:'بطن',image_url:'assets/exercises/gifs/0011-03lzqwk.gif'},
  {id:10,name_ar:'assisted hanging knee raise with throw down',category:'بطن',body_part_ar:'بطن',image_url:'assets/exercises/gifs/0010-8K0w2yA.gif'},
  {id:1708,name_ar:'assisted lying calves stretch',category:'أرجل (سفلي)',body_part_ar:'أرجل (سفلي)',image_url:'assets/exercises/gifs/1708-GxDwDX0.gif'},
  {id:1709,name_ar:'assisted lying glutes stretch',category:'أرجل (أمامي)',body_part_ar:'أرجل (أمامي)',image_url:'assets/exercises/gifs/1709-yn0LjwL.gif'},
  {id:1710,name_ar:'assisted lying gluteus and piriformis stretch',category:'أرجل (أمامي)',body_part_ar:'أرجل (أمامي)',image_url:'assets/exercises/gifs/1710-RQNVT10.gif'},
  {id:12,name_ar:'assisted lying leg raise with lateral throw down',category:'بطن',body_part_ar:'بطن',image_url:'assets/exercises/gifs/0012-UGhRD1A.gif'},
  {id:13,name_ar:'assisted lying leg raise with throw down',category:'بطن',body_part_ar:'بطن',image_url:'assets/exercises/gifs/0013-VX5YKR5.gif'},
  {id:14,name_ar:'assisted motion russian twist',category:'بطن',body_part_ar:'بطن',image_url:'assets/exercises/gifs/0014-r7cT9YD.gif'},
  {id:15,name_ar:'assisted parallel close grip pull-up',category:'ظهر',body_part_ar:'ظهر',image_url:'assets/exercises/gifs/0015-vrhHa6D.gif'},
  {id:16,name_ar:'assisted prone hamstring',category:'أرجل (أمامي)',body_part_ar:'أرجل (أمامي)',image_url:'assets/exercises/gifs/0016-VedGSby.gif'},
  {id:1713,name_ar:'assisted prone lying quads stretch',category:'أرجل (أمامي)',body_part_ar:'أرجل (أمامي)',image_url:'assets/exercises/gifs/1713-YUYAMEj.gif'},
  {id:1714,name_ar:'assisted prone rectus femoris stretch',category:'بطن',body_part_ar:'بطن',image_url:'assets/exercises/gifs/1714-2Ryn564.gif'},
  {id:17,name_ar:'assisted pull-up',category:'ظهر',body_part_ar:'ظهر',image_url:'assets/exercises/gifs/0017-kiJ4Z2K.gif'},
  {id:1716,name_ar:'assisted seated pectoralis major stretch with stability ball',category:'صدر',body_part_ar:'صدر',image_url:'assets/exercises/gifs/1716-RoV1Rfa.gif'},
  {id:1712,name_ar:'assisted side lying adductor stretch',category:'أرجل (أمامي)',body_part_ar:'أرجل (أمامي)',image_url:'assets/exercises/gifs/1712-hC6oYY5.gif'},
  {id:1758,name_ar:'assisted sit-up',category:'بطن',body_part_ar:'بطن',image_url:'assets/exercises/gifs/1758-aumB2IV.gif'},
  {id:1431,name_ar:'assisted standing chin-up',category:'ظهر',body_part_ar:'ظهر',image_url:'assets/exercises/gifs/1431-7OeHptV.gif'},
  {id:1432,name_ar:'assisted standing pull-up',category:'ظهر',body_part_ar:'ظهر',image_url:'assets/exercises/gifs/1432-f4xtKBj.gif'},
  {id:18,name_ar:'assisted standing triceps extension (with towel)',category:'ذراعين',body_part_ar:'ذراعين',image_url:'assets/exercises/gifs/0018-7HcfMBP.gif'},
  {id:19,name_ar:'assisted triceps dip (kneeling)',category:'ذراعين',body_part_ar:'ذراعين',image_url:'assets/exercises/gifs/0019-J60bN17.gif'},
  {id:2364,name_ar:'assisted wide-grip chest dip (kneeling)',category:'صدر',body_part_ar:'صدر',image_url:'assets/exercises/gifs/2364-PnZJIrk.gif'},
  {id:3220,name_ar:'astride jumps (male)',category:'كارديو',body_part_ar:'كارديو',image_url:'assets/exercises/gifs/3220-f9lVSSI.gif'},
  {id:3672,name_ar:'back and forth step',category:'كارديو',body_part_ar:'كارديو',image_url:'assets/exercises/gifs/3672-fNGumX0.gif'},
  {id:1314,name_ar:'back extension on exercise ball',category:'ظهر',body_part_ar:'ظهر',image_url:'assets/exercises/gifs/1314-qLpO4vV.gif'},
  {id:3297,name_ar:'back lever',category:'ظهر',body_part_ar:'ظهر',image_url:'assets/exercises/gifs/3297-GaSzzuh.gif'},
  {id:1405,name_ar:'back pec stretch',category:'ظهر',body_part_ar:'ظهر',image_url:'assets/exercises/gifs/1405-chfnQnM.gif'},
  {id:1473,name_ar:'backward jump',category:'أرجل (أمامي)',body_part_ar:'أرجل (أمامي)',image_url:'assets/exercises/gifs/1473-SaDOwk7.gif'},
  {id:20,name_ar:'balance board',category:'أرجل (أمامي)',body_part_ar:'أرجل (أمامي)',image_url:'assets/exercises/gifs/0020-xAySMB0.gif'},
  {id:968,name_ar:'band alternating biceps curl',category:'ذراعين',body_part_ar:'ذراعين',image_url:'assets/exercises/gifs/0968-3omWx6P.gif'},
  {id:969,name_ar:'band alternating v-up',category:'بطن',body_part_ar:'بطن',image_url:'assets/exercises/gifs/0969-ztAa1RK.gif'},
  {id:970,name_ar:'band assisted pull-up',category:'ظهر',body_part_ar:'ظهر',image_url:'assets/exercises/gifs/0970-r1XNRYB.gif'},
  {id:971,name_ar:'band assisted wheel rollerout',category:'بطن',body_part_ar:'بطن',image_url:'assets/exercises/gifs/0971-zhF9lW4.gif'},
  {id:1254,name_ar:'band bench press',category:'صدر',body_part_ar:'صدر',image_url:'assets/exercises/gifs/1254-khlHMqs.gif'},
  {id:980,name_ar:'band bent-over hip extension',category:'أرجل (أمامي)',body_part_ar:'أرجل (أمامي)',image_url:'assets/exercises/gifs/0980-wSScovH.gif'},
  {id:972,name_ar:'band bicycle crunch',category:'بطن',body_part_ar:'بطن',image_url:'assets/exercises/gifs/0972-tZkGYZ9.gif'},
  {id:974,name_ar:'band close-grip pulldown',category:'ظهر',body_part_ar:'ظهر',image_url:'assets/exercises/gifs/0974-DptumMx.gif'},
  {id:975,name_ar:'band close-grip push-up',category:'ذراعين',body_part_ar:'ذراعين',image_url:'assets/exercises/gifs/0975-ufaxB52.gif'},
  {id:976,name_ar:'band concentration curl',category:'ذراعين',body_part_ar:'ذراعين',image_url:'assets/exercises/gifs/0976-kmVVAfu.gif'}
];

// ==================== Full Exercise Library Loader ====================
let userFullExerciseLibrary = [];
async function loadUserExerciseLibrary() {
    if (userFullExerciseLibrary.length > 0) return userFullExerciseLibrary;
    // Try global JS variable (loaded via <script> tag)
    if (window.__katfast_exercises_data && window.__katfast_exercises_data.length > 0) {
        userFullExerciseLibrary = window.__katfast_exercises_data;
        try { sessionStorage.setItem('katfast_full_exercises', JSON.stringify(userFullExerciseLibrary)); } catch (_) { console.warn('[SWALLOWED]', _.message || _); }
        return userFullExerciseLibrary;
    }
    // Try sessionStorage cache
    const cached = sessionStorage.getItem('katfast_full_exercises');
    if (cached) {
        try { userFullExerciseLibrary = JSON.parse(cached); return userFullExerciseLibrary; } catch (_) { console.warn('[SWALLOWED]', _.message || _); }
    }
    // Fallback: XHR async read
    try {
        var data = await new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'assets/exercises/exercises_full.js', true);
            xhr.overrideMimeType('text/plain');
            xhr.onload = function () {
                if (xhr.status === 0 || xhr.status === 200) {
                    var xtext = xhr.responseText.replace(/^\uFEFF/, '');
                    var xstart = xtext.indexOf('[');
                    var xend = xtext.lastIndexOf(']');
                    if (xstart !== -1 && xend !== -1 && xend > xstart) {
                        try {
                            var xparsed = JSON.parse(xtext.substring(xstart, xend + 1));
                            resolve(xparsed);
                        } catch (e) { reject(e); }
                    } else { reject(new Error('no array')); }
                } else { reject(new Error('status ' + xhr.status)); }
            };
            xhr.onerror = function () { reject(new Error('xhr error')); };
            xhr.ontimeout = function () { reject(new Error('timeout')); };
            xhr.timeout = 10000;
            xhr.send();
        });
        userFullExerciseLibrary = data;
        try { sessionStorage.setItem('katfast_full_exercises', JSON.stringify(data)); } catch (_) { console.warn('[SWALLOWED]', _.message || _); }
        return data;
    } catch (_) { console.warn('[SWALLOWED]', _.message || _); }
    // Final fallback: dynamic script tag (short timeout)
    try {
        var data = await new Promise(function (resolve, reject) {
            var s = document.createElement('script');
            s.src = 'assets/exercises/exercises_full.js';
            s.onload = function () {
                if (window.__katfast_exercises_data && window.__katfast_exercises_data.length > 0) {
                    resolve(window.__katfast_exercises_data);
                } else {
                    reject(new Error('no data'));
                }
            };
            s.onerror = reject;
            document.head.appendChild(s);
            setTimeout(function () { reject(new Error('timeout')); }, 3000);
        });
        userFullExerciseLibrary = data;
        try { sessionStorage.setItem('katfast_full_exercises', JSON.stringify(data)); } catch (_) { console.warn('[SWALLOWED]', _.message || _); }
        return data;
    } catch (_) { console.warn('[SWALLOWED]', _.message || _); }
    // Ultimate fallback: built-in list (works everywhere, no file loading)
    userFullExerciseLibrary = EXERCISE_FALLBACK_LIST;
    try { sessionStorage.setItem('katfast_full_exercises', JSON.stringify(EXERCISE_FALLBACK_LIST)); } catch (_) { console.warn('[SWALLOWED]', _.message || _); }
    return userFullExerciseLibrary;
}

// ==================== User Exercise Picker ====================
window.showUserExercisePicker = async function (dayIdx) {
    const modal = document.getElementById('userExercisePickerModal');
    if (!modal) return;
    modal.style.display = 'flex';
    document.getElementById('userExPickerSearch').value = '';
    const grid = document.getElementById('userExPickerGrid');
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;opacity:0.5;padding:20px;font-size:13px;"><i class="fas fa-spinner fa-spin"></i> ' + __('loadingLibrary') + '</p>';

    var lib = await loadUserExerciseLibrary();
    if (!lib || lib.length === 0) {
        // Try one more time with cache cleared (force XHR fallback)
        sessionStorage.removeItem('katfast_full_exercises');
        lib = await loadUserExerciseLibrary();
    }
    if (!lib || lib.length === 0) {
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;opacity:0.5;padding:20px;font-size:13px;">' + __('noLocalExercises') + ' <a href="#" onclick="showUserExercisePicker(window._userExPickerDayIdx||0);return false;" style="color:#FFD700;">' + __('retry') + '</a></p>';
        return;
    }

    window._userExPickerDayIdx = dayIdx;
    window._userExPickerData = lib;
    window._userExPickerCategory = '';
    populateExPickerCategories(lib);
    renderUserExPickerGrid(lib);
};

function populateExPickerCategories(allData) {
    const sel = document.getElementById('userExPickerCategorySelect');
    if (!sel) return;
    var seen = {};
    sel.innerHTML = '<option value="">🔰 ' + __('all') + '</option>';
    allData.forEach(function(ex) {
        var c = ex.category || '';
        if (c && !seen[c]) { seen[c] = true; sel.innerHTML += '<option value="' + c.replace(/"/g, '&quot;') + '">' + c + '</option>'; }
    });
}

function renderUserExPickerGrid(list) {
    const grid = document.getElementById('userExPickerGrid');
    if (!grid) return;
    var cat = window._userExPickerCategory || '';
    var q = (document.getElementById('userExPickerSearch').value || '').toLowerCase().trim();
    var filtered = list.filter(function(ex) {
        if (cat && ex.category !== cat) return false;
        if (q) {
            var text = ((ex.name_ar||'') + ' ' + (ex.name_en||'') + ' ' + (ex.name||'') + ' ' + (ex.body_part_ar||'') + ' ' + (ex.bodyPart||'') + ' ' + (ex.category||'')).toLowerCase();
            if (text.indexOf(q) === -1) return false;
        }
        return true;
    });
    if (filtered.length === 0) {
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;opacity:0.5;padding:20px;font-size:13px;">' + __('noResults') + '</p>';
        return;
    }

    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;opacity:0.5;padding:20px;font-size:13px;"><i class="fas fa-spinner fa-spin"></i> ' + __('loadingLibrary') + '...</p>';

    var itemsPerChunk = 50;
    var idx = 0;
    var frag = document.createDocumentFragment();

    function renderChunk() {
        var end = Math.min(idx + itemsPerChunk, filtered.length);
        for (var i = idx; i < end; i++) {
            var ex = filtered[i];
            var exName = ex.name_ar || ex.name || __('exercise');
            var exBody = ex.body_part_ar || ex.bodyPart || '';
            var gifUrl = ex.image_url || '';
            var div = document.createElement('div');
            div.style.cssText = 'cursor:pointer;border-radius:12px;border:1px solid var(--line);background:rgba(255,255,255,0.02);transition:all 0.2s;';
            div.onmouseover = function () { this.style.borderColor = '#FFD700'; };
            div.onmouseout = function () { this.style.borderColor = 'var(--line)'; };
            div.onclick = (function(dIdx, eId, eName) {
                return function() { selectUserExFromPicker(dIdx, eId, eName); };
            })(window._userExPickerDayIdx, ex.id, exName);
            div.innerHTML = '<div style="width:100%;height:170px;background:rgba(0,0,0,0.06);display:flex;align-items:center;justify-content:center;">' + (gifUrl ? '<img src="' + gifUrl + '" alt="' + exName + '" loading="lazy" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.innerHTML=\'<i class=\\\'fas fa-dumbbell\\\' style=\\\'font-size:36px;opacity:0.3;\\\'></i>\'">' : '<i class="fas fa-dumbbell" style="font-size:36px;opacity:0.3;"></i>') + '</div><div style="padding:8px 10px;"><div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + exName + '</div><div style="font-size:10px;opacity:0.5;">' + exBody + '</div></div>';
            frag.appendChild(div);
        }
        idx = end;
        if (idx < filtered.length) {
            grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;opacity:0.5;padding:20px;font-size:13px;"><i class="fas fa-spinner fa-spin"></i> ' + __('loadingLibrary') + ' (' + Math.round(idx / filtered.length * 100) + '%)</p>';
            grid.appendChild(frag);
            requestAnimationFrame(renderChunk);
        } else {
            grid.innerHTML = '';
            grid.appendChild(frag);
        }
    }

    requestAnimationFrame(renderChunk);
}

window.selectUserExFromPicker = function (dayIdx, exId, exName) {
    userWorkoutDays[dayIdx].exercises.push({ id: exId, name: exName });
    renderMyDays();
    document.getElementById('userExercisePickerModal').style.display = 'none';
    showToast(__('exerciseAdded', { name: exName }));
};

window.filterUserExPicker = function () {
    renderUserExPickerGrid(window._userExPickerData || []);
};

// ==================== User Workout Rating ====================
let _userRatingWorkoutId = null;
let _userRatingDayId = null;
let _userRatingValue = 0;

window.showUserRatingModal = function (wId, dayId, exName) {
    _userRatingWorkoutId = wId;
    _userRatingDayId = dayId;
    _userRatingValue = 0;
    document.getElementById('userRatingExName').textContent = exName || '—';
    // Build star HTML dynamically (never hardcoded in index.html)
    var container = document.getElementById('userRatingStars');
    if (container && !container.hasChildNodes()) {
        container.innerHTML = [1,2,3,4,5].map(function (i) {
            return '<span onclick="setUserRating(' + i + ')" id="userStar' + i + '" style="font-size:36px;cursor:pointer;transition:all 0.2s;color:var(--star-empty);" onmouseover="this.style.color=\'#FFD700\'" onmouseout="updateUserRatingDisplay()">\u2605</span>';
        }).join('');
    }
    updateUserRatingDisplay();
    document.getElementById('userRatingModal').style.display = 'flex';
};

window.setUserRating = function (val) {
    _userRatingValue = val;
    updateUserRatingDisplay();
};

function updateUserRatingDisplay() {
    for (let i = 1; i <= 5; i++) {
        const star = document.getElementById('userStar' + i);
        if (star) star.style.color = i <= _userRatingValue ? '#FFD700' : 'var(--star-empty)';
    }
}

window.submitUserRating = function () {
    if (!_userRatingValue || !_userRatingWorkoutId) { showToast(__('selectRating'), 'error'); return; }
    const key = 'katfast_rating_' + _userRatingWorkoutId + '_' + _userRatingDayId;
    const data = { workout_id: _userRatingWorkoutId, day_id: _userRatingDayId, user_id: currentUser?.id, rating: _userRatingValue, created_at: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify(data));
    pushToSyncQueue('workout_rating', data);
    document.getElementById('userRatingModal').style.display = 'none';
    showToast(__('ratingSent', { n: _userRatingValue }));
    // Re-render to show updated rating
    renderMySchedule(JSON.parse(localStorage.getItem('katfast_my_schedule') || '{}'));
    loadOfficialSchedules();
};

function getWorkoutRating(wId, dayId) {
    const key = 'katfast_rating_' + wId + '_' + dayId;
    try {
        const saved = localStorage.getItem(key);
        if (saved) return JSON.parse(saved).rating || 0;
    } catch (_) { console.warn('[SWALLOWED]', _.message || _); }
    return 0;
}

function getRatingStarsHtml(rating) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= full) html += '<span style="color:#FFD700;">★</span>';
        else if (i === full + 1 && half) html += '<span style="color:#FFD700;opacity:0.6;">★</span>';
        else html += '<span style="color:var(--star-empty);">★</span>';
    }
    return html;
}

// ==================== My Custom Schedule (Interactive Builder) ====================
let userWorkoutDays = [];

function loadMySchedule() {
    return;
}

async function checkScheduleApproval(schedule) {
    if (!navigator.onLine || !db || !currentUser) { return; }
    try {
        var { data } = await db.from('workouts').select('is_approved').eq('created_by', currentUser.id).order('created_at', { ascending: false }).limit(1);
        if (data && data.length > 0) {
            schedule.published = data[0].is_approved ? 'approved' : 'pending';
        } else {
            schedule.published = false;
        }
        localStorage.setItem('katfast_my_schedule', JSON.stringify(schedule));
    } catch (_) { console.warn('[SWALLOWED]', _.message || _); }
}

function renderMySchedule(schedule) {
    return;
}

window.deleteMySchedule = function () {
    return;
};

function renderMyDays() {
    const container = document.getElementById('myUserWorkoutDays');
    if (!container) return;
    if (userWorkoutDays.length === 0) {
        container.innerHTML = '<p style="font-size:12px;opacity:0.4;text-align:center;padding:10px;">' + __('addDayPrompt') + '</p>';
        return;
    }
    container.innerHTML = userWorkoutDays.map((day, i) => `
        <div style="background:rgba(255,215,0,0.05);border:1px solid rgba(255,215,0,0.1);border-radius:10px;padding:10px;margin-bottom:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <input type="text" value="${day.name}" onchange="userWorkoutDays[${i}].name=this.value" style="background:transparent;border:1px solid rgba(255,215,0,0.2);border-radius:6px;padding:4px 8px;color:#fff;font-size:13px;width:60%;font-family:inherit;">
                <button onclick="removeMyDay(${i})" style="background:none;border:none;color:#E74C3C;font-size:16px;cursor:pointer;"><i class="fas fa-times-circle"></i></button>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px;">
                ${(day.exercises||[]).map((ex, ei) => {
                    const exImg = resolveUserExerciseImage(ex);
                    return `<span style="font-size:11px;padding:4px 10px;background:rgba(255,215,0,0.1);border-radius:10px;display:inline-flex;align-items:center;gap:6px;">${exImg ? '<img src="' + exImg + '" style="width:20px;height:20px;border-radius:4px;object-fit:cover;" onerror="this.style.display=\'none\'">' : ''}${ex.name} <span onclick="removeMyEx(${i},${ei})" style="cursor:pointer;opacity:0.5;">&times;</span></span>`;
                }).join('')}
            </div>
            <button onclick="addMyExPrompt(${i})" style="background:rgba(255,215,0,0.1);border:1px dashed rgba(255,215,0,0.2);border-radius:8px;padding:4px 10px;color:#FFD700;font-size:11px;cursor:pointer;"><i class="fas fa-plus"></i> ` + __('addExercise') + `</button>
        </div>
    `).join('');
}

window.addMyDay = function () {
    const uid = 'ud_' + Math.random().toString(36).substr(2,6);
    userWorkoutDays.push({ uid, name: __('dayPrefix') + (userWorkoutDays.length + 1), exercises: [], id: 'd' + (userWorkoutDays.length + 1) });
    renderMyDays();
};
window.removeMyDay = function (i) {
    userWorkoutDays.splice(i, 1);
    renderMyDays();
};
window.addMyExPrompt = function (dayIdx) {
    showUserExercisePicker(dayIdx);
};
window.removeMyEx = function (dayIdx, exIdx) {
    userWorkoutDays[dayIdx].exercises.splice(exIdx, 1);
    renderMyDays();
};

async function saveMySchedule() {
    return;
}

async function requestShare() {
    return;
}

window.requestShareExisting = async function () {
    return;
};

window.cancelShare = async function () {
    return;
};

// ==================== Progress Photos & Image Canvas Compression ====================
function loadProgressPhotos() {
    const saved = JSON.parse(localStorage.getItem('katfast_photos') || '[]');
    renderPhotos(saved);
}

function _getProgressPhotoSeriesStart(photos) {
    var dates = (photos || []).map(function (p) {
        var d = new Date(p && (p.date || p.date_uploaded || p.created_at || ''));
        return isNaN(d.getTime()) ? null : d;
    }).filter(Boolean).sort(function (a, b) { return a - b; });
    return dates.length > 0 ? dates[0] : null;
}

function _getProgressPhotoWeekNumber(photos, dateValue) {
    var currentDate = new Date(dateValue);
    if (isNaN(currentDate.getTime())) return 1;
    var start = _getProgressPhotoSeriesStart(photos);
    if (!start) return 1;
    var diff = currentDate.getTime() - start.getTime();
    return Math.max(1, Math.floor(diff / (7 * 86400000)) + 1);
}

function renderPhotos(photos) {
    const grid = document.getElementById('progressPhotosGrid');
    if (!grid) return;
    if (!photos || photos.length === 0) {
        grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-camera"></i><p>' + __('noPhotos') + '</p></div>';
        return;
    }
    const seriesStart = _getProgressPhotoSeriesStart(photos);
    grid.innerHTML = photos.map((p, idx) => `
        <div class="photo-item" style="position:relative;">
            <img src="${p.url}" alt="${__('altProgress')}">
            <div class="photo-date">${new Date(p.date).toLocaleDateString('ar-EG')}</div>
            ${p.note ? `<div style="position:absolute;top:34px;right:8px;background:rgba(0,0,0,0.7);color:#FFD700;font-size:10px;padding:3px 8px;border-radius:8px;max-width:80%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${p.note}"><i class="fas fa-sticky-note"></i> ${p.note}</div>` : ''}
            <span style="position:absolute;top:8px;left:8px;background:rgba(251,191,36,0.9);color:#000;font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;">` + __('weekLabel') + ` ${_getProgressPhotoWeekNumber(photos, p.date || p.date_uploaded || p.created_at || seriesStart || Date.now())}</span>
            <button onclick="deleteProgressPhoto(${idx})" style="position:absolute;bottom:40px;left:8px;background:#EF4444;color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:11px;font-weight:700;cursor:pointer;opacity:0.9;"><i class="fas fa-trash"></i></button>
        </div>`).join('');
}

window.deleteProgressPhoto = function (index) {
    const photos = JSON.parse(localStorage.getItem('katfast_photos') || '[]');
    if (index < 0 || index >= photos.length) return;
    if (!confirm(__('deletePhotoConfirm'))) return;
    photos.splice(index, 1);
    localStorage.setItem('katfast_photos', JSON.stringify(photos));
    renderPhotos(photos);
    showToast(__('photoDeleted'));
};



let pendingPhotoNote = '';
window.showPhotoNoteInput = function () {
    const section = document.getElementById('photoNoteSection');
    if (section) section.style.display = section.style.display === 'none' ? 'block' : 'none';
};
window.addPhotoWithNote = function () {
    pendingPhotoNote = document.getElementById('photoNoteInput')?.value?.trim() || '';
    document.getElementById('photoInput').click();
};

// Patch handlePhotoCapture to accept notes
window.handlePhotoCapture = async function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const note = pendingPhotoNote;
    pendingPhotoNote = '';
    const section = document.getElementById('photoNoteSection');
    if (section) section.style.display = 'none';
    const noteInput = document.getElementById('photoNoteInput');
    if (noteInput) noteInput.value = '';

    showToast(__('processingPhoto'));
    const reader = new FileReader();
    reader.onload = async function(ev) {
        try {
            const compressedBase64 = await compressImage(ev.target.result, 600, 800, 0.6);
            const photos = JSON.parse(localStorage.getItem('katfast_photos') || '[]');
            const nextWeek = _getProgressPhotoWeekNumber(photos, new Date().toISOString());
            const newPhoto = { url: compressedBase64, date: new Date().toISOString(), week: nextWeek, note: note || undefined };
            photos.unshift(newPhoto);
            if (photos.length > 20) photos.pop();
            localStorage.setItem('katfast_photos', JSON.stringify(photos));
            renderPhotos(photos);
            const dbPayload = {
                user_id: currentUser.id,
                photo_url: compressedBase64,
                week_number: nextWeek,
                notes: note || '',
                date_uploaded: new Date().toISOString()
            };
            pushToSyncQueue('progress_photo', dbPayload);
            showToast(__('photoSaved', { n: nextWeek }));
            processSyncQueue();
        } catch (err) {
            showToast(__('photoFailed', { msg: err.message }), 'error');
        }
    };
    reader.onerror = function() {
        showToast(__('photoFailed', { msg: __('fileReadError') }), 'error');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
};

function compressImage(base64Str, maxWidth, maxHeight, quality) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(function () { reject(new Error(__('imageCompressTimeout'))); }, 15000);
        const img = new Image();
        img.src = base64Str;
        img.onload = function() {
            clearTimeout(timeout);
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const compressed = canvas.toDataURL('image/jpeg', quality);
            resolve(compressed);
        };
        img.onerror = function (e) { clearTimeout(timeout); reject(new Error(__('imageLoadFailed'))); };
    });
}

// ==================== IndexedDB Sync Queue ====================
const DB_NAME = 'KatfastSyncDB';
const DB_VER = 1;
const STORE_NAME = 'syncQueue';
let _syncQueueCache = null;

function _openDB() {
    return new Promise(function (resolve, reject) {
        var req = indexedDB.open(DB_NAME, DB_VER);
        req.onupgradeneeded = function (e) {
            var db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
        };
        req.onsuccess = function (e) { resolve(e.target.result); };
        req.onerror = function (e) { reject(e.target.error); };
    });
}

async function _idbWriteQueue(queue) {
    var db = await _openDB();
    var tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(queue, 'queue');
    await new Promise(function (resolve, reject) {
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
    });
    db.close();
}

async function _idbReadQueue() {
    var db = await _openDB();
    var tx = db.transaction(STORE_NAME, 'readonly');
    var req = tx.objectStore(STORE_NAME).get('queue');
    var result = await new Promise(function (resolve, reject) {
        req.onsuccess = function () { resolve(req.result || []); };
        req.onerror = function () { reject(req.error); };
    });
    db.close();
    return result;
}

function _sameAttendancePayload(a, b) {
    if (!a || !b) return false;
    if (a._local_id || b._local_id) return !!(a._local_id && b._local_id && String(a._local_id) === String(b._local_id));
    if (a.id || b.id) return !!(a.id && b.id && String(a.id) === String(b.id));
    return !!(a.user_id !== undefined && b.user_id !== undefined && a.date && b.date &&
        String(a.user_id) === String(b.user_id) && String(a.date) === String(b.date) &&
        String(a.created_at || '') === String(b.created_at || '') &&
        String(a.check_in_time || '') === String(b.check_in_time || ''));
}

function _findQueueTaskIndex(queue, type, payload) {
    for (var i = 0; i < queue.length; i++) {
        if (queue[i].type === type && _sameAttendancePayload(queue[i].payload, payload)) return i;
    }
    return -1;
}

function _mergeAttendancePayload(base, incoming) {
    var merged = Object.assign({}, base || {}, incoming || {});
    if (base && base.check_in_time && !(incoming && incoming.check_in_time)) merged.check_in_time = base.check_in_time;
    if (base && base.created_at && !(incoming && incoming.created_at)) merged.created_at = base.created_at;
    return merged;
}

async function initSyncQueue() {
    var old = localStorage.getItem('katfast_sync_queue');
    if (old) {
        var data = JSON.parse(old);
        _syncQueueCache = data;
        try { await _idbWriteQueue(data); localStorage.removeItem('katfast_sync_queue'); console.log('[IDB] Migrated ' + data.length + ' tasks from localStorage'); } catch (_) { console.warn('[IDB] Migration write failed', _.message || _); }
    } else {
        try { _syncQueueCache = await _idbReadQueue(); } catch (_) { console.warn('[IDB] Read failed, starting empty', _.message || _); }
    }
    if (!_syncQueueCache) _syncQueueCache = [];
    var seenKeys = {};
    _syncQueueCache = _syncQueueCache.filter(function (item) {
        if (!item) return false;
        if (!item._taskKey) item._taskKey = _taskIdentity(item.type, item.payload);
        if (!item._taskKey) return true;
        if (seenKeys[item._taskKey]) return false;
        seenKeys[item._taskKey] = true;
        return true;
    });
    // Clean stale tasks: remove gym_code from old attendance payloads (column doesn't exist)
    var changed = false;
    for (var qi = 0; qi < _syncQueueCache.length; qi++) {
        var qt = _syncQueueCache[qi];
        if (qt.type === 'attendance' && qt.payload && qt.payload.gym_code) {
            delete qt.payload.gym_code;
            changed = true;
        }
        if ((qt.type === 'attendance' || qt.type === 'update_attendance') && qt.payload) {
            var sameIdx = _findQueueTaskIndex(_syncQueueCache.slice(0, qi), qt.type, qt.payload);
            if (sameIdx >= 0) {
                _syncQueueCache[sameIdx].payload = _mergeAttendancePayload(_syncQueueCache[sameIdx].payload, qt.payload);
                _syncQueueCache.splice(qi, 1);
                qi--;
                changed = true;
                continue;
            }
            if (qt.type === 'update_attendance') {
                var pendingAttendanceIdx = _findQueueTaskIndex(_syncQueueCache.slice(0, qi), 'attendance', qt.payload);
                if (pendingAttendanceIdx >= 0) {
                    _syncQueueCache[pendingAttendanceIdx].payload = _mergeAttendancePayload(_syncQueueCache[pendingAttendanceIdx].payload, qt.payload);
                    _syncQueueCache.splice(qi, 1);
                    qi--;
                    changed = true;
                    continue;
                }
            }
        }
        if (qt.retries >= 5) {
            _syncQueueCache.splice(qi, 1);
            qi--;
            changed = true;
        }
    }
    if (changed) await saveSyncQueue(_syncQueueCache);
}

function getSyncQueue() {
    if (!_syncQueueCache) _syncQueueCache = [];
    return _syncQueueCache;
}

async function saveSyncQueue(queue) {
    _syncQueueCache = queue;
    try { await _idbWriteQueue(queue); } catch (_) { console.warn('[IDB] Write fallback to localStorage', _.message || _); localStorage.setItem('katfast_sync_queue', JSON.stringify(queue)); }
}

function _taskIdentity(type, payload) {
    if (!type) return '';
    payload = payload || {};
    if (type === 'attendance' || type === 'update_attendance') {
        return type + ':' + [payload.user_id, payload.date, payload._local_id || payload.id, payload.created_at, payload.check_in_time].join('|');
    }
    if (type === 'profile_update') return type + ':' + String(payload.id || '');
    if (type === 'workout_rating') return type + ':' + [payload.user_id, payload.workout_id, payload.day_id].join('|');
    if (type === 'workout_complete') {
        var v = payload.value || {};
        return type + ':' + [payload.user_id, v.workoutId || payload.workout_id, v.dayId || payload.day_id, v.exerciseIndex || payload.exerciseIndex].join('|');
    }
    if (type === 'add_user') return type + ':' + String((payload.email || '').toLowerCase().trim());
    if (type === 'update_user' || type === 'delete_user') return type + ':' + String(payload.id || '');
    if (type === 'add_exercise' || type === 'update_exercise' || type === 'delete_exercise') {
        return type + ':' + String(payload.id || (payload.name_ar || payload.name || '')).toLowerCase().trim();
    }
    if (type === 'create_workout' || type === 'share_workout' || type === 'update_workout' || type === 'delete_workout' || type === 'approve_workout' || type === 'reject_workout') {
        return type + ':' + String(payload.id || payload.created_by || payload.name || '').toLowerCase().trim();
    }
    if (type === 'send_notification') return type + ':' + [payload.user_id || 'all', payload.title || '', payload.body || ''].join('|').toLowerCase().trim();
    if (type === 'upsert_subscription') return type + ':' + String(payload.id || [payload.name_ar || '', payload.name_en || ''].join('|')).toLowerCase().trim();
    if (type === 'update_settings') return type + ':' + String(payload.key || '');
    if (type === 'subscription_log') return type + ':' + [payload.user_id || '', payload.action || '', payload.date || '', payload.notes || ''].join('|').toLowerCase().trim();
    if (type === 'weight_log') return type + ':' + [payload.user_id || '', payload.date || '', payload.weight || ''].join('|');
    if (type === 'progress_photo') return type + ':' + [payload.user_id || '', payload.date_uploaded || '', payload.week_number || '', payload.photo_url ? payload.photo_url.length : 0].join('|');
    return type + ':' + JSON.stringify(payload || {});
}

function _replaceQueuedTask(queue, type, payload, item) {
    var key = _taskIdentity(type, payload);
    if (!key) return false;
    for (var i = 0; i < queue.length; i++) {
        if (queue[i]._taskKey === key) {
            queue[i] = item;
            queue[i]._taskKey = key;
            return true;
        }
    }
    return false;
}

async function pushToSyncQueue(type, payload) {
    var queue = getSyncQueue();
    if ((type === 'attendance' || type === 'update_attendance') && payload) {
        if (type === 'update_attendance') {
            var pendingAttendanceIdx = _findQueueTaskIndex(queue, 'attendance', payload);
            if (pendingAttendanceIdx >= 0) {
                queue[pendingAttendanceIdx].payload = _mergeAttendancePayload(queue[pendingAttendanceIdx].payload, payload);
                updateSyncBadge();
                await saveSyncQueue(queue);
                setTimeout(function () { processSyncQueue(); }, 100);
                return;
            }
        }
    }
    var task = { id: 'q_' + Math.random().toString(36).substr(2, 9) + Date.now(), type: type, payload: payload };
    var taskKey = _taskIdentity(type, payload);
    if (taskKey && _replaceQueuedTask(queue, type, payload, task)) {
        updateSyncBadge();
        await saveSyncQueue(queue);
        setTimeout(function () { processSyncQueue(); }, 100);
        return;
    }
    if (taskKey) task._taskKey = taskKey;
    queue.push(task);
    updateSyncBadge();
    console.log('[Queue] Added new task: ' + type);
    await saveSyncQueue(queue);
    setTimeout(function () { processSyncQueue(); }, 100);
}

var _listenersSetup = false;
function setupSyncListeners() {
    if (_listenersSetup) return;
    _listenersSetup = true;
    window.addEventListener('online', function () {
        updateSyncBadge();
        fetchGymCode();
        showToast(__('internetRestored'));
        setTimeout(function () { processSyncQueue(); }, 500);
        refreshOfficialSchedules();
    });
    window.addEventListener('offline', function () {
        updateSyncBadge();
    });
    setInterval(function () {
        if (navigator.onLine) processSyncQueue();
    }, 30000);
    setInterval(function () {
        refreshOfficialSchedules();
    }, 120000);
    window.addEventListener('load', function () { setTimeout(function () { updateSyncBadge(); }, 1000); });
}

function updateSyncBadge() {
    var badge = document.getElementById('syncBadge');
    var text = document.getElementById('syncBadgeText');
    if (!badge || !text) return;
    var queue = getSyncQueue();
    if (!navigator.onLine) {
        badge.className = 'sync-badge error';
        text.innerHTML = '<i class="fas fa-wifi-slash"></i> ' + __('syncOffline');
        badge.title = __('noConnection');
    } else if (queue.length > 0) {
        badge.className = 'sync-badge pending';
        text.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> <span class="count">' + queue.length + '</span>';
        badge.title = __('pendingSync', { n: queue.length });
    } else {
        badge.className = 'sync-badge idle';
        text.innerHTML = '<i class="fas fa-check-circle"></i> ' + __('syncOnline');
        badge.title = __('allSynced');
    }
}

window.forceSync = async function () {
    if (!navigator.onLine) {
        showToast('❌ ' + __('noInternet'), 'error');
        return;
    }
    var badge = document.getElementById('syncBadge');
    var text = document.getElementById('syncBadgeText');
    if (badge && text) {
        badge.className = 'sync-badge syncing';
        text.innerHTML = '<i class="fas fa-sync-alt spin"></i> ' + __('syncing');
    }
    var done = await processSyncQueue();
    if (badge && text) {
        if (done) {
            badge.className = 'sync-badge idle';
            text.innerHTML = '<i class="fas fa-check-circle"></i> ' + __('exported');
            badge.title = __('allSynced');
        } else {
            var remaining = getSyncQueue().length;
            badge.className = 'sync-badge error';
            text.innerHTML = '<i class="fas fa-exclamation-circle"></i> <span class="count">' + remaining + '</span>';
            badge.title = __('tasksFailed', { n: remaining });
        }
    }
};

async function processSyncQueue() {
    if (!navigator.onLine || !db) return false;

    var queue = getSyncQueue();
    if (queue.length === 0) { updateSyncBadge(); return true; }

    console.log('[Sync] Starting sync processor. Tasks: ' + queue.length);
    var remainingTasks = [];
    var successCount = 0;

    for (var ti = 0; ti < queue.length; ti++) {
        var task = queue[ti];
        try {
            if (task.type === 'attendance') {
                var r1 = await db.from('attendance_log').insert([_cleanAttendancePayload(task.payload)]).select('id').single();
                if (r1.error) throw r1.error;
                var serverAttendanceId = r1.data && r1.data.id;
                // Mark local record as synced
                var loList = _attendanceList();
                var loIdx = _findAttendanceRecordIndex(loList, task.payload.user_id, task.payload.date, task.payload._local_id || serverAttendanceId, task.payload.created_at);
                if (loIdx >= 0) {
                    if (serverAttendanceId) loList[loIdx].id = serverAttendanceId;
                    loList[loIdx].synced = true;
                    _saveAttendanceList(loList);
                }
                if (serverAttendanceId && currentUser && String(currentUser.id) === String(task.payload.user_id)) {
                    localStorage.setItem('katfast_current_attendance_id', serverAttendanceId);
                    localStorage.setItem('katfast_last_attendance_date', task.payload.date);
                }
            } else if (task.type === 'update_attendance') {
                var updateData = { duration_minutes: task.payload.duration_minutes };
                if (task.payload.check_out_time) updateData.check_out_time = task.payload.check_out_time;
                var loList2 = _attendanceList();
                var loIdx2 = _findAttendanceRecordIndex(loList2, task.payload.user_id, task.payload.date, task.payload._local_id || task.payload.id, task.payload.created_at);
                var targetId = loIdx2 >= 0 ? loList2[loIdx2].id : task.payload.id;
                if (targetId && (!task.payload._local_id || String(targetId) !== String(task.payload._local_id))) {
                    var r2 = await db.from('attendance_log').update(updateData).eq('id', targetId);
                    if (r2.error) throw r2.error;
                } else {
                    var insertPayload = _cleanAttendancePayload(task.payload);
                    var r2i = await db.from('attendance_log').insert([insertPayload]).select('id').single();
                    if (r2i.error) throw r2i.error;
                    targetId = r2i.data && r2i.data.id;
                }
                if (loIdx2 >= 0) {
                    loList2[loIdx2].synced = true;
                    if (targetId) loList2[loIdx2].id = targetId;
                    if (task.payload.check_out_time) loList2[loIdx2].check_out_time = task.payload.check_out_time;
                    if (task.payload.duration_minutes) loList2[loIdx2].duration_minutes = task.payload.duration_minutes;
                    _saveAttendanceList(loList2);
                }
            } else if (task.type === 'progress_photo') {
                var r3 = await db.from('progress_photos').insert([task.payload]);
                if (r3.error) throw r3.error;
            } else if (task.type === 'share_workout' || task.type === 'create_workout') {
                var workoutPayload = task.payload || {};
                var workoutName = (workoutPayload.name || '').trim();
                var creatorId = workoutPayload.created_by || workoutPayload.user_id || null;
                if (workoutName && creatorId) {
                    var existingWorkout = await db.from('workouts').select('id').eq('name', workoutName).eq('created_by', creatorId).maybeSingle();
                    if (existingWorkout && existingWorkout.data) { successCount++; continue; }
                }
                var r4 = await db.from('workouts').insert([workoutPayload]);
                if (r4.error) throw r4.error;
            } else if (task.type === 'weight_log' || task.type === 'health_log') {
                var r5 = await db.from('health_log').insert([task.payload]);
                if (r5.error) throw r5.error;
            } else if (task.type === 'delete_weight_log') {
                var r6 = await db.from('health_log').delete().eq('user_id', task.payload.user_id).eq('date', task.payload.date).eq('weight', task.payload.weight);
                if (r6.error) throw r6.error;
            } else if (task.type === 'workout_complete') {
                var p = task.payload;
                if (!p.user_id || !p.date || !p.type) {
                    p.user_id = p.user_id || (currentUser ? currentUser.id : null);
                    p.date = (p.timestamp || new Date().toISOString()).split('T')[0];
                    p.type = 'workout_complete';
                    p.value = p.value || { workoutId: p.workoutId, dayId: p.dayId, exerciseIndex: p.exerciseIndex };
                    delete p.workoutId; delete p.dayId; delete p.exerciseIndex; delete p.timestamp;
                }
                if (!p.user_id) { remainingTasks.push(task); continue; }
                var r7 = await db.from('user_progress').insert([p]);
                if (r7.error) throw r7.error;
            } else if (task.type === 'profile_update') {
                var puId = task.payload.id;
                var puData = {};
                if (task.payload.name) puData.name = task.payload.name;
                if (task.payload.gender) puData.gender = task.payload.gender;
                if (task.payload.password) puData.password = task.payload.password;
                if (Object.keys(puData).length === 0) { successCount++; continue; }
                var targetId = (puId && !/^[0-9a-f]{8}-/i.test(String(puId))) ? puId : (currentUser ? currentUser.id : null);
                if (!targetId) { remainingTasks.push(task); continue; }
                var r8 = await db.from('users').update(puData).eq('id', targetId);
                if (r8.error) throw r8.error;
            } else if (task.type === 'workout_rating') {
                var r9 = await db.from('workout_ratings').insert([task.payload]);
                if (r9.error) throw r9.error;
            } else if (task.type === 'add_exercise') {
                var exPayload = task.payload || {};
                var exName = (exPayload.name_ar || exPayload.name || '').trim();
                if (exName && exPayload.created_by) {
                    var existingEx = await db.from('exercises').select('id').eq('name_ar', exName).eq('created_by', exPayload.created_by).maybeSingle();
                    if (existingEx && existingEx.data) { successCount++; continue; }
                }
                var exRes = await db.from('exercises').insert([exPayload]);
                if (exRes.error) throw exRes.error;
            } else if (task.type === 'send_notification') {
                var notifPayload = task.payload || {};
                if (notifPayload.user_id && notifPayload.title) {
                    var notifExists = await db.from('notifications').select('id').eq('user_id', notifPayload.user_id).eq('title', notifPayload.title).eq('body', notifPayload.body || '').maybeSingle();
                    if (notifExists && notifExists.data) { successCount++; continue; }
                }
                var notifRes = await db.from('notifications').insert([notifPayload]);
                if (notifRes.error) throw notifRes.error;
            } else if (task.type === 'update_settings') {
                var setRes = await db.from('settings').update({ value: task.payload.value }).eq('key', task.payload.key);
                if (setRes.error) throw setRes.error;
            } else if (task.type === 'upsert_subscription') {
                var subPayload = task.payload || {};
                var existingSub = subPayload.id ? await db.from('subscription_types').select('id').eq('id', subPayload.id).maybeSingle() : { data: null };
                if (existingSub && existingSub.data) {
                    var subUp = await db.from('subscription_types').update(subPayload).eq('id', subPayload.id);
                    if (subUp.error) throw subUp.error;
                } else {
                    var subIns = await db.from('subscription_types').insert([subPayload]);
                    if (subIns.error) throw subIns.error;
                }
            }
            successCount++;
        } catch (err) {
            console.error('[Sync] Task failed: ' + task.type, err);
            if (err && (err.code === '23505' || (err.message && err.message.indexOf('duplicate key') !== -1))) {
                successCount++; continue;
            }
            task.retries = (task.retries || 0) + 1;
            if (task.retries <= 5) remainingTasks.push(task);
        }
    }

    await saveSyncQueue(remainingTasks);
    updateSyncBadge();

    if (successCount > 0) {
        updateSyncTimestamp();
        var remainingMsg = remainingTasks.length > 0 ? __('pendingRemaining', { n: remainingTasks.length }) : '';
        showToast(__('syncCompleted', { n: successCount, m: remainingMsg }));
    }

    return remainingTasks.length === 0;
}

// ==================== NEW FEATURES v5.0: Tracking, Challenges, Achievements, Calendar, Library ====================

// ==================== Weight Tracking ====================
const TRACKING_KEY = 'katfast_weight_log';
function getWeightLog() {
  return JSON.parse(localStorage.getItem(TRACKING_KEY) || '[]');
}
function saveWeightLog(log) {
  localStorage.setItem(TRACKING_KEY, JSON.stringify(log));
}
window.logWeight = function() {
  const input = document.getElementById('weightInput');
  const kg = parseFloat(input.value);
  if (!kg || kg <= 0) { showToast('❌ ' + __('enterValidWeight'), 'error'); return; }
  const today = new Date().toISOString().split('T')[0];
  const log = getWeightLog();
  log.push({ date: today, weight: kg, id: Date.now() });
  saveWeightLog(log);
  input.value = '';
  if (!currentUser) { showToast('❌ ' + __('loginRequired'), 'error'); return; }
  pushToSyncQueue('weight_log', { user_id: currentUser?.id, date: today, weight: kg });
  showToast('✅ ' + __('weightLogged') + ' ' + kg + ' ' + __('kg'));
  renderWeightChart();
};
window.deleteWeightEntry = function(id) {
  if (!confirm(__('deleteConfirm'))) return;
  var targetId = Number(id);
  var allLog = getWeightLog();
  var deletedEntry = allLog.find(function(e) { return Number(e.id) === targetId; });
  var log = allLog.filter(function(e) { return Number(e.id) !== targetId; });
  saveWeightLog(log);
  if (deletedEntry && currentUser?.id) {
    pushToSyncQueue('delete_weight_log', { user_id: currentUser.id, date: deletedEntry.date, weight: deletedEntry.weight, id: targetId });
  }
  renderWeightChart();
  showToast('✅ ' + __('deleted'));
};
function renderWeightChart() {
  const log = getWeightLog();
  // Render history list
  var histEl = document.getElementById('weightHistoryList');
  if (histEl) {
    if (log.length === 0) {
      histEl.innerHTML = '<p style="opacity:0.5;text-align:center;">' + __('noPreviousData') + '</p>';
    } else {
      histEl.innerHTML = log.slice().reverse().map(function(e) {
        var dateStr = e.date ? e.date.slice(0,10) : '—';
        return '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border-bottom:1px solid var(--line);">' +
          '<span>' + dateStr + '</span>' +
          '<span style="font-weight:700;color:var(--gold);">' + e.weight + ' ' + __('kg') + '</span>' +
          '<button onclick="deleteWeightEntry(\'' + e.id + '\')" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:12px;padding:2px 6px;"><i class="fas fa-trash"></i></button>' +
          '</div>';
      }).join('');
    }
  }
  // Render chart
  const recent = log.slice(-30);
  if (recent.length < 2) {
    const canvas = document.getElementById('weightChart');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const w = canvas.parentElement.clientWidth;
      canvas.width = w * 2; canvas.height = 200 * 2;
      canvas.style.width = w + 'px'; canvas.style.height = '200px';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '24px Cairo';
      ctx.textAlign = 'center';
      ctx.fillText(__('chartNoData'), canvas.width/2, canvas.height/2);
    }
    return;
  }
  drawLineChart('weightChart', recent.map(e => ({ label: e.date.slice(5), value: e.weight })), __('chartWeightLabel'), '#fbbf24');
}
function drawLineChart(canvasId, data, label, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const parent = canvas.parentElement;
  const w = parent.clientWidth;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr; canvas.height = 200 * dpr;
  canvas.style.width = w + 'px'; canvas.style.height = '200px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const W = w, H = 200;
  const pad = { top: 20, bottom: 30, left: 50, right: 20 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  ctx.clearRect(0, 0, W, H);
  if (!data || data.length < 2) {
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '16px Cairo';
    ctx.textAlign = 'center';
    ctx.fillText(__('chartInsufficientData'), W/2, H/2);
    return;
  }
  const vals = data.map(d => d.value);
  const min = Math.min(...vals) * 0.95;
  const max = Math.max(...vals) * 1.05;
  const range = max - min || 1;
  const xs = data.map((_, i) => pad.left + (i / (data.length - 1)) * chartW);
  const ys = data.map(d => pad.top + chartH - ((d.value - min) / range) * chartH);
  // grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (i / 4) * chartH;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '10px Cairo';
    ctx.textAlign = 'right';
    ctx.fillText((max - (i / 4) * range).toFixed(1), pad.left - 8, y + 4);
  }
  // line
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.moveTo(xs[0], ys[0]);
  for (let i = 1; i < xs.length; i++) {
    ctx.lineTo(xs[i], ys[i]);
  }
  ctx.stroke();
  // fill
  ctx.beginPath();
  ctx.moveTo(xs[0], pad.top + chartH);
  for (let i = 0; i < xs.length; i++) {
    ctx.lineTo(xs[i], ys[i]);
  }
  ctx.lineTo(xs[xs.length - 1], pad.top + chartH);
  ctx.closePath();
  ctx.fillStyle = color + '20';
  ctx.fill();
  // dots
  for (let i = 0; i < xs.length; i++) {
    ctx.beginPath();
    ctx.arc(xs[i], ys[i], 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
  // labels
  const labelInterval = Math.max(1, Math.floor(data.length / 8));
  for (let i = 0; i < data.length; i += labelInterval) {
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '9px Cairo';
    ctx.textAlign = 'center';
    ctx.fillText(data[i].label, xs[i], H - 8);
  }
}

// ==================== Workout Tracking ====================
const WORKOUT_LOG_KEY = 'katfast_workout_log';
function getWorkoutLog() {
  return JSON.parse(localStorage.getItem(WORKOUT_LOG_KEY) || '[]');
}
function saveWorkoutLog(log) {
  localStorage.setItem(WORKOUT_LOG_KEY, JSON.stringify(log));
}
window.logReps = function(exerciseName, sets, reps, weight) {
  const log = getWorkoutLog();
  log.push({
    date: new Date().toISOString().split('T')[0],
    exercise: exerciseName,
    sets: sets,
    reps: reps,
    weight: weight,
    timestamp: new Date().toISOString()
  });
  saveWorkoutLog(log);
};
function getTodayWorkouts() {
  const today = new Date().toISOString().split('T')[0];
  return getWorkoutLog().filter(e => e.date === today);
}
function renderTodayWorkouts() {
  const container = document.getElementById('todayWorkoutsList');
  if (!container) return;
  const todayLogs = getTodayWorkouts();
  if (todayLogs.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-dumbbell"></i><p>' + __('noTodayWorkouts') + '</p></div>';
    return;
  }
  container.innerHTML = '<div class="list-group">' + todayLogs.map((e, i) =>
    '<div class="list-group-item" style="cursor:default">' +
      '<span class="badge badge-gold" style="min-width:32px;text-align:center;justify-content:center">' + (i + 1) + '</span>' +
      '<div style="flex:1"><strong>' + e.exercise + '</strong><br><span style="font-size:11px;color:var(--ink-3)">' + e.sets + '×' + e.reps + (e.weight > 0 ? ' @ ' + e.weight + ' ' + __('kg') : '') + '</span></div>' +
    '</div>'
  ).join('') + '</div>';
}
window.showLogWorkoutModal = function() {
  document.getElementById('logWorkoutModal').classList.add('active');
};
window.submitWorkoutLog = function() {
  const name = document.getElementById('logExName').value.trim();
  const sets = parseInt(document.getElementById('logExSets').value) || 3;
  const reps = parseInt(document.getElementById('logExReps').value) || 10;
  const weight = parseFloat(document.getElementById('logExWeight').value) || 0;
  if (!name) { showToast(__('enterExerciseName'), 'error'); return; }
  logReps(name, sets, reps, weight);
  document.getElementById('logExName').value = '';
  document.getElementById('logExSets').value = '3';
  document.getElementById('logExReps').value = '10';
  document.getElementById('logExWeight').value = '0';
  document.getElementById('logWorkoutModal').classList.remove('active');
  showToast(__('exerciseLogged', { name: name, sets: sets, reps: reps }));
  renderTodayWorkouts();
};

// ==================== Daily & Weekly Challenges ====================
const CHALLENGE_STORAGE_KEY = 'katfast_challenge';
const WEEKLY_CHALLENGES = [
  { title: __('achieve1Title'), desc: __('achieve1Desc'), icon: '💪' },
  { title: __('achieve2Title'), desc: __('achieve2Desc'), icon: '🚶' },
  { title: __('achieve3Title'), desc: __('achieve3Desc'), icon: '🧘' },
  { title: __('achieve4Title'), desc: __('achieve4Desc'), icon: '🏋️' },
  { title: __('achieve5Title'), desc: __('achieve5Desc'), icon: '📅' },
  { title: __('achieve6Title'), desc: __('achieve6Desc'), icon: '💧' },
  { title: __('achieve7Title'), desc: __('achieve7Desc'), icon: '🆕' },
  { title: __('achieve8Title'), desc: __('achieve8Desc'), icon: '🧎' },
];
function loadChallenge() {
  const today = new Date().toISOString().split('T')[0];
  const saved = JSON.parse(localStorage.getItem(CHALLENGE_STORAGE_KEY) || '{}');
  if (appSettings.daily_challenge && appSettings.daily_challenge.title && appSettings.daily_challenge.date === today) {
    const adminChallenge = appSettings.daily_challenge;
    if (saved.date === today) return { title: adminChallenge.title, desc: adminChallenge.desc || __('challengeOfDay'), completed: saved.completed };
    return { title: adminChallenge.title, desc: adminChallenge.desc || __('challengeOfDay'), completed: false };
  }
  const challenges = [
    { title: __('challenge1Title'), desc: __('challenge1Desc') },
    { title: __('challenge2Title'), desc: __('challenge2Desc') },
    { title: __('challenge3Title'), desc: __('challenge3Desc') },
    { title: __('challenge4Title'), desc: __('challenge4Desc') },
    { title: __('challenge5Title'), desc: __('challenge5Desc') },
    { title: __('challenge6Title'), desc: __('challenge6Desc') },
    { title: __('challenge7Title'), desc: __('challenge7Desc') }
  ];
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const challenge = challenges[dayOfYear % challenges.length];
  if (saved.date === today) {
    return { ...challenge, completed: saved.completed };
  }
  return { ...challenge, completed: false };
}
function renderChallenge() {
  const challenge = loadChallenge();
  const titleEl = document.getElementById('challengeTitle');
  const descEl = document.getElementById('challengeDesc');
  const btnEl = document.getElementById('completeChallengeBtn');
  const doneEl = document.getElementById('challengeCompletedMsg');
  if (titleEl) titleEl.textContent = challenge.title;
  if (descEl) descEl.textContent = challenge.desc;
  if (challenge.completed) {
    if (btnEl) btnEl.style.display = 'none';
    if (doneEl) doneEl.style.display = 'block';
  } else {
    if (btnEl) btnEl.style.display = '';
    if (doneEl) doneEl.style.display = 'none';
  }
  // Weekly challenges
  renderWeeklyChallenges();
  // Leaderboard
  renderLeaderboard();
}

// ==================== Leaderboard ====================
async function renderLeaderboard() {
  const list = document.getElementById('leaderboardList');
  if (!list) return;
  list.innerHTML = '<div style="text-align:center;padding:16px;"><i class="fas fa-spinner fa-spin"></i> ' + __('loading') + '</div>';
  try {
    // Local completions (this user)
    const localCompletions = [];
    for (let i = 0; i < 52; i++) {
      const w = JSON.parse(localStorage.getItem('katfast_weekly_' + i) || '{}');
      if (w.completed) localCompletions.push({ week: i, completed_at: w.completed_at || '' });
    }
    const todayKey = 'katfast_challenge_' + new Date().toDateString();
    const todayDone = localStorage.getItem(todayKey) === 'true';
    if (todayDone) localCompletions.push({ week: -1, completed_at: new Date().toISOString() });

    const myCount = localCompletions.length;
    let leaderData = [];
    // Try to fetch remote completions
    if (navigator.onLine && db) {
      try {
        const { data: users } = await db.from('users').select('id,name');
        const { data: completions } = await db.from('challenge_completions').select('*');
        if (users && completions) {
          const countMap = {};
          completions.forEach(c => {
            const uid = String(c.user_id);
            countMap[uid] = (countMap[uid] || 0) + 1;
          });
          leaderData = Object.entries(countMap)
            .map(([uid, count]) => {
              const u = users.find(x => String(x.id) === uid);
              return { name: u?.name || __('userLabel') + ' #' + uid, count };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        }
      } catch (_) { console.warn('[SWALLOWED]', _.message || _); }
    }
    // Add current user if not in list
    if (currentUser && myCount > 0 && !leaderData.some(l => l.name === currentUser.name)) {
      leaderData.push({ name: currentUser.name + ' (' + __('youLabel') + ')', count: myCount });
      leaderData.sort((a, b) => b.count - a.count);
    }
    if (leaderData.length === 0) {
      list.innerHTML = '<div style="text-align:center;padding:20px;opacity:0.5;font-size:13px;">' + __('noLeaderboardData') + '</div>';
      return;
    }
    const medals = ['🥇', '🥈', '🥉'];
    list.innerHTML = '<div style="display:flex;flex-direction:column;gap:4px;">' +
      leaderData.map((l, i) => `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:${i < 3 ? 'rgba(251,191,36,0.06)' : 'rgba(255,255,255,0.02)'};border-radius:8px;border:${i < 3 ? '1px solid rgba(251,191,36,0.15)' : '1px solid transparent'};">
        <span><span style="font-size:14px;margin-inline-end:6px;">${medals[i] || (i+1)}</span> <strong>${l.name}</strong></span>
        <span style="font-size:12px;color:var(--primary);font-weight:700;">` + __('challengesCount', { n: l.count }) + `</span>
      </div>`).join('') + '</div>';
  } catch (err) {
    list.innerHTML = '<div style="text-align:center;padding:20px;opacity:0.5;">' + __('errorPrefix') + err.message + '</div>';
  }
}
function renderWeeklyChallenges() {
  const list = document.getElementById('weeklyChallengesList');
  if (!list) return;
  const weekNumber = Math.abs(Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 1)) / 604800000)) % WEEKLY_CHALLENGES.length;
  const weekChallenge = WEEKLY_CHALLENGES[weekNumber];
  const weekKey = 'katfast_weekly_' + weekNumber;
  const weekSaved = JSON.parse(localStorage.getItem(weekKey) || '{}');
  const completed = weekSaved.completed || false;
  list.innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;padding:14px;background:rgba(251,191,36,0.06);border-radius:12px;border:1px solid rgba(251,191,36,0.12);">
      <div style="font-size:28px;">${weekChallenge.icon}</div>
      <div style="flex:1;">
        <div style="font-weight:700;font-size:14px;">${weekChallenge.title}</div>
        <div style="font-size:12px;opacity:0.6;">${weekChallenge.desc}</div>
      </div>
      ${completed ? '<div style="color:#4ade80;font-size:20px;"><i class="fas fa-check-circle"></i></div>' :
        '<button class="btn-premium btn-gold btn-small" onclick="completeWeeklyChallenge(' + weekNumber + ')" style="padding:6px 14px;font-size:11px;"><i class="fas fa-check"></i> ' + __('complete') + '</button>'}
    </div>
  `;
}
window.completeWeeklyChallenge = function(weekNum) {
  localStorage.setItem('katfast_weekly_' + weekNum, JSON.stringify({ completed: true, date: new Date().toISOString().split('T')[0] }));
  renderWeeklyChallenges();
  showToast(__('weeklyChallengeComplete'));
  renderAchievements();
};
window.completeChallenge = function() {
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem(CHALLENGE_STORAGE_KEY, JSON.stringify({ date: today, completed: true }));
  renderChallenge();
  showToast(__('dailyChallengeComplete'));
  renderAchievements();
};

// ==================== Achievements ====================
const ACHIEVEMENTS = [
  { id: 'first_workout', name: __('achFirstWorkout'), desc: __('achFirstWorkoutDesc'), icon: '💪', check: () => getWorkoutLog().length >= 1 },
  { id: 'seven_day_streak', name: __('achSevenDayStreak'), desc: __('achSevenDayStreakDesc'), icon: '🔥', check: () => { const days = [...new Set(getWorkoutLog().map(e => e.date))].sort(); if (days.length < 7) return false; let streak = 1; for (let i = 1; i < days.length; i++) { const diff = (new Date(days[i]) - new Date(days[i-1])) / 86400000; if (diff === 1) streak++; else streak = 1; if (streak >= 7) return true; } return false; } },
  { id: 'photo_pro', name: __('achPhotoPro'), desc: __('achPhotoProDesc'), icon: '📸', check: () => { const photos = JSON.parse(localStorage.getItem('katfast_photos') || '[]'); return photos.length >= 3; } },
  { id: 'weight_logger', name: __('achWeightLogger'), desc: __('achWeightLoggerDesc'), icon: '⚖️', check: () => getWeightLog().length >= 5 },
  { id: 'challenge_master', name: __('achChallengeMaster'), desc: __('achChallengeMasterDesc'), icon: '🏆', check: () => { const saved = JSON.parse(localStorage.getItem(CHALLENGE_STORAGE_KEY) || '{}'); return saved.completed === true; } },
  { id: 'ten_workouts', name: __('achTenWorkouts'), desc: __('achTenWorkoutsDesc'), icon: '🎯', check: () => getWorkoutLog().length >= 10 },
  { id: 'weekly_hero', name: __('achWeeklyHero'), desc: __('achWeeklyHeroDesc'), icon: '🗓️', check: () => { for (let i = 0; i < 10; i++) { const w = JSON.parse(localStorage.getItem('katfast_weekly_' + i) || '{}'); if (w.completed) return true; } return false; } }
];

function renderAchievements() {
    var achievementsContainer = document.getElementById('achievementsContainer');
    if (!achievementsContainer) return;
    var html = '';
    ACHIEVEMENTS.forEach(function(a) {
        var unlocked = a.check();
        html += '<div style="display:flex;align-items:center;gap:12px;padding:10px;background:' + (unlocked ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.03)') + ';border-radius:10px;border:1px solid ' + (unlocked ? 'rgba(74,222,128,0.15)' : 'var(--line)') + ';">' +
            '<div style="font-size:24px;width:36px;text-align:center;">' + (unlocked ? a.icon : '🔒') + '</div>' +
            '<div style="flex:1;"><div style="font-weight:700;font-size:13px;">' + a.name + '</div><div style="font-size:11px;opacity:0.5;">' + a.desc + '</div></div>' +
            (unlocked ? '<div style="color:#4ade80;font-size:16px;"><i class="fas fa-check-circle"></i></div>' : '') +
        '</div>';
    });
    achievementsContainer.innerHTML = html;
}

// ==================== Init all new features after login ====================
const _origShowApp = showApp;
showApp = function() {
  _origShowApp.apply(this, arguments);
  setTimeout(() => {
    renderWeightChart();
    renderTodayWorkouts();
    renderChallenge();
    pushLocalReminder();
  }, 100);
};

function pushLocalReminder() {
    if (!currentUser) return;
    const today = new Date().toISOString().split('T')[0];
    const reminderKey = 'katfast_reminder_' + today;
    if (localStorage.getItem(reminderKey)) return;
    
    const log = JSON.parse(localStorage.getItem('katfast_workout_log') || '[]');
    if (log.some(e => e.date === today)) return;
    
    const hour = new Date().getHours();
    if (hour >= 18) { // After 6 PM
        const newNotif = {
            id: Date.now(),
            user_id: currentUser.id,
            title: __('reminderTitle'),
            body: __('reminderBody'),
            icon: '🔥',
            read: false,
            created_at: new Date().toISOString()
        };
        let cached = JSON.parse(localStorage.getItem('katfast_notif_cache') || '[]');
        cached.unshift(newNotif);
        localStorage.setItem('katfast_notif_cache', JSON.stringify(cached));
        localStorage.setItem(reminderKey, 'true');
        
        if (typeof loadUserNotifications === 'function') {
            loadUserNotifications();
        }
    }
}

// ==================== Local Backup & Restore ====================
window.exportLocalData = function() {
    showToast('⚠️ ' + __('featureDisabled'), 'error');
};

window.importLocalData = function() {
    showToast('⚠️ ' + __('featureDisabled'), 'error');
};

// ==================== Workout Journal ====================
window.showFullWorkoutJournal = function() {
    const list = document.getElementById('workoutJournalList');
    if (!list) return;
    const log = JSON.parse(localStorage.getItem('katfast_workout_log') || '[]');
    if (log.length === 0) {
        list.innerHTML = '<div class="empty-state" style="padding:40px;text-align:center;opacity:0.5;"><i class="fas fa-history" style="font-size:40px;margin-bottom:10px;"></i><p>' + __('noJournalData') + '</p></div>';
    } else {
        const sorted = [...log].sort((a,b) => new Date(b.date) - new Date(a.date));
        let html = '';
        let currentMonth = '';
        sorted.forEach(item => {
            const d = new Date(item.date);
            const monthStr = d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' });
            if (monthStr !== currentMonth) {
                html += `<div style="font-size:12px;opacity:0.5;margin-top:10px;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:4px;">${monthStr}</div>`;
                currentMonth = monthStr;
            }
            html += `
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:12px;display:flex;align-items:center;gap:12px;">
                <div style="width:40px;height:40px;border-radius:10px;background:rgba(255,215,0,0.1);display:flex;align-items:center;justify-content:center;color:#FFD700;font-size:16px;flex-shrink:0;">
                    <i class="fas fa-dumbbell"></i>
                </div>
                <div style="flex:1;">
                    <div style="font-weight:700;font-size:14px;">${item.exercise || item.name || __('unknownExercise')}</div>
                    <div style="font-size:12px;opacity:0.6;margin-top:4px;">
                        ${item.sets} ${__('journalSets')} × ${item.reps} ${__('journalReps')} ${item.weight ? ' | ' + item.weight + __('journalKg') : ''}
                    </div>
                </div>
                <div style="font-size:10px;opacity:0.4;text-align:left;">
                    ${d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
                </div>
            </div>`;
        });
        list.innerHTML = html;
    }
    var journalModal = document.getElementById('workoutJournalModal');
    if (journalModal) journalModal.style.display = 'flex';
};

// ==================== Swipe Gestures Navigation ====================
(function() {
    let touchstartX = 0;
    let touchstartY = 0;
    let touchendX = 0;
    let touchendY = 0;
    
    const pagesOrder = ['home', 'schedules', 'progress', 'tracking', 'challenges', 'profile', 'about'];
    
    function handleGesture() {
        // Only swipe if no modal is active
        const activeModals = document.querySelectorAll('.modal-overlay.active, .modal-overlay[style*="display: flex"], .modal-overlay[style*="display: block"]');
        if (activeModals.length > 0) return;
        
        const deltaX = touchendX - touchstartX;
        const deltaY = touchendY - touchstartY;
        
        // Ensure horizontal swipe is dominant and above threshold (e.g. 100px)
        if (Math.abs(deltaX) > 100 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
            const currentPage = document.querySelector('.page.active');
            if (!currentPage) return;
            const pageId = currentPage.id.replace('Page', '');
            const currentIndex = pagesOrder.indexOf(pageId);
            if (currentIndex === -1) return;
            
            const isRTL = document.documentElement.dir === 'rtl';
            
            let newIndex = currentIndex;
            if (deltaX > 0) {
                // Swipe Right
                newIndex = isRTL ? currentIndex + 1 : currentIndex - 1;
            } else {
                // Swipe Left
                newIndex = isRTL ? currentIndex - 1 : currentIndex + 1;
            }
            
            if (newIndex >= 0 && newIndex < pagesOrder.length) {
                navigateTo(pagesOrder[newIndex]);
            }
        }
    }
    
    document.addEventListener('touchstart', e => {
        if (e.target.closest('input, textarea, select, canvas, button, a, .chart-container, #weightChart')) return;
        touchstartX = e.changedTouches[0].screenX;
        touchstartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    document.addEventListener('touchend', e => {
        if (e.target.closest('input, textarea, select, canvas, button, a, .chart-container, #weightChart')) return;
        touchendX = e.changedTouches[0].screenX;
        touchendY = e.changedTouches[0].screenY;
        handleGesture();
    }, { passive: true });
})();

// ==================== Developer Control Panel (User App) ====================
window._offlineOverride = null;
window._devPanelInterval = null;

window.toggleOfflineSimulation = function() {
    if (window._offlineOverride) {
        window._offlineOverride = null;
        var ind = document.getElementById('offlineSimIndicator');
        if (ind) ind.textContent = '🟢 Online';
        var btn = document.getElementById('offlineSimBtn');
        if (btn) btn.innerHTML = '<i class="fas fa-wifi"></i> Simulate Offline';
        showToast('🌐 Network restored to real status', 'success');
        if (navigator.onLine) processSyncQueue();
    } else {
        window._offlineOverride = 'offline';
        var ind = document.getElementById('offlineSimIndicator');
        if (ind) ind.textContent = '🔴 OFFLINE (SIM)';
        var btn = document.getElementById('offlineSimBtn');
        if (btn) btn.innerHTML = '<i class="fas fa-wifi"></i> Restore Online';
        showToast('📡 Offline mode simulated', 'success');
    }
};

window.renderSyncMonitor = function() {
    var container = document.getElementById('syncMonitorContainer');
    if (!container) return;
    var queue = getSyncQueue();
    if (!queue || queue.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:30px;opacity:0.5;font-size:13px;"><i class="fas fa-check-circle" style="font-size:32px;display:block;margin-bottom:10px;color:#00FF41;"></i> Queue Empty — All Synced</div>';
        return;
    }
    var html = '<div style="font-size:11px;color:rgba(0,212,255,0.5);margin-bottom:8px;">' + queue.length + ' pending tasks</div>';
    queue.slice().reverse().forEach(function(item) {
        var c = item._syncing ? '#FFD700' : (item._error ? '#FF2D95' : 'rgba(0,255,65,0.4)');
        var ic = item._syncing ? '🔄' : (item._error ? '❌' : '⏳');
        html += '<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:rgba(0,255,65,0.02);border-radius:8px;border:1px solid rgba(0,212,255,0.06);margin-bottom:4px;font-size:12px;font-family:\'Courier New\',monospace;">' +
            '<span style="color:' + c + ';">' + ic + '</span>' +
            '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#e2e8f0;">' + (item.type || 'task') + '</span>' +
            '<span style="font-size:10px;color:rgba(0,212,255,0.4);">' + (item.id ? item.id.substr(0, 12) : '') + '</span></div>';
    });
    container.innerHTML = html;
};

window.renderDevLogs = function() {
    var container = document.getElementById('devLogsContainer');
    if (!container) return;
    if (_devLogs.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:30px;opacity:0.5;font-size:13px;"><i class="fas fa-terminal" style="font-size:32px;display:block;margin-bottom:10px;color:#00D4FF;"></i> No captured logs yet</div>';
        return;
    }
    var html = _devLogs.slice().reverse().map(function(log) {
        var c = log.args.includes('[SWALLOWED]') ? '#FFD700' : (log.args.includes('error') || log.args.includes('Error') ? '#FF2D95' : '#e2e8f0');
        return '<div style="font-size:11px;font-family:\'Courier New\',monospace;padding:6px 10px;border-bottom:1px solid rgba(0,212,255,0.04);color:' + c + ';">' +
            '<span style="color:rgba(0,212,255,0.3);">' + log.ts.substr(11, 8) + '</span> ' +
            '<span>' + log.args + '</span></div>';
    }).join('');
    container.innerHTML = html;
};

window.startDevPanelRefresh = function() {
    window._devPanelInterval && clearInterval(window._devPanelInterval);
    window._devPanelInterval = setInterval(function() {
        window.renderSyncMonitor();
        window.renderDevLogs();
    }, 2000);
};

window.injectUserDevPanel = function() {
    if (document.getElementById('user-dev-panel')) return;
    var panel = document.createElement('div');
    panel.id = 'user-dev-panel';
    panel.className = 'dev-panel';
    panel.style.cssText = 'display:none;padding:20px;margin-top:16px;';
    panel.innerHTML = `
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px;border-bottom:1px solid rgba(0,212,255,0.08);padding-bottom:14px;">
            <div style="font-size:28px;">🛸</div>
            <div style="flex:1;">
                <h3 style="margin:0;font-size:16px;">DEV CONTROL ROOM</h3>
                <div style="font-size:10px;color:rgba(0,212,255,0.4);font-family:'Courier New',monospace;">DEVELOPER MODE // HIDDEN PANEL</div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;">
                <span id="offlineSimIndicator" style="font-size:10px;font-family:'Courier New',monospace;">🟢 Online</span>
                <button onclick="toggleOfflineSimulation()" id="offlineSimBtn" style="padding:4px 10px;font-size:9px;background:rgba(0,212,255,0.08);border:1px solid rgba(0,212,255,0.15);border-radius:6px;color:#00D4FF;cursor:pointer;"><i class="fas fa-wifi"></i> Offline</button>
            </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div style="background:rgba(0,255,65,0.02);border:1px solid rgba(0,255,65,0.06);border-radius:12px;padding:14px;">
                <h4 style="font-size:11px;color:#00FF41;margin-bottom:10px;font-family:'Courier New',monospace;"><i class="fas fa-database"></i> SYNC QUEUE</h4>
                <div id="syncMonitorContainer" style="max-height:200px;overflow-y:auto;"></div>
            </div>
            <div style="background:rgba(0,212,255,0.02);border:1px solid rgba(0,212,255,0.06);border-radius:12px;padding:14px;">
                <h4 style="font-size:11px;color:#00D4FF;margin-bottom:10px;font-family:'Courier New',monospace;"><i class="fas fa-terminal"></i> SYSTEM LOGS</h4>
                <button onclick="_devLogs = []; renderDevLogs();" style="padding:3px 8px;font-size:9px;background:rgba(255,45,149,0.1);border:1px solid rgba(255,45,149,0.15);border-radius:5px;color:#FF2D95;cursor:pointer;margin-bottom:6px;"><i class="fas fa-trash"></i> Clear</button>
                <div id="devLogsContainer" style="max-height:200px;overflow-y:auto;font-size:10px;"></div>
            </div>
        </div>
        <div style="margin-top:16px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">
            <div class="stat-box"><div class="stat-value" id="devStatOnline">${navigator.onLine ? '🟢' : '🔴'}</div><div style="font-size:9px;opacity:0.4;margin-top:2px;">Online</div></div>
            <div class="stat-box"><div class="stat-value" id="devStatQueue">0</div><div style="font-size:9px;opacity:0.4;margin-top:2px;">Queue</div></div>
            <div class="stat-box"><div class="stat-value" id="devStatLogs">0</div><div style="font-size:9px;opacity:0.4;margin-top:2px;">Logs</div></div>
            <div class="stat-box"><div class="stat-value">v7.0</div><div style="font-size:9px;opacity:0.4;margin-top:2px;">Version</div></div>
        </div>
    `;
    var profilePage = document.getElementById('profilePage');
    if (profilePage) profilePage.appendChild(panel);
    window.renderSyncMonitor();
    window.renderDevLogs();
    window.startDevPanelRefresh();
};

// Show dev panel for developer accounts (role_id === 0)
var _origShowApp2 = showApp;
showApp = function() {
    _origShowApp2.apply(this, arguments);
    if (currentUser && (currentUser.role_id === 0 || currentUser.role_id === 1)) {
        setTimeout(function() { injectUserDevPanel(); var p = document.getElementById('user-dev-panel'); if (p) p.style.display = 'block'; }, 500);
    }
};

// Refresh current page data without leaving it
window.refreshCurrentPageData = function () {
    var pages = ['home', 'schedules', 'progress', 'tracking', 'challenges', 'profile', 'about'];
    for (var i = 0; i < pages.length; i++) {
        var el = document.getElementById(pages[i] + 'Page');
        if (el && el.classList.contains('active')) {
            var p = pages[i];
            if (p === 'home') { updateUserUI(); fetchGymCode(); checkSubscription(); }
            if (p === 'schedules') { loadOfficialSchedules(); loadMySchedule(); }
            if (p === 'progress') loadProgressPhotos();
            if (p === 'tracking') { renderWeightChart(); renderTodayWorkouts(); }
            if (p === 'challenges') renderChallenge();
            if (p === 'profile') populateUserProfile();
            if (p === 'about') renderCaptainAboutPage();
            showToast(p === 'home' ? '🔄 تم التحديث' : '🔄 تم التحديث');
            return;
        }
    }
};

// Pull-to-refresh for user app (works on any page)
(function initUserPullToRefresh() {
    var startY = 0, pulling = false, pullEl = null;
    document.addEventListener('touchstart', function (e) {
        if (document.getElementById('loginPage')?.classList.contains('active')) return;
        var activePage = document.querySelector('.page.active');
        if (!activePage) return;
        if (activePage.scrollTop > 5) return;
        startY = e.touches[0].clientY;
        pulling = true;
    }, { passive: true });
    document.addEventListener('touchmove', function (e) {
        if (!pulling) return;
        var dy = e.touches[0].clientY - startY;
        if (dy > 0) {
            var activePage = document.querySelector('.page.active');
            if (activePage) {
                activePage.style.transition = 'none';
                activePage.style.transform = 'translateY(' + Math.min(dy * 0.3, 50) + 'px)';
                if (!pullEl) {
                    pullEl = document.createElement('div');
                    pullEl.id = 'userPullRefresh';
                    pullEl.style.cssText = 'text-align:center;padding:8px;font-size:12px;color:#00D4FF;font-weight:700;position:sticky;top:0;z-index:99;background:var(--u-bg);';
                    pullEl.innerHTML = '<i class="fas fa-arrow-down"></i> اسحب لتحديث';
                    activePage.parentNode.insertBefore(pullEl, activePage);
                }
                if (dy > 80) pullEl.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> أفلت للتحديث';
                else pullEl.innerHTML = '<i class="fas fa-arrow-down"></i> اسحب لتحديث';
            }
        }
    }, { passive: true });
    document.addEventListener('touchend', function (e) {
        if (!pulling) return;
        pulling = false;
        var dy = e.changedTouches[0].clientY - startY;
        var activePage = document.querySelector('.page.active');
        if (activePage) {
            activePage.style.transition = 'transform 0.25s ease';
            activePage.style.transform = 'translateY(0)';
        }
        if (pullEl) { pullEl.remove(); pullEl = null; }
        if (dy > 80) refreshCurrentPageData();
    }, { passive: true });
})();

// ==================== Auto-refresh system ====================
// Periodically refresh data when online, runs silently in background
var _autoRefreshTimer = null;
function setupAutoRefresh() {
    // Refresh immediately on connectivity restored
    window.addEventListener('online', function () {
        updateSyncBadge();
        processSyncQueue();
        loadOfficialSchedules();
        checkSubscription();
        loadUserNotifications();
    });
    window.addEventListener('offline', function () {
        updateSyncBadge();
    });

    // Periodic refresh every 30 seconds when online and app is focused
    if (_autoRefreshTimer) clearInterval(_autoRefreshTimer);
    _autoRefreshTimer = setInterval(function () {
        if (!navigator.onLine || !db || !currentUser) return;
        var activePage = document.querySelector('.page.active');
        if (!activePage) return;
        var id = activePage.id || '';
        if (id === 'homePage') { loadOfficialSchedules(); fetchGymCode(); checkSubscription(); loadUserNotifications(); }
        if (id === 'schedulesPage') loadOfficialSchedules();
        if (id === 'trackingPage') { renderWeightChart(); renderTodayWorkouts(); }
        if (id === 'challengesPage') renderChallenge();
        if (id === 'progressPage') loadProgressPhotos();
    }, 30000);

    // Also sync and refresh when page becomes visible again (user returns from another app)
    document.addEventListener('visibilitychange', function () {
        if (!document.hidden && navigator.onLine && currentUser) {
            loadOfficialSchedules();
            checkSubscription();
            loadUserNotifications();
        }
    });
}

// Override navigator.onLine for simulation (only if property is configurable)
try {
    var _origOnLineDesc = Object.getOwnPropertyDescriptor(navigator, 'onLine');
    if (_origOnLineDesc && _origOnLineDesc.configurable !== false) {
        Object.defineProperty(navigator, 'onLine', {
            get: function() { return window._offlineOverride === 'offline' ? false : _origOnLineDesc.get.call(navigator); },
            configurable: true
        });
    }
} catch (_) { /* offline sim not supported in this browser */ }
