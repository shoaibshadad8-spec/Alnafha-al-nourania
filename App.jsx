import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, NavLink, Link } from 'react-router-dom';
import Icon, { Mark } from './Icon.jsx';
import Home from './pages/Home.jsx';
import Index from './pages/Index.jsx';
import Reader from './pages/Reader.jsx';
import Tasbih from './pages/Tasbih.jsx';
import About from './pages/About.jsx';

const TABS = [['/', 'الرئيسية', 'home'], ['/index', 'الفهرس', 'book'], ['/tasbih', 'السبحة', 'beads'], ['/about', 'حول', 'info']];

export default function App() {
  const [installEv, setInstallEv] = useState(null);
  useEffect(() => {
    const f = (e) => { e.preventDefault(); setInstallEv(e); };
    window.addEventListener('beforeinstallprompt', f);
    return () => window.removeEventListener('beforeinstallprompt', f);
  }, []);
  const install = async () => { installEv.prompt(); await installEv.userChoice; setInstallEv(null); };

  return (
    <HashRouter>
      <header className="top">
        <div className="wrap">
          <Link to="/" className="brand"><Mark />النفحة النورانية</Link>
          <nav className="nav" aria-label="التنقل الرئيسي">
            {TABS.map(([to, label]) => <NavLink key={to} to={to} end>{label}</NavLink>)}
          </nav>
          {installEv && <button className="install" onClick={install}>ثبّت التطبيق</button>}
        </div>
      </header>
      <main className="wrap">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/index" element={<Index />} />
          <Route path="/read/:i" element={<Reader />} />
          <Route path="/tasbih" element={<Tasbih />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <nav className="tabs" aria-label="التنقل السفلي">
        {TABS.map(([to, label, ic]) => <NavLink key={to} to={to} end><Icon n={ic} />{label}</NavLink>)}
      </nav>
    </HashRouter>
  );
}
