import AUDIO from './data/audio.json';
import { createContext, useContext, useEffect, useState } from 'react';

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

/* ---------- تطبيع النص العربي للبحث: يتجاهل التشكيل والتطويل وفروق الهمزات ---------- */
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
      snip = {
        pre: clean(s.text.slice(Math.max(0, a - 45), a)),
        hit: s.text.slice(a, e),
        post: clean(s.text.slice(e, e + 80)),
      };
    }
    out.push({ i, s, snip });
  });
  return out;
}

/* ---------- نص الكتاب: يُحمَّل عند الحاجة (code-splitting) ---------- */
const BookCtx = createContext({ sections: null });
export const useBook = () => useContext(BookCtx);

export function BookProvider({ children }) {
  const [sections, setSections] = useState(null);
  useEffect(() => {
    import('./data/sections.json').then((m) =>
      setSections(m.default.map((s) => ({ ...s, nt: norm(s.title), ...normMap(s.text) })))
    );
  }, []);
  return <BookCtx.Provider value={{ sections }}>{children}</BookCtx.Provider>;
}

export const findIdx = (sections, key) => sections.findIndex((s) => s.nt.startsWith(norm(key)));
export const Loading = () => <p className="empty">جارٍ تحميل نص الكتاب…</p>;

/* ---------- التسجيلات الصوتية: تُعرَّف في src/data/audio.json ---------- */
export const trackFor = (s) => AUDIO.find((a) => s.nt.startsWith(norm(a.title)));
