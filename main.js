import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { html, Icon, Mark } from './lib.js';
import { Home, Index, Reader, Tasbih, About } from './pages.js';

const TABS = [['/', 'الرئيسية', 'home'], ['/index', 'الفهرس', 'book'], ['/tasbih', 'السبحة', 'beads'], ['/about', 'حول', 'info']];
const PAGES = { '/': Home, '/index': Index, '/tasbih': Tasbih, '/about': About };

// تنقل بسيط عبر الـ hash (#/index) يشتغل على أي استضافة بدون إعدادات
function App() {
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

createRoot(document.getElementById('root')).render(html`<${App} />`);

// Service worker: التصفح بدون إنترنت (يتخطى localhost عشان ما يتداخلش مع التطوير)
if ('serviceWorker' in navigator && !['localhost', '127.0.0.1'].includes(location.hostname)) {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
