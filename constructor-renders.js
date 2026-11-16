/* ANTKRIS premium hoodie: four-view visual turntable.
 * Replaces distorted GLB demo. The photographic customizer remains unchanged.
 * NOTE: 4 separate AI renders, NOT a 3D geometric mesh. */
(() => {
  'use strict';
  const FRAMES = Object.freeze([
    {label:'Спереди', src:'assets/hoodie-render-front.jpg'},
    {label:'45°',src:'assets/hoodie-render-angle.jpg'},
    {label:'Сбоку',src:'assets/hoodie-render-side.jpg'},
    {label:'Сзади',src:'assets/hoodie-render-back.jpg'}
  ]);
  let current = 0;
  let start = null;
  let renderedMode = true;
  let root, picture, label, count, gallery, photo, caption, actions, controls;
  const qs = (s, r=document) => r.querySelector(s);
  const qsa = (s, r=document) => [...r.querySelectorAll(s)];
  function paint(n) {
    current = (n + FRAMES.length) % FRAMES.length;
    const frame = FRAMES[current];
    picture.src = frame.src;
    picture.alt = 'Чёрное oversized-худи ANTKRIS — ' + frame.label.toLowerCase();
    label.textContent = frame.label;
    count.textContent = (current + 1) + ' / 4';
    qsa('[data-render-angle]', controls).forEach(button => {
      button.setAttribute('aria-pressed',String(Number(button.dataset.renderAngle) === current));
    });
  }
  function mode(visual) {
    renderedMode = visual;
    photo.hidden = visual;
    if(caption) caption.hidden = visual;
    gallery.hidden = !visual;
    actions.hidden = !visual;
    const notice = qs('#cust-3d-visual-note');
    if(notice) notice.hidden = !visual;
    qs('#cust-3d-render-tab').setAttribute('aria-pressed',String(visual));
    qs('#cust-3d-photo-tab').setAttribute('aria-pressed',String(!visual));
    if (visual) paint(current);
  }
  function init() {
    root = qs('#antkris-customizer');
    if(!root) return;
    photo = qs('.cust-stage', root);
    if(!photo || qs('#cust-3d-gallery',root)) return;
    caption = qs('.cust-figure-note', root);
    const tabs = document.createElement('div');
    tabs.className='cust-3d-mode-tabs';
    tabs.setAttribute('role','group');
    tabs.setAttribute('aria-label','Тип просмотра худи');
    tabs.innerHTML='<button type="button" id="cust-3d-render-tab" aria-pressed="true">Обзор худи</button><button type="button" id="cust-3d-photo-tab" aria-pressed="false">Фото + вышивка</button>';
    photo.before(tabs);

    gallery = document.createElement('section');
    gallery.id='cust-3d-gallery';
    gallery.className='cust-3d-gallery';
    gallery.setAttribute('aria-label','Чёрное худи ANTKRIS, четыре ракурса');
    gallery.innerHTML='<div class="cust-3d-view" tabindex="0" aria-label="Проведите пальцем для смены ракурса">'+
      '<img id="cust-3d-image" src="assets/hoodie-render-front.jpg" alt="Чёрное oversized-худи ANTKRIS, спереди" decoding="async" draggable="false"/>'+
      '<div class="cust-3d-tag">ANTKRIS / PREMIUM HOODIE</div>'+
      '<div class="cust-3d-image-label" id="cust-3d-label">Спереди</div>'+
      '<div class="cust-3d-counter" id="cust-3d-counter">1 / 4</div>'+
      '</div>';
    photo.after(gallery);
    const view = qs('.cust-3d-view',gallery);
    picture = qs('#cust-3d-image',gallery);
    label = qs('#cust-3d-label',gallery);
    count = qs('#cust-3d-counter',gallery);
    actions = document.createElement('div');
    actions.className='cust-3d-gallery-actions';
    actions.hidden=true;
    actions.innerHTML='<div class="cust-3d-gallery-controls" aria-label="Выбор ракурса" role="group">'+
       FRAMES.map((f,i)=>'<button type="button" data-render-angle="'+i+'" aria-pressed="'+(i===0)+'">'+f.label+'</button>').join('')+
       '</div>';
    gallery.after(actions);
    controls=qs('.cust-3d-gallery-controls',actions);

    const note=document.createElement('div');
    note.id='cust-3d-visual-note';
    note.className='cust-3d-visual-note';
    note.hidden=true;
    note.innerHTML='<span>Проведите по худи, чтобы менять ракурсы. Это четыре согласованных по стилю рендера, а не настоящая 3D-модель.</span>'+
      '<button type="button" id="cust-3d-edit-embroidery">Настроить вышивку ↗</button>';
    actions.after(note);

    qs('#cust-3d-render-tab').addEventListener('click',()=>mode(true));
    qs('#cust-3d-photo-tab').addEventListener('click',()=>mode(false));
    qs('#cust-3d-edit-embroidery').addEventListener('click',()=>mode(false));
    controls.addEventListener('click',event=>{
      const btn=event.target.closest('[data-render-angle]');
      if(btn)paint(Number(btn.dataset.renderAngle));
    });
    view.addEventListener('pointerdown',event=>{
      if(event.pointerType==='mouse' && event.button!==0)return;
      start = event.clientX;
      try{view.setPointerCapture(event.pointerId)}catch{}
    });
    view.addEventListener('pointermove',event=>{
      if(start===null)return;
      const dx=event.clientX-start;
      if(Math.abs(dx)>=55){paint(current+(dx<0?1:-1));start=event.clientX;}
    });
    view.addEventListener('pointerup',()=>{start=null});
    view.addEventListener('pointercancel',()=>{start=null});
    view.addEventListener('keydown',e=>{
      if(e.key==='ArrowLeft'){paint(current-1);e.preventDefault()}
      if(e.key==='ArrowRight'){paint(current+1);e.preventDefault()}
    });
    for(const f of FRAMES){const image=new Image();image.src=f.src;}
    mode(true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();