// ============================================================
//  النفحة النورانية — تطبيق React (بدون build: يشتغل مباشرة)
//  الملف مقسّم لأقسام: الإعدادات ← الأدوات ← الصفحات ← التشغيل
//  ملف vendor.js فيه مكتبة React نفسها، لا تعدّل عليه.
// ============================================================
import { React, useState, useEffect, useMemo, useRef, Fragment, createRoot, htm } from './vendor.js';

/* ============ التسجيلات الصوتية ============
   لإضافة تسجيل: ضع ملف mp3 في مجلد اسمه audio، ثم أضف سطرًا هنا.
   العنوان يكفي أن يكون بداية عنوان القسم (التشكيل لا يهم). مثال:
     { title: 'ورد السحر', src: 'audio/sahar.mp3' },
*/
const AUDIO = [
];


/* ============ الأدوات (تخزين، بحث عربي، أيقونات) ============ */

// html`<div>...</div>` = JSX بدون حاجة لـ build
const html = htm.bind(React.createElement);

/* ---------- تخزين محلي آمن ---------- */
const readJSON = (k, d = null) => {
  try { const s = localStorage.getItem(k); return s === null ? d : JSON.parse(s); } catch { return d; }
};
const writeJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* التخزين غير متاح */ } };

function useStored(key, init) {
  const [v, setV] = useState(() => readJSON(key, init));
  useEffect(() => writeJSON(key, v), [key, v]);
  return [v, setV];
}

const ar = (n) => Number(n).toLocaleString('ar-EG');

/* ---------- تطبيع النص العربي: يتجاهل التشكيل والتطويل وفروق الهمزات ---------- */
const DROP = /[\u0640\u064B-\u065F\u0670\u06D6-\u06ED]/;
const FOLD = { 'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ٱ': 'ا', 'ى': 'ي', 'ة': 'ه', 'ؤ': 'و', 'ئ': 'ي' };
function normMap(s) {
  let n = '';
  const map = [];
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (DROP.test(c)) continue;
    n += FOLD[c] || c;
    map.push(i); // موضع الحرف في النص الأصلي
  }
  return { n, map };
}
const norm = (s) => normMap(s).n;

function search(sections, q) {
  const nq = norm(q.trim());
  if (nq.length < 2) return null;
  const out = [];
  sections.forEach((s, i) => {
    const b = s.n.indexOf(nq);
    if (b < 0 && !s.nt.includes(nq)) return;
    let snip = null;
    if (b >= 0) {
      const a = s.map[b], e = s.map[b + nq.length - 1] + 1;
      const clean = (t) => t.replace(/\s+/g, ' ');
      snip = { pre: clean(s.text.slice(Math.max(0, a - 45), a)), hit: s.text.slice(a, e), post: clean(s.text.slice(e, e + 80)) };
    }
    out.push({ i, s, snip });
  });
  return out;
}

/* ---------- تحميل نص الكتاب مرة واحدة ---------- */
let cache = null, pending = null;
function loadBook() {
  pending ??= fetch('sections.json').then((r) => r.json())
    .then((d) => (cache = d.map((s) => ({ ...s, nt: norm(s.title), ...normMap(s.text) }))));
  return pending;
}
function useBook() {
  const [sections, setSections] = useState(cache);
  useEffect(() => { if (!cache) loadBook().then(setSections); }, []);
  return { sections };
}
const findIdx = (sections, key) => sections.findIndex((s) => s.nt.startsWith(norm(key)));
const Loading = () => html`<p className="empty">جارٍ تحميل نص الكتاب…</p>`;

