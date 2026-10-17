# النفحة النورانية

موقع كتاب «النفحة النورانية في أوراد الطريقة الحامدية الخلوتية» — React + Vite.

## التشغيل
```bash
npm install
npm run dev       # للتطوير
npm run build     # يبني النسخة النهائية في dist/
npm run deploy    # ينشر dist/ على GitHub Pages
```
مجلد `dist/` المرفق جاهز: افتح `dist/index.html` بـ Live Server للمعاينة، أو ارفعه كما هو على أي استضافة.

## إضافة تسجيل صوتي لورد
1. ضع ملف الصوت (mp3) في `public/audio/`، مثل `public/audio/sahar.mp3`.
2. أضف سطرًا في `src/data/audio.json` — العنوان يكفي أن يكون بداية عنوان القسم (التشكيل لا يهم):
```json
[
  { "title": "ورد السحر", "src": "audio/sahar.mp3" },
  { "title": "سورة يس",  "src": "audio/yasin.mp3" }
]
```
3. شغّل `npm run build` من جديد. يظهر المشغّل تلقائيًا (سرعة ٠٫٧٥ / ١ / ١٫٢٥ وتكرار) وعلامة 🎙 في الفهرس. الأقسام التي ليس لها تسجيل تعرض «سيُضاف قريبًا».

## الهيكل
`src/pages/` الصفحات · `src/lib.jsx` التخزين والبحث العربي · `src/quote.js` بطاقة الاقتباس · `src/data/` النص والصوت · `public/` الأيقونات والصور والـ service worker.
