// يصنع بطاقة صورة من النص المحدد (للمشاركة على واتساب وغيره)
export async function shareQuote(text) {
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
