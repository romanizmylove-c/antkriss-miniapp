/* ANTKRIS: optional 3D preview for the existing embroidery configurator.
   Real-time embroidery remains in the photo view; this GLB has no validated UV map. */
(() => {
  'use strict';
  const MODEL = 'assets/models/ANTKRIS_black_L_photo_projected.glb';
  let objectURL = null, viewer = null, status = null, filePrompt = null, auto = true;
  function database() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) return reject(new Error('No IndexedDB'));
      const req = indexedDB.open('antkris-3d', 1);
      req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains('garments')) req.result.createObjectStore('garments'); };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  async function cached() {
    const db = await database();
    try {
      return await new Promise((resolve, reject) => {
        const req = db.transaction('garments','readonly').objectStore('garments').get('black-L');
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    } finally { db.close(); }
  }
  async function save(file) {
    const db = await database();
    try {
      await new Promise((resolve,reject) => {
        const tx = db.transaction('garments','readwrite');
        tx.objectStore('garments').put(file,'black-L');
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } finally { db.close(); }
  }
  function message(value) { status.textContent = value; status.hidden = !value; }
  function source(url) {
    if (objectURL && objectURL !== url) URL.revokeObjectURL(objectURL);
    objectURL = url.startsWith('blob:') ? url : null;
    message('Загрузка 3D-модели…');
    filePrompt.hidden = true;
    viewer.setAttribute('src',url);
  }
  function mode(threeD) {
    const photo = document.querySelector('#antkris-customizer .cust-stage');
    const note = document.querySelector('#antkris-customizer .cust-figure-note');
    photo.hidden = threeD;
    if (note) note.hidden = threeD;
    document.getElementById('antkris-3d-stage').hidden = !threeD;
    document.getElementById('antkris-3d-controls').hidden = !threeD;
    document.getElementById('antkris-3d-note').hidden = !threeD;
    document.getElementById('antkris-photo-tab').setAttribute('aria-pressed',String(!threeD));
    document.getElementById('antkris-3d-tab').setAttribute('aria-pressed',String(threeD));
  }
  function boot() {
    const root = document.getElementById('antkris-customizer');
    if (!root || !root.querySelector('.cust-stage')) return;
    if (document.getElementById('antkris-3d-stage')) return;
    const photo = root.querySelector('.cust-stage');
    const tabs = document.createElement('div');
    tabs.className='antkris-3d-tabs';
    tabs.innerHTML='<button id="antkris-photo-tab" type="button" aria-pressed="true">Фото + вышивка</button><button id="antkris-3d-tab" type="button" aria-pressed="false">3D · 360°</button>';
    photo.before(tabs);
    const stage=document.createElement('div');
    stage.id='antkris-3d-stage';
    stage.className='antkris-3d-stage';
    stage.hidden=true;
    stage.innerHTML='<span class="antkris-3d-tag">ANTKRIS / ОБЗОР 360°</span>'+
      '<model-viewer id="antkris-3d-viewer" alt="Чёрное худи ANTKRIS в 3D" camera-controls auto-rotate auto-rotate-delay="0" rotation-per-second="18deg" interaction-prompt="none" environment-image="neutral" exposure="1.25" shadow-intensity="1" disable-pan camera-orbit="0deg 82deg auto"></model-viewer>'+
      '<p class="antkris-3d-status" id="antkris-3d-status" role="status">Поиск модели…</p>'+
      '<div class="antkris-3d-upload" id="antkris-3d-upload" hidden><b>Добавить худи в 3D</b><p>В этом браузере модель ещё не загружена. Выбери GLB — файл сохранится на устройстве для следующих просмотров.</p><label for="antkris-glb-input">Выбрать .GLB</label><input id="antkris-glb-input" type="file" accept=".glb,model/gltf-binary"></div>';
    photo.after(stage);
    const controls=document.createElement('div');
    controls.id='antkris-3d-controls';
    controls.className='antkris-3d-controls';
    controls.hidden=true;
    controls.innerHTML='<button type="button" data-view="front">Спереди</button><button type="button" data-view="back">Сзади</button><button type="button" data-view="spin">Пауза</button><button type="button" data-view="reset">Сбросить</button>';
    stage.after(controls);
    const note3d=document.createElement('p');
    note3d.id='antkris-3d-note';
    note3d.className='cust-figure-note antkris-3d-note';
    note3d.hidden=true;
    note3d.textContent='3D-модель — демонстрационная реконструкция; точность ткани и вышивки не подтверждена. Герб и надпись редактируются в режиме «Фото + вышивка».';
    controls.after(note3d);
    viewer=document.getElementById('antkris-3d-viewer');
    status=document.getElementById('antkris-3d-status');
    filePrompt=document.getElementById('antkris-3d-upload');
    document.getElementById('antkris-photo-tab').onclick=()=>mode(false);
    document.getElementById('antkris-3d-tab').onclick=()=>mode(true);
    viewer.addEventListener('load',()=>{message('');filePrompt.hidden=true;});
    viewer.addEventListener('error',()=>{message('Не удалось открыть модель.');filePrompt.hidden=false;});
    controls.addEventListener('click',e=>{
      const button=e.target.closest('button[data-view]');
      if(!button) return;
      const view=button.dataset.view;
      if(view==='spin'){auto=!auto;viewer.toggleAttribute('auto-rotate',auto);button.textContent=auto?'Пауза':'Вращать';}
      else {viewer.cameraOrbit=(view==='back'?'180deg':'0deg')+' 82deg auto';if(view==='reset')viewer.fieldOfView='30deg';if(typeof viewer.jumpCameraToGoal==='function')viewer.jumpCameraToGoal();}
    });
    document.getElementById('antkris-glb-input').onchange=async event=>{
      const file=event.target.files && event.target.files[0];
      if(!file) return;
      if(!file.name.toLowerCase().endsWith('.glb') || file.size>30e6){message('Нужен GLB размером до 30 МБ.');return;}
      source(URL.createObjectURL(file));mode(true);
      try{await save(file);}catch(e){console.warn('3D file will not persist on this browser',e);}
    };
    (async()=>{
      try{
        const head=await fetch(MODEL,{method:'HEAD',cache:'no-store'});
        if(head.ok && Number(head.headers.get('content-length')||100)>1000){source(MODEL);mode(true);return;}
      }catch(e){}
      try{
        const saved=await cached();
        if(saved instanceof Blob && saved.size>1000){source(URL.createObjectURL(saved));mode(true);return;}
      }catch(e){}
      message('');filePrompt.hidden=false;
    })();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();