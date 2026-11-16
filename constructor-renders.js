/* ANTKRIS hoodie turntable: 72 generated angles using one compact WebP atlas.
   Image-based 360° visualization, not a GLB model. Embroidery editor stays in photo mode. */
(() => {
  'use strict';
  const SPRITE = window.ANTKRIS_HOODIE_72_SPRITE;
  const COUNT = 72;
  const STEP_MS = 255; // Smooth, slow ~18.4-second full turn
  const FRAME_W = SPRITE?.frameWidth || 448, FRAME_H = SPRITE?.frameHeight || 448, COLS = SPRITE?.columns || 8;
  const OUT = 720;
  const $ = (selector, root=document) => root.querySelector(selector);
  let root, photo, caption, gallery, canvas, view, controls, slider, playButton, status;
  let image = null, current=0, timer=null, running=false, drag=false, moveX=0, dragRemainder=0, visibleMode=true;
  let previousFocus=null;
  const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;

  function paint() {
    if (!canvas || !image || !image.complete || !image.naturalWidth) return;
    const ctx=canvas.getContext('2d',{alpha:false});
    if (!ctx) return;
    const col=current%COLS;
    const row=Math.floor(current/COLS);
    ctx.imageSmoothingEnabled=true;
    ctx.imageSmoothingQuality='high';
    ctx.fillStyle='#eeedeb';
    ctx.fillRect(0,0,OUT,OUT);
    // Render exactly one square tile of the approved visual style, never neighbouring rows.
    ctx.drawImage(image,col*FRAME_W,row*FRAME_H,FRAME_W,FRAME_H,0,0,OUT,OUT);
  }
  function frame(n) {
    current=((Math.round(n)%COUNT)+COUNT)%COUNT;
    if(slider)slider.value=String(current);
    paint();
  }
  function pause(){
    running=false;
    if(timer!==null){clearInterval(timer);timer=null;}
    if(playButton){playButton.textContent='Вращать';playButton.setAttribute('aria-pressed','false');}
  }
  function play(){
    if(!visibleMode || root?.hidden || !image?.naturalWidth || document.hidden)return;
    pause();
    running=true;
    if(playButton){playButton.textContent='Пауза';playButton.setAttribute('aria-pressed','true');}
    timer=setInterval(()=>{
      if(document.hidden || root?.hidden || !visibleMode){pause();return;}
      frame(current+1);
    },STEP_MS);
  }
  function mode(useVisual){
    visibleMode=Boolean(useVisual);
    photo.hidden=visibleMode;
    if(caption) caption.hidden=visibleMode;
    gallery.hidden=!visibleMode;
    controls.hidden=!visibleMode;
    const note=$('#antkris-72-note',root);
    if(note) note.hidden=!visibleMode;
    $('#cust-72-visual-tab',root).setAttribute('aria-pressed',String(visibleMode));
    $('#cust-72-photo-tab',root).setAttribute('aria-pressed',String(!visibleMode));
    if(visibleMode){paint();if(!reducedMotion)play();}
    else pause();
  }
  function init() {
    root=$('#antkris-customizer');
    if(!root || $('#antkris-72-stage',root))return;
    photo=$('.cust-stage',root);
    if(!photo)return;
    caption=$('.cust-figure-note',root);
    const tabs=document.createElement('div');
    tabs.className='cust-3d-mode-tabs';
    tabs.setAttribute('role','group');
    tabs.setAttribute('aria-label','Режим просмотра худи');
    tabs.innerHTML='<button type="button" id="cust-72-visual-tab" aria-pressed="true">Обзор 360°</button>'+
      '<button type="button" id="cust-72-photo-tab" aria-pressed="false">Фото + вышивка</button>';
    photo.before(tabs);
    gallery=document.createElement('section');
    gallery.id='antkris-72-stage';
    gallery.className='cust-3d-gallery';
    gallery.setAttribute('aria-label','Вращение чёрного худи ANTKRIS на 360 градусов');
    gallery.innerHTML='<div class="cust-3d-view" tabindex="0" role="group" aria-label="Поверните худи свайпом влево или вправо">'+
      '<canvas id="antkris-72-canvas" width="720" height="720" aria-label="Чёрное oversized-худи ANTKRIS"></canvas>'+
      '<span class="cust-3d-tag">ANTKRIS / ОБЗОР 360°</span>'+
      '<span class="cust-3d-image-label">Проведите пальцем ↔</span>'+
      '<span class="antkris-72-loading" id="antkris-72-loading" role="status">Загрузка худи…</span>'+
      '</div>'+
      '<div class="antkris-72-scrubber"><input id="antkris-72-range" type="range" min="0" max="71" step="1" value="0" aria-label="Угол поворота худи"></div>';
    photo.after(gallery);
    canvas=$('#antkris-72-canvas',gallery);
    view=$('.cust-3d-view',gallery);
    slider=$('#antkris-72-range',gallery);
    status=$('#antkris-72-loading',gallery);
    controls=document.createElement('div');
    controls.className='cust-3d-gallery-actions';
    controls.id='antkris-72-controls';
    controls.innerHTML='<div class="cust-3d-gallery-controls" role="group" aria-label="Управление вращением">'+
      '<button type="button" data-hoodie-angle="0">Спереди</button>'+
      '<button type="button" data-hoodie-angle="36">Сзади</button>'+
      '<button type="button" id="antkris-72-play" aria-pressed="false">Вращать</button>'+
      '<button type="button" data-hoodie-angle="0">Сбросить</button>'+
      '</div>';
    gallery.after(controls);
    playButton=$('#antkris-72-play',controls);
    const note=document.createElement('div');
    note.id='antkris-72-note';
    note.className='cust-3d-visual-note';
    note.innerHTML='<span>Вращайте худи пальцем или используйте автоповорот. Предпросмотр создан на основе изображений, это не геометрическая 3D-модель.</span>'+
      '<button type="button" id="antkris-72-embroidery">Настроить вышивку ↗</button>';
    controls.after(note);
    $('#cust-72-visual-tab',root).addEventListener('click',()=>mode(true));
    $('#cust-72-photo-tab',root).addEventListener('click',()=>mode(false));
    $('#antkris-72-embroidery',root).addEventListener('click',()=>mode(false));
    controls.addEventListener('click',event=>{
      const btn=event.target.closest('button');
      if(!btn)return;
      if(btn.id==='antkris-72-play'){if(running)pause();else play();}
      else if(btn.hasAttribute('data-hoodie-angle')){pause();frame(Number(btn.dataset.hoodieAngle));}
    });
    slider.addEventListener('input',event=>{pause();frame(Number(event.target.value));});
    view.addEventListener('pointerdown',event=>{
      if(event.pointerType==='mouse' && event.button!==0)return;
      pause();
      drag=true;moveX=event.clientX;dragRemainder=0;
      try{view.setPointerCapture(event.pointerId);}catch{}
    });
    view.addEventListener('pointermove',event=>{
      if(!drag)return;
      dragRemainder+=event.clientX-moveX;moveX=event.clientX;
      while(Math.abs(dragRemainder)>=7){
        const direction=dragRemainder<0?1:-1;
        frame(current+direction);
        dragRemainder+=direction===1?7:-7;
      }
    });
    const stopDrag=()=>{drag=false;dragRemainder=0;};
    view.addEventListener('pointerup',stopDrag);
    view.addEventListener('pointercancel',stopDrag);
    view.addEventListener('lostpointercapture',stopDrag);
    view.addEventListener('keydown',event=>{
      if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
        pause();frame(current+(event.key==='ArrowRight'?1:-1));event.preventDefault();
      }
    });
    if(!SPRITE || SPRITE.total!==COUNT || typeof SPRITE.uri!=='string'){
      status.textContent='Не удалось загрузить обзор. Обновите страницу.';return;
    }
    image=new Image();
    image.onload=()=>{if(image.naturalWidth!==FRAME_W*COLS || image.naturalHeight!==FRAME_H*SPRITE.rows){status.textContent='Ошибка размеров изображения. Обновите страницу.';return;}status.hidden=true;paint();if(!reducedMotion && !root.hidden && visibleMode)play();};
    image.onerror=()=>{status.textContent='Не удалось загрузить изображение. Обновите страницу.';pause();};
    image.src=SPRITE.uri;
    photo.hidden=true;
    if(caption)caption.hidden=true;
    if(reducedMotion)pause();
    const close=$('[data-custom-close]',root);
    close?.addEventListener('click',pause);
    // The constructor is opened later than DOMContentLoaded; resume only while visible.
    const observer=new MutationObserver(()=>{
      if(root.hidden)pause();
      else if(visibleMode && image?.naturalWidth && !running && !reducedMotion)play();
    });
    observer.observe(root,{attributes:true,attributeFilter:['hidden']});
    window.addEventListener('pagehide',pause);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();