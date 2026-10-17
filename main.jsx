import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BookProvider } from './lib.jsx';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BookProvider>
      <App />
    </BookProvider>
  </StrictMode>
);

// Service worker: التصفح بدون إنترنت (في نسخة الإنتاج فقط)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js').catch(() => {});
  });
}
