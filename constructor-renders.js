/* ANTKRIS 24-frame hoodie product viewer.
 * 24 generated reference views, spaced 15° apart.
 * Not a geometric 3D mesh; photo-and-embroidery customization remains separate. */
(() => {
  'use strict';
  const FALLBACK = [
    'assets/hoodie-render-front.jpg',
    'assets/hoodie-render-angle.jpg',
    'assets/hoodie-render-side.jpg',
    'assets/hoodie-render-back.jpg'
  ];
  const frames = Array.isArray(window.ANTKRIS_HOODIE_FRAMES_24) && window.ANTKRIS_HOODIE_FRAMES_24.length === 24
    ? window.ANTKRIS_HOODIE_FRAMES_24
    : FALLBACK;
  const stepAngle = 360 / frames.length;
  let current = 0;
  let root, photo, caption, gallery, picture, counter, angleLabel, view, controls, slider, playButton;
  let startX = null, dragX = null, delta = 0, isDragging = false;
  let playing = false, timer = null;
  const $ = (s, r=document) => r.querySelector(s);
  function title(index) {
    const angle = Math.round(index * stepAngle);
    if (angle === 0) return 'Спереди';
    if (angle === 90) return 'Правый профиль';
    if (angle === 180) return 'Сзади';
    if (angle === 270) return 'Левый профиль';
    return angle + '°';
  }
  function show(n) {
    current = (Math.round(n) % frames.length + frames.length) % frames.length;
    picture.src = frames[current];
    picture.alt = 'Чёрное oversized-худи ANTKRIS, поворот ' + Math.round(current * stepAngle) + ' градусов';
    angleLabel.textContent = title(current);
    counter.textContent = String(current + 1).padStart(2, '0') + ' / ' + frames.length;
    slider.value = current;
    for (const button of controls.querySelectorAll('[data-hoodie-angle]')) {
      button.setAttribute('aria-pressed', String(Number(button.dataset.hoodieAngle) === current));
    }
  }
  function spin(shouldPlay) {
    playing = Boolean(shouldPlay);
    if (timer) { clearInterval(timer); timer = null; }
    if (playing) timer = setInterval(() => show(current + 1), 115);
    playButton.textContent = playing ? 'Пауза' : 'Вращать';
    playButton.setAttribute('aria-pressed', String(playing));
  }
  function mode(useRenders) {
    photo.hidden = useRenders;
    if (caption) caption.hidden = useRenders;
    gallery.hidden = !useRenders;
    controls.hidden = !useRenders;
    const note = $('#antkris-24-note');
    if (note) note.hidden = !useRenders;
    $('#cust-24-visual-tab').setAttribute('aria-pressed', String(useRenders));
    $('#cust-24-photo-tab').setAttribute('aria-pressed', String(!useRenders));
    if (useRenders) {
      show(current);
      spin(true);
    } else spin(false);
  }
  function init() {
    root = $('#antkris-customizer');
    if (!root || $('#antkris-24-stage')) return;
    photo = $('.cust-stage', root);
    if (!photo) return;
    caption = $('.cust-figure-note', root);
    const tabs = document.createElement('div');
    tabs.className = 'cust-3d-mode-tabs';
    tabs.setAttribute('role', 'group');
    tabs.setAttribute('aria-label', 'Режим просмотра худи');
    tabs.innerHTML = '<button type="button" id="cust-24-visual-tab" aria-pressed="true">Обзор 360°</button><button type="button" id="cust-24-photo-tab" aria-pressed="false">Фото + вышивка</button>';
    photo.before(tabs);

    gallery = document.createElement('section');
    gallery.id = 'antkris-24-stage';
    gallery.className = 'cust-3d-gallery';
    gallery.setAttribute('aria-label', 'Плавный обзор худи ANTKRIS, 24 ракурса');
    gallery.innerHTML = '<div class="cust-3d-view" tabindex="0" aria-label="Проведите пальцем влево или вправо, чтобы повернуть худи">' +
      '<img id="antkris-24-image" alt="Чёрное oversized-худи ANTKRIS" draggable="false" decoding="async">' +
      '<span class="cust-3d-tag">ANTKRIS / 360° · 24 КАДРА</span>' +
      '<span class="cust-3d-image-label" id="antkris-24-label">Спереди</span>' +
      '<span class="cust-3d-counter" id="antkris-24-count">01 / 24</span>' +
      '</div>' +
      '<div class="antkris-24-scrubber"><span>0°</span><input id="antkris-24-range" type="range" min="0" max="' + (frames.length-1) + '" step="1" value="0" aria-label="Ракурс худи"/><span>360°</span></div>';
    photo.after(gallery);
    view = $('.cust-3d-view', gallery);
    picture = $('#antkris-24-image', gallery);
    counter = $('#antkris-24-count', gallery);
    angleLabel = $('#antkris-24-label', gallery);
    slider = $('#antkris-24-range', gallery);

    controls = document.createElement('div');
    controls.className = 'cust-3d-gallery-actions';
    controls.id = 'antkris-24-controls';
    controls.innerHTML = '<div class="cust-3d-gallery-controls" role="group" aria-label="Управление обзором">' +
      '<button type="button" data-hoodie-angle="0">Спереди</button>' +
      '<button type="button" data-hoodie-angle="' + Math.round(frames.length/2) + '">Сзади</button>' +
      '<button type="button" id="antkris-24-autoplay" aria-pressed="true">Пауза</button>' +
      '<button type="button" data-hoodie-angle="0">Сбросить</button>' +
      '</div>';
    gallery.after(controls);
    playButton = $('#antkris-24-autoplay', controls);
    const note = document.createElement('div');
    note.id = 'antkris-24-note';
    note.className = 'cust-3d-visual-note';
    note.innerHTML = '<span>24 сгенерированных ракурса, плавное переключение по 15°. Это не геометрическая 3D-модель. Для настройки герба и надписи используйте отдельный режим.</span>' +
      '<button type="button" id="antkris-24-embroidery">Настроить вышивку ↗</button>';
    controls.after(note);

    $('#cust-24-visual-tab').addEventListener('click', () => mode(true));
    $('#cust-24-photo-tab').addEventListener('click', () => mode(false));
    $('#antkris-24-embroidery').addEventListener('click', () => mode(false));
    controls.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;
      if (button.id === 'antkris-24-autoplay') spin(!playing);
      else if (button.hasAttribute('data-hoodie-angle')) {spin(false); show(Number(button.dataset.hoodieAngle));}
    });
    slider.addEventListener('input', event => {spin(false); show(Number(event.target.value));});
    view.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      spin(false);
      startX = dragX = event.clientX;
      delta = 0;
      isDragging = true;
      try {view.setPointerCapture(event.pointerId);} catch {}
    });
    view.addEventListener('pointermove', event => {
      if (!isDragging) return;
      delta += event.clientX - dragX;
      dragX = event.clientX;
      while (Math.abs(delta) >= 11) {
        show(current + (delta < 0 ? 1 : -1));
        delta += delta < 0 ? 11 : -11;
      }
    });
    const endDrag = () => {isDragging = false; startX = null; delta = 0;};
    view.addEventListener('pointerup', endDrag);
    view.addEventListener('pointercancel', endDrag);
    view.addEventListener('lostpointercapture', endDrag);
    view.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        spin(false);
        show(current + (event.key === 'ArrowRight' ? 1 : -1));
        event.preventDefault();
      }
    });
    // Small image assets: preload in memory to eliminate blanks during fast swipes.
    for (const src of frames) { const image = new Image(); image.src = src; }
    mode(true);
    const originalClose = root.querySelector('[data-custom-close]');
    if(originalClose) originalClose.addEventListener('click', () => spin(false));
    window.addEventListener('pagehide', () => spin(false));
    document.addEventListener('visibilitychange', () => {
      if(document.hidden) spin(false);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();