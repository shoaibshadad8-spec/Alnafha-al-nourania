import { useEffect, useMemo, useRef, useState, Fragment } from 'react';
import {
  html, Icon, Loading, useBook, useStored, readJSON, writeJSON, search, norm, findIdx, ar,
} from './lib.js';

/* ============ الرئيسية ============ */
const SHEIKHS = ['الشيخ حنفي', 'الشيخ حامد', 'الشيخ أمير', 'الشيخ خالد'];
const FEATURED = [
  ['الحزب الصغير', 'الحزب الصغير'], ['اللآلئ السنية', 'هذه منظومة'], ['ورد السحر', 'ورد السحر'],
  ['الميمية', 'الميمية'], ['ورد الستار', 'ورد الستار'], ['سورة يس', 'سورة يس'],
];
const DAY = [['الإشراق', 'ورد الإشراق'], ['الضحى', 'ورد الضحى'], ['الظهر', 'ورد الظهر'], ['العصر', 'ورد العصر'], ['الغروب', 'ورد الغروب']];

export function Home() {
  const { sections } = useBook();
  const last = readJSON('lastRead');
  const lastSec = sections && last ? sections[last.i] : null;
  const to = (key) => { const i = sections ? findIdx(sections, key) : -1; return i < 0 ? '#/index' : `#/read/${i}`; };

  return html`<${Fragment}>
    <section className="hero">
      <p className="bism">بِسْمِ اللهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
      <h1>النفحة النورانية</h1>
      <p className="sub">في أوراد الطريقة الحامدية الخلوتية</p>

      <div className="arches">
        ${SHEIKHS.map((n, k) => html`
          <figure className="arch" style=${{ '--n': k }} key=${n}>
            <img src=${`${k + 1}.jpg`} alt=${n} width="480" height="560" />
            <figcaption>${n}</figcaption>
          </figure>`)}
      </div>

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
  </${Fragment}>`;
}

/* ============ الفهرس والبحث ============ */
export function Index() {
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
            <${Icon} n="back" />
          </a>
        </li>`)}
    </ul>
  </${Fragment}>`;
}

/* ============ القارئ ============ */
const THEMES = [['night', 'ليلي'], ['paper', 'ورقي'], ['sepia', 'سيبيا']];

export function Reader({ idx, params }) {
  const q = params.get('q') || '';
  const p0 = params.get('p');
  const { sections } = useBook();
  const [size, setSize] = useStored('rsize', 20);
  const [theme, setTheme] = useStored('rtheme', 'night');
  const [marks, setMarks] = useStored('bookmarks', []);
  const [prog, setProg] = useState(0);
  const body = useRef(null);
  const s = sections?.[idx];

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
      <button onClick=${share} aria-label="مشاركة"><${Icon} n="share" /></button>
    </div>

    <article className="page" data-theme=${theme} style=${{ fontSize: size }}>
      <h1>${s.title}</h1>
      <div className="text" ref=${body}>${content}</div>
    </article>

    <div className="pager">
      <button disabled=${idx === 0} onClick=${() => go(-1)}>القسم السابق</button>
      <a href="#/index">الفهرس</a>
      <button disabled=${idx === sections.length - 1} onClick=${() => go(1)}>القسم التالي</button>
    </div>
  </${Fragment}>`;
}

/* ============ السبحة ============ */
const R = 104, C = 2 * Math.PI * R;
const TARGETS = [[33, '٣٣'], [99, '٩٩'], [100, '١٠٠'], [0, 'حر']];

export function Tasbih() {
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
export function About() {
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
  </${Fragment}>`;
}
