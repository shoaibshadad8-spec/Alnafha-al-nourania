const P = {
  home: <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  book: <><path d="M4 5.5c2.2-1 4.6-1.2 8 0v13c-3.4-1.2-5.8-1-8 0z" /><path d="M20 5.5c-2.2-1-4.6-1.2-8 0v13c3.4-1.2 5.8-1 8 0z" /></>,
  beads: <><circle cx="12" cy="4.5" r="1.8" /><circle cx="6" cy="9" r="1.8" /><circle cx="18" cy="9" r="1.8" /><circle cx="7.5" cy="16" r="1.8" /><circle cx="16.5" cy="16" r="1.8" /><circle cx="12" cy="20" r="1.8" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5M12 7.6h.01" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></>,
  star: <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8z" />,
  share: <><circle cx="18" cy="6" r="2.4" /><circle cx="6" cy="12" r="2.4" /><circle cx="18" cy="18" r="2.4" /><path d="M8 10.8l8-3.6M8 13.2l8 3.6" /></>,
  mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>,
  card: <><rect x="4" y="5" width="16" height="14" rx="2" /><path d="M8 10h8M8 14h5" /></>,
  back: <path d="M9 5l7 7-7 7" />,
};

export default function Icon({ n, fill }) {
  return (
    <svg className="ic" viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'} stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{P[n]}</svg>
  );
}

export const Mark = () => (
  <svg viewBox="0 0 32 32" fill="none" stroke="#d4af37" strokeWidth="1.8" aria-hidden="true">
    <rect x="9" y="9" width="14" height="14" /><rect x="9" y="9" width="14" height="14" transform="rotate(45 16 16)" />
  </svg>
);
