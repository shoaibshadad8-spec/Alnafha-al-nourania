import React, { useEffect, useState, Fragment } from 'react';
import htm from 'htm';

// html`<div>...</div>` = JSX بدون حاجة لـ build
export const html = htm.bind(React.createElement);

/* ---------- تخزين محلي آمن ---------- */
export const readJSON = (k, d = null) => {
  try { const s = localStorage.getItem(k); return s === null ? d : JSON.parse(s); } catch { return d; }
};
export const writeJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* التخزين غير متاح */ } };

export function useStored(key, init) {
  const [v, setV] = useState(() => readJSON(key, init));
  useEffect(() => writeJSON(key, v), [key, v]);
  return [v, setV];
}

export const ar = (n) => Number(n).toLocaleString('ar-EG');

/* ---------- تطبيع النص العربي: يتجاهل التشكيل والتطويل وفروق الهمزات ---------- */
const DROP = /[\u0640\u064B-\u065F\u0670\u06D6-\u06ED]/;
const FOLD = { 'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ٱ': 'ا', 'ى': 'ي', 'ة': 'ه', 'ؤ': 'و', 'ئ': 'ي' };
export function normMap(s) {
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
export const norm = (s) => normMap(s).n;

export function search(sections, q) {
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
export function loadBook() {
  pending ??= fetch('sections.json').then((r) => r.json())
    .then((d) => (cache = d.map((s) => ({ ...s, nt: norm(s.title), ...normMap(s.text) }))));
  return pending;
}
export function useBook() {
  const [sections, setSections] = useState(cache);
  useEffect(() => { if (!cache) loadBook().then(setSections); }, []);
  return { sections };
}
export const findIdx = (sections, key) => sections.findIndex((s) => s.nt.startsWith(norm(key)));
export const Loading = () => html`<p className="empty">جارٍ تحميل نص الكتاب…</p>`;

/* ---------- الأيقونات ---------- */
const P = {
  home: html`<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />`,
  book: html`<${Fragment}><path d="M4 5.5c2.2-1 4.6-1.2 8 0v13c-3.4-1.2-5.8-1-8 0z" /><path d="M20 5.5c-2.2-1-4.6-1.2-8 0v13c3.4-1.2 5.8-1 8 0z" /><//>`,
  beads: html`<${Fragment}><circle cx="12" cy="4.5" r="1.8" /><circle cx="6" cy="9" r="1.8" /><circle cx="18" cy="9" r="1.8" /><circle cx="7.5" cy="16" r="1.8" /><circle cx="16.5" cy="16" r="1.8" /><circle cx="12" cy="20" r="1.8" /><//>`,
  info: html`<${Fragment}><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5M12 7.6h.01" /><//>`,
  search: html`<${Fragment}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /><//>`,
  star: html`<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8z" />`,
  share: html`<${Fragment}><circle cx="18" cy="6" r="2.4" /><circle cx="6" cy="12" r="2.4" /><circle cx="18" cy="18" r="2.4" /><path d="M8 10.8l8-3.6M8 13.2l8 3.6" /><//>`,
  back: html`<path d="M9 5l7 7-7 7" />`,
};
export const Icon = ({ n, fill }) => html`
  <svg className="ic" viewBox="0 0 24 24" fill=${fill ? 'currentColor' : 'none'} stroke="currentColor"
    strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">${P[n]}</svg>`;

export const Mark = () => html`
  <svg viewBox="0 0 32 32" fill="none" stroke="#d4af37" strokeWidth="1.8" aria-hidden="true">
    <rect x="9" y="9" width="14" height="14" /><rect x="9" y="9" width="14" height="14" transform="rotate(45 16 16)" />
  </svg>`;