/* ---------- الأيقونات ---------- */
const P = {
  home: html`<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />`,
  book: html`<${Fragment}><path d="M4 5.5c2.2-1 4.6-1.2 8 0v13c-3.4-1.2-5.8-1-8 0z" /><path d="M20 5.5c-2.2-1-4.6-1.2-8 0v13c3.4-1.2 5.8-1 8 0z" /><//>`,
  beads: html`<${Fragment}><circle cx="12" cy="4.5" r="1.8" /><circle cx="6" cy="9" r="1.8" /><circle cx="18" cy="9" r="1.8" /><circle cx="7.5" cy="16" r="1.8" /><circle cx="16.5" cy="16" r="1.8" /><circle cx="12" cy="20" r="1.8" /><//>`,
  info: html`<${Fragment}><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5M12 7.6h.01" /><//>`,
  search: html`<${Fragment}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /><//>`,
  star: html`<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8z" />`,
  share: html`<${Fragment}><circle cx="18" cy="6" r="2.4" /><circle cx="6" cy="12" r="2.4" /><circle cx="18" cy="18" r="2.4" /><path d="M8 10.8l8-3.6M8 13.2l8 3.6" /><//>`,
  mic: html`<${Fragment}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /><//>`,
  card: html`<${Fragment}><rect x="4" y="5" width="16" height="14" rx="2" /><path d="M8 10h8M8 14h5" /><//>`,
  back: html`<path d="M9 5l7 7-7 7" />`,
};
const Icon = ({ n, fill }) => html`
  <svg className="ic" viewBox="0 0 24 24" fill=${fill ? 'currentColor' : 'none'} stroke="currentColor"
    strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">${P[n]}</svg>`;

const Mark = () => html`
  <svg viewBox="0 0 32 32" fill="none" stroke="#d4af37" strokeWidth="1.8" aria-hidden="true">
    <rect x="9" y="9" width="14" height="14" /><rect x="9" y="9" width="14" height="14" transform="rotate(45 16 16)" />
  </svg>`;

const trackFor = (s) => AUDIO.find((a) => s.nt.startsWith(norm(a.title)));

