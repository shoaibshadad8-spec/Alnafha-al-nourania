// Service worker: يخزّن كل ملفات الموقع محليًا عشان يشتغل بسرعة ومن غير نت تمامًا،
// وفي نفس الوقت يجيب أي تحديث جديد أول ما يبقى النت متاح.

const CACHE_VERSION = 'v2'; // غيّر الرقم ده مع كل تحديث كبير للملفات عشان يجبر تحديث الكاش
const CACHE_NAME = 'nafha-cache-' + CACHE_VERSION;

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/sections.json',
  '/manifest.json',
  '/assets/favicon.svg',
  '/assets/favicon-32.png',
  '/assets/apple-touch-icon.png',
  '/assets/icon-192.png',
  '/assets/icon-512.png'
];

// عند التثبيت: خزّن كل ملف على حدة، وما توقفش لو ملف واحد فشل
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(
        CORE_ASSETS.map((url) =>
          cache.add(url).catch((err) => console.warn('sw: failed to cache', url, err))
        )
      )
    )
  );
  self.skipWaiting();
});

// عند التفعيل: امسح أي نسخة كاش قديمة، وخد السيطرة على الصفحات المفتوحة فورًا
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// عند كل طلب: جرّب النت الأول (عشان يبقى محدّث)، ولو مفيش نت رجّع النسخة المحفوظة
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const req = event.request;

  event.respondWith(
    fetch(req)
      .then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(()=>{});
        }
        return response;
      })
      .catch(() =>
        caches.match(req).then((cached) => {
          if (cached) return cached;
          // لو طلب صفحة (تنقل) ومفيش نسخة محفوظة، رجّع الصفحة الرئيسية كبديل
          if (req.mode === 'navigate') return caches.match('/index.html');
          return Response.error();
        })
      )
  );
});
