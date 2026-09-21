let sections = [];
let currentIndex = -1;

/* ---------- Service Worker: تشغيل الموقع من غير نت زي تطبيق حقيقي ---------- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(reg => {
      // لو فيه نسخة جديدة من sw.js متاحة، فعّلها فورًا من غير ما نستنى إقفال كل التابات
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'activated') { /* التحديث اتفعّل، هيظهر في أول فتح جديد */ }
        });
      });
    }).catch(()=>{});
  });
}

/* ---------- تخزين آمن ---------- */
function save(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
function load(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }

/* ---------- التنقل ---------- */
function showView(name){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('view-'+name).classList.add('active');
  window.scrollTo(0,0);
  if(name==='awrad') renderAwradList();
  if(name==='library') renderLibraryList();
  if(name==='home') renderResume();
  if(location.hash !== '#'+name) history.replaceState(null,'','#'+name);
}

function esc(s){ return s.replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

function renderAwradList(){
  const list = document.getElementById('awrad-list');
  const q = (document.getElementById('search').value || '').trim();
  list.innerHTML = '';
  let shown = 0;
  sections.forEach((s,i)=>{
    if(q && !s.title.includes(q) && !s.text.includes(q)) return;
    shown++;
    const div = document.createElement('div');
    div.className = 'list-item';
    div.setAttribute('role','button');
    div.tabIndex = 0;
    div.onclick = ()=>openSection(i);
    div.onkeydown = e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openSection(i); } };
    let t = esc(s.title);
    if(q && s.title.includes(q)) t = t.split(esc(q)).join('<mark>'+esc(q)+'</mark>');
    div.innerHTML = '<span class="t">'+t+'</span><span class="arrow">‹</span>';
    list.appendChild(div);
  });
  if(!shown){
    list.innerHTML = '<div class="empty">لا توجد نتائج مطابقة للبحث.</div>';
  }
}

function openSection(i){
  if(i<0 || i>=sections.length) return;
  currentIndex = i;
  const s = sections[i];
  document.getElementById('reader-title').textContent = s.title;
  document.getElementById('reader-text').textContent = s.text;
  document.getElementById('prev-btn').disabled = (i===0);
  document.getElementById('next-btn').disabled = (i===sections.length-1);
  save('lastSection', i);
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('view-reader').classList.add('active');
  window.scrollTo(0,0);
  history.replaceState(null,'','#s'+i);
}

function openSectionByTitle(title){
  const i = sections.findIndex(s=>s.title.startsWith(title));
  if(i>=0){ openSection(i); } else { showView('awrad'); }
}

function stepSection(d){ openSection(currentIndex + d); }

function renderLibraryList(){
  const list = document.getElementById('library-list');
  list.innerHTML = '';
  sections.forEach((s,i)=>{
    const div = document.createElement('div');
    div.className = 'list-item';
    div.setAttribute('role','button');
    div.tabIndex = 0;
    div.onclick = ()=>openSection(i);
    div.onkeydown = e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openSection(i); } };
    div.innerHTML = '<span class="t">'+esc(s.title)+'</span><span class="arrow">‹</span>';
    list.appendChild(div);
  });
}

/* ---------- حجم الخط ---------- */
let rsize = parseInt(load('rsize') || '18', 10);
function applyFont(){
  document.documentElement.style.setProperty('--rsize', rsize+'px');
  save('rsize', rsize);
}
function fontSize(d){
  rsize = Math.min(30, Math.max(14, rsize + d*2));
  applyFont();
}
applyFont();

/* ---------- متابعة القراءة ---------- */
function renderResume(){
  const last = parseInt(load('lastSection'), 10);
  const box = document.getElementById('resume-box');
  if(!isNaN(last) && sections[last]){
    box.innerHTML = 'آخر ما قرأت: <b style="color:var(--cream)">'+esc(sections[last].title)+'</b>'
      + ' — <span style="text-decoration:underline;cursor:pointer" onclick="openSection('+last+')">متابعة القراءة</span>';
  }
}

/* ---------- مشاركة ---------- */
function shareSite(){
  const data = {title:'الطريقة الخلوتية الحامدية', text:'أوراد الطريقة الخلوتية الحامدية', url: location.href};
  if(navigator.share){
    navigator.share(data).catch(()=>{});
  } else if(navigator.clipboard){
    navigator.clipboard.writeText(location.href).then(
      ()=>alert('تم نسخ رابط الصفحة'),
      ()=>alert(location.href)
    );
  } else {
    alert(location.href);
  }
}

/* ---------- السبحة ---------- */
let count = parseInt(load('tasbihCount') || '0', 10);
let target = null;
function paint(){
  document.getElementById('tasbih-num').textContent = count.toLocaleString('ar-EG');
}
function tick(){
  count++;
  paint();
  save('tasbihCount', count);
  if(navigator.vibrate) navigator.vibrate(target && count===target ? [80,60,80] : 15);
}
function setTarget(t){
  target = t; count = 0; paint(); save('tasbihCount', 0);
  document.getElementById('tasbih-target').textContent = 'الهدف: ' + t.toLocaleString('ar-EG');
}
function resetTasbih(){
  target = null; count = 0; paint(); save('tasbihCount', 0);
  document.getElementById('tasbih-target').textContent = 'التسبيح الحر';
}
paint();
document.getElementById('tap-circle').addEventListener('keydown', e=>{
  if(e.key==='Enter'||e.key===' '){ e.preventDefault(); tick(); }
});
document.getElementById('tasbih-tap-area').addEventListener('click', e=>{
  if(e.target.closest('.tasbih-controls')) return; // أزرار الهدف/التصفير ليها فعلها الخاص
  tick();
});

/* ---------- البداية ---------- */
fetch('sections.json')
  .then(r=>{ if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
  .then(data=>{
    sections = data;
    renderResume();
    const h = location.hash.slice(1);
    if(h.startsWith('s')){ const i=parseInt(h.slice(1),10); if(!isNaN(i)) openSection(i); }
    else if(h && document.getElementById('view-'+h)) showView(h);
  })
  .catch(err=>{
    console.error(err);
    const msg = '<div class="empty">تعذّر تحميل نص الكتاب. تأكد من اتصالك بالإنترنت وحدّث الصفحة.<br><small>(لو بتجرب الموقع من على جهازك مباشرة بفتح الملف، لازم يتفتح عن طريق سيرفر محلي زي Live Server، مش بفتح index.html مباشرة)</small></div>';
    const awradList = document.getElementById('awrad-list');
    const libList = document.getElementById('library-list');
    if(awradList) awradList.innerHTML = msg;
    if(libList) libList.innerHTML = msg;
  });