/* ============ بطاقة الاقتباس للمشاركة ============ */
// يصنع بطاقة صورة من النص المحدد (للمشاركة على واتساب وغيره)
async function shareQuote(text) {
  try { await Promise.all([document.fonts.load('48px Amiri'), document.fonts.load('44px "Aref Ruqaa"')]); } catch { /* نكمل بالخط الاحتياطي */ }
  const W = 1080, H = 1080;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');

  const g = x.createRadialGradient(W / 2, 0, 80, W / 2, H / 2, H);
  g.addColorStop(0, '#15493f'); g.addColorStop(1, '#04140f');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.strokeStyle = '#d4af37'; x.lineWidth = 4; x.strokeRect(50, 50, W - 100, H - 100);
  x.lineWidth = 1.5; x.strokeRect(68, 68, W - 136, H - 136);

  x.direction = 'rtl'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillStyle = '#f5ecd8'; x.font = '48px Amiri, serif';

  // تقسيم النص لسطور
  const lines = []; let cur = '';
  for (const w of text.replace(/\s+/g, ' ').split(' ')) {
    const t = cur ? `${cur} ${w}` : w;
    if (x.measureText(t).width > W - 260 && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  lines.push(cur);
  const MAX = 9, lh = 88;
  const L = lines.slice(0, MAX);
  if (lines.length > MAX) L[MAX - 1] += ' …';
  const top = 500 - ((L.length - 1) * lh) / 2;
  L.forEach((l, i) => x.fillText(l, W / 2, top + i * lh));

  x.fillStyle = '#e9d18f'; x.font = '44px "Aref Ruqaa", Amiri, serif';
  x.fillText('النفحة النورانية', W / 2, H - 135);

  const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
  const file = new File([blob], 'اقتباس-النفحة-النورانية.png', { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: 'النفحة النورانية' }).catch(() => {});
  } else {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
}

/* ============ الصفحات ============ */

/* ============ الرئيسية ============ */
const SHEIKHS = ['الشيخ حنفي', 'الشيخ حامد', 'الشيخ أمير', 'الشيخ خالد'];
const FEATURED = [
  ['الحزب الصغير', 'الحزب الصغير'], ['اللآلئ السنية', 'هذه منظومة'], ['ورد السحر', 'ورد السحر'],
  ['الميمية', 'الميمية'], ['ورد الستار', 'ورد الستار'], ['سورة يس', 'سورة يس'],
];
const DAY = [['الإشراق', 'ورد الإشراق'], ['الضحى', 'ورد الضحى'], ['الظهر', 'ورد الظهر'], ['العصر', 'ورد العصر'], ['الغروب', 'ورد الغروب']];

function Home() {
  const { sections } = useBook();
  const last = readJSON('lastRead');
  const lastSec = sections && last ? sections[last.i] : null;
  const to = (key) => { const i = sections ? findIdx(sections, key) : -1; return i < 0 ? '#/index' : `#/read/${i}`; };

  return html`<${Fragment}>
    <section className="hero">
      <div className="frame">
        <div className="arches">
          ${SHEIKHS.map((n, k) => html`
            <figure className="arch" style=${{ '--n': k }} key=${n}>
              <img src=${`assets/sheikhs/${k + 1}.jpg`} alt=${n} width="480" height="560" />
              <figcaption>${n}</figcaption>
            </figure>`)}
        </div>
      </div>

      <p className="bism">بِسْمِ اللهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
      <h1>النفحة النورانية</h1>
      <p className="sub">في أوراد الطريقة الحامدية الخلوتية</p>

      <div className="cta">
        <a className="btn solid" href=${to('مقدمة')}>ابدأ القراءة</a>
        <a className="btn" href="#/tasbih">السبحة الإلكترونية</a>
      </div>

      ${lastSec && html`
        <a className="resume" href=${`#/read/${last.i}?p=${last.p}`}>
          <span>تابع من حيث توقفت</span>
          <b>${lastSec.title}</b>
          <small>أتممت ${ar(Math.round(last.p * 100))}٪ من هذا القسم</small>
        </a>`}
    </section>

    <h2 className="h2">أوراد اليوم</h2>
    <div className="chips">
      ${DAY.map(([label, key]) => html`<a key=${key} className="chip" href=${to(key)}>${label}</a>`)}
    </div>

    <h2 className="h2">من الكتاب</h2>
    <div className="cards">
      ${FEATURED.map(([label, key]) => html`<a key=${key} className="card" href=${to(key)}>${label}</a>`)}
    </div>

    <p className="lede">نص الكتاب كاملاً في ٤٨ قسمًا، من المقدمة إلى بيعة الطريق، منسوخ عن الطبعة التي أشار بها فضيلة الشيخ خالد أمير محمد.</p>
    <p className="foot">هذا الموقع غير رسمي، وهو عرض مبسّط لنص الكتاب لتسهيل الاطلاع عليه ومشاركته.</p>
  <//>`;
}

/* ============ الفهرس والبحث ============ */
function Index() {
  const { sections } = useBook();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState('all');
  const [marks] = useStored('bookmarks', []);
  const found = useMemo(() => (sections ? search(sections, q) : null), [sections, q]);
  if (!sections) return html`<${Loading} />`;

  const rows = found ?? sections.map((s, i) => ({ i, s })).filter((r) => tab === 'all' || marks.includes(r.i));
  const qs = found ? `?q=${encodeURIComponent(q.trim())}` : '';

  return html`<${Fragment}>
    <h1 className="h1">فهرس الكتاب</h1>
    <label className="search">
      <${Icon} n="search" />
      <input type="search" value=${q} onChange=${(e) => setQ(e.target.value)}
        placeholder="ابحث في نص الكتاب كاملاً (التشكيل لا يؤثر)…" />
    </label>

    ${!found && html`
      <div className="seg" role="tablist">
        <button role="tab" aria-selected=${tab === 'all'} onClick=${() => setTab('all')}>كل الأقسام</button>
        <button role="tab" aria-selected=${tab === 'saved'} onClick=${() => setTab('saved')}>المحفوظات (${ar(marks.length)})</button>
      </div>`}
    ${found && html`<p className="count">${found.length ? `${ar(found.length)} قسم فيه نتائج` : 'لا توجد نتائج مطابقة.'}</p>`}
    ${!found && tab === 'saved' && !rows.length && html`<p className="empty">لم تحفظ أي قسم بعد. اضغط على النجمة داخل أي قسم لحفظه.</p>`}

    <ul className="list">
      ${rows.map(({ i, s, snip }) => html`
        <li key=${i}>
          <a className="row" href=${`#/read/${i}${qs}`}>
            <span className="no">${ar(i + 1)}</span>
            <span className="rt">
              <b>${s.title}</b>
              ${snip && html`<small>…${snip.pre}<mark>${snip.hit}</mark>${snip.post}…</small>`}
            </span>
            ${trackFor(s) && html`<${Icon} n="mic" />`}
            <${Icon} n="back" />
          </a>
        </li>`)}
    </ul>
  <//>`;
}

/* ============ القارئ ============ */
const THEMES = [['night', 'ليلي'], ['paper', 'ورقي'], ['sepia', 'سيبيا']];

/* مشغّل الصوت: يظهر التسجيل لو موجود في قائمة AUDIO، وإلا يظهر مكانه محجوزًا */
function AudioBox({ track }) {
  const ref = useRef(null);
  const [rate, setRate] = useState(1);
  const [loop, setLoop] = useState(false);
  useEffect(() => { if (ref.current) { ref.current.defaultPlaybackRate = rate; ref.current.playbackRate = rate; } }, [rate]);
  if (!track) {
    return html`<div className="audio soon"><${Icon} n="mic" /><span>التسجيل الصوتي لهذا القسم سيُضاف قريبًا بإذن الله</span></div>`;
  }
  return html`
    <div className="audio">
      <div className="audio-h"><${Icon} n="mic" /><b>استمع إلى القراءة</b></div>
      <audio ref=${ref} controls preload="none" loop=${loop} src=${track.src}></audio>
      <div className="audio-c">
        ${[0.75, 1, 1.25].map((r) => html`<button key=${r} aria-pressed=${rate === r} onClick=${() => setRate(r)}>${ar(r)}×</button>`)}
        <button aria-pressed=${loop} onClick=${() => setLoop(!loop)}>تكرار</button>
      </div>
    </div>`;
}

function Reader({ idx, params }) {
  const q = params.get('q') || '';
  const p0 = params.get('p');
  const { sections } = useBook();
  const [size, setSize] = useStored('rsize', 20);
  const [theme, setTheme] = useStored('rtheme', 'night');
  const [marks, setMarks] = useStored('bookmarks', []);
  const [prog, setProg] = useState(0);
  const body = useRef(null);
  const s = sections?.[idx];
  const sel = useRef('');

  // نتذكر آخر نص حدّده القارئ (زر البطاقة قد يلغي التحديد على الموبايل)
  useEffect(() => {
    sel.current = '';
    const f = () => {
      const g = getSelection();
      const t = g ? g.toString().trim() : '';
      if (t && body.current?.contains(g.anchorNode)) sel.current = t;
    };
    document.addEventListener('selectionchange', f);
    return () => document.removeEventListener('selectionchange', f);
  }, [idx]);

  // تمييز كلمة البحث داخل النص (يتجاهل التشكيل)
  const content = useMemo(() => {
    if (!s) return null;
    const nq = norm(q.trim());
    if (nq.length < 2) return s.text;
    const out = [];
    let last = 0, from = 0, k = 0;
    for (;;) {
      const b = s.n.indexOf(nq, from);
      if (b < 0) break;
      const a = s.map[b], e = s.map[b + nq.length - 1] + 1;
      out.push(s.text.slice(last, a), html`<mark key=${k++}>${s.text.slice(a, e)}</mark>`);
      last = e; from = b + nq.length;
    }
    out.push(s.text.slice(last));
    return out;
  }, [s, q]);

  // حفظ موضع القراءة تلقائيًا + شريط التقدم
  useEffect(() => {
    if (!s) return;
    document.title = `${s.title} — النفحة النورانية`;
    let t;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? Math.min(1, scrollY / max) : 0;
      setProg(p);
      clearTimeout(t);
      t = setTimeout(() => writeJSON('lastRead', { i: idx, p: +p.toFixed(3) }), 300);
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => removeEventListener('scroll', onScroll);
  }, [s, idx]);

  // استعادة الموضع (متابعة القراءة) أو الانتقال لأول نتيجة بحث
  useEffect(() => {
    if (!s) return;
    const r = requestAnimationFrame(() => {
      if (p0 !== null) scrollTo(0, Number(p0) * (document.documentElement.scrollHeight - innerHeight));
      else { const m = body.current?.querySelector('mark'); m ? m.scrollIntoView({ block: 'center' }) : scrollTo(0, 0); }
    });
    return () => cancelAnimationFrame(r);
  }, [s, idx]);

  if (!sections) return html`<${Loading} />`;
  if (!s) return html`<p className="empty">هذا القسم غير موجود. <a href="#/index">العودة للفهرس</a></p>`;

  const saved = marks.includes(idx);
  const share = () => {
    const d = { title: s.title, url: location.href };
    if (navigator.share) navigator.share(d).catch(() => {});
    else navigator.clipboard?.writeText(location.href).then(() => alert('تم نسخ الرابط'));
  };
  const go = (d) => { location.hash = `#/read/${idx + d}`; };
  const card = () => (sel.current ? shareQuote(sel.current) : alert('حدّد جزءًا من النص أولاً، ثم اضغط هذا الزر لإنشاء بطاقة جاهزة للمشاركة'));
  const mins = Math.max(1, Math.round(s.text.trim().split(/\s+/).length / 110));

  return html`<${Fragment}>
    <div className="prog" style=${{ '--p': prog }} aria-hidden="true"></div>
    <div className="toolbar" role="toolbar" aria-label="أدوات القراءة">
      <button onClick=${() => setSize(Math.max(14, size - 2))} aria-label="تصغير الخط">أ−</button>
      <button onClick=${() => setSize(Math.min(34, size + 2))} aria-label="تكبير الخط">أ+</button>
      <span className="sep"></span>
      ${THEMES.map(([k, label]) => html`
        <button key=${k} className=${`th ${k}`} aria-pressed=${theme === k} onClick=${() => setTheme(k)}>${label}</button>`)}
      <span className="sep"></span>
      <button aria-pressed=${saved} aria-label=${saved ? 'إزالة من المحفوظات' : 'حفظ هذا القسم'}
        onClick=${() => setMarks(saved ? marks.filter((x) => x !== idx) : [...marks, idx])}><${Icon} n="star" fill=${saved} /></button>
      <button onClick=${card} aria-label="إنشاء بطاقة من النص المحدد"><${Icon} n="card" /></button>
      <button onClick=${share} aria-label="مشاركة"><${Icon} n="share" /></button>
    </div>

    <article className="page" data-theme=${theme} style=${{ fontSize: size }}>
      <h1>${s.title}</h1>
      <p className="meta">قراءة نحو ${mins === 1 ? 'دقيقة' : mins === 2 ? 'دقيقتين' : `${ar(mins)} ${mins <= 10 ? 'دقائق' : 'دقيقة'}`}</p>
      <${AudioBox} track=${trackFor(s)} />
      <div className="text" ref=${body}>${content}</div>
    </article>

    <div className="pager">
      <button disabled=${idx === 0} onClick=${() => go(-1)}>القسم السابق</button>
      <a href="#/index">الفهرس</a>
      <button disabled=${idx === sections.length - 1} onClick=${() => go(1)}>القسم التالي</button>
    </div>
  <//>`;
}

/* ============ السبحة ============ */
const R = 104, C = 2 * Math.PI * R;
const TARGETS = [[33, '٣٣'], [99, '٩٩'], [100, '١٠٠'], [0, 'حر']];

function Tasbih() {
  const [count, setCount] = useStored('tasbihCount', 0);
  const [target, setTarget] = useStored('tasbihTarget', 0);
  const done = target && count > 0 && count % target === 0;
  const frac = target ? (done ? 1 : (count % target) / target) : 0;

  const tick = () => {
    const n = count + 1;
    setCount(n);
    navigator.vibrate?.(target && n % target === 0 ? [80, 60, 80] : 15);
  };

  return html`
    <section className="tasbih">
      <h1 className="h1">السبحة الإلكترونية</h1>
      <button className="bead" onClick=${tick} aria-label=${`سبّح، العدد الحالي ${count}`}>
        <svg viewBox="0 0 240 240" aria-hidden="true">
          <circle cx="120" cy="120" r=${R} className="track" />
          <circle cx="120" cy="120" r=${R} className="prog-ring" strokeDasharray=${C} strokeDashoffset=${C * (1 - frac)} />
        </svg>
        <span className="num">${ar(count)}</span>
        <span className="act">سبّح</span>
      </button>
      <p className="lap">${target ? `الهدف ${ar(target)} — الدورة ${ar(Math.floor(count / target) + (done ? 0 : 1))}` : 'التسبيح الحر'}</p>
      <div className="targets">
        ${TARGETS.map(([t, label]) => html`
          <button key=${t} aria-pressed=${target === t} onClick=${() => { setTarget(t); setCount(0); }}>${label}</button>`)}
        <button onClick=${() => setCount(0)}>تصفير</button>
      </div>
    </section>`;
}

/* ============ حول ============ */
function About() {
  return html`<${Fragment}>
    <h1 className="h1">حول الكتاب</h1>
    <p className="prose">
      هذا الموقع مبني على كتاب <b>«النفحة النورانية في أوراد الطريقة الحامدية الخلوتية»</b>،
      أشار بطبعته فضيلة الشيخ <b>خالد أمير محمد</b>، ١٤٤٤هـ / ٢٠٢٢م.
    </p>
    <p className="prose">
      يجمع الكتاب أذكارًا وصلوات على النبي صلى الله عليه وسلم، منها الحزب الصغير لسيدي إبراهيم الدسوقي،
      والصلوات الدرديرية، ومنظومة الأسماء الحسنى لسيدي أحمد الدردير، والميمية والمتبهجة لسيدي مصطفى البكري،
      وسورة يس، وأوراد الإشراق والضحى والظهر والعصر والغروب، وخاتمتان في فضل الصلاة على النبي وفي التصوف وبيعة الطريق.
    </p>
    <p className="prose">هذا الموقع غير رسمي، وهو عرض مبسّط لنص الكتاب لتسهيل الاطلاع عليه ومشاركته.</p>

    <div className="dev">
      <h2>تطوير وتصميم</h2>
      <b>شعيب شداد بدر مرسي</b>
      <span>Front-End Web Developer</span>
      <a className="btn solid" href="https://wa.me/201157251575" target="_blank" rel="noopener noreferrer">تواصل عبر واتساب</a>
      <span dir="ltr" className="tel">01157251575</span>
    </div>
  <//>`;
}

/* ============ التطبيق والتنقل ============ */

const TABS = [['/', 'الرئيسية', 'home'], ['/index', 'الفهرس', 'book'], ['/tasbih', 'السبحة', 'beads'], ['/about', 'حول', 'info']];
const PAGES = { '/': Home, '/index': Index, '/tasbih': Tasbih, '/about': About };

// تنقل بسيط عبر الـ hash (#/index) يشتغل على أي استضافة بدون إعدادات
function App() {
  const [installEv, setInstallEv] = useState(null);
  useEffect(() => {
    const f = (e) => { e.preventDefault(); setInstallEv(e); };
    addEventListener('beforeinstallprompt', f);
    return () => removeEventListener('beforeinstallprompt', f);
  }, []);
  const install = async () => { installEv.prompt(); await installEv.userChoice; setInstallEv(null); };
  const [hash, setHash] = useState(location.hash);
  useEffect(() => {
    const f = () => setHash(location.hash);
    addEventListener('hashchange', f);
    return () => removeEventListener('hashchange', f);
  }, []);

  const [path, query = ''] = hash.replace(/^#/, '').split('?');
  const m = (path || '/').match(/^\/read\/(\d+)$/);
  const Page = PAGES[path || '/'] || Home;

  useEffect(() => { if (!m) scrollTo(0, 0); }, [hash]);

  return html`<${React.Fragment}>
    <header className="top">
      <div className="wrap">
        <a href="#/" className="brand"><${Mark} />النفحة النورانية</a>
        <nav className="nav" aria-label="التنقل الرئيسي">
          ${TABS.map(([to, label]) => html`<a key=${to} href=${'#' + to} className=${(path || '/') === to ? 'active' : ''}>${label}</a>`)}
        </nav>
        ${installEv && html`<button className="install" onClick=${install}>ثبّت التطبيق</button>`}
      </div>
    </header>
    <main className="wrap">
      ${m
        ? html`<${Reader} key=${m[1] + query} idx=${+m[1]} params=${new URLSearchParams(query)} />`
        : html`<${Page} />`}
    </main>
    <nav className="tabs" aria-label="التنقل السفلي">
      ${TABS.map(([to, label, ic]) => html`
        <a key=${to} href=${'#' + to} className=${(path || '/') === to ? 'active' : ''}><${Icon} n=${ic} />${label}</a>`)}
    </nav>
  <//>`;
}


/* ============ التشغيل ============ */
if (typeof document !== 'undefined' && document.getElementById('root')) {
  createRoot(document.getElementById('root')).render(html`<${App} />`);

  // Service worker: التصفح بدون إنترنت (يتخطى localhost عشان ما يتداخلش مع التطوير)
  if ('serviceWorker' in navigator && !['localhost', '127.0.0.1'].includes(location.hostname)) {
    addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
}
