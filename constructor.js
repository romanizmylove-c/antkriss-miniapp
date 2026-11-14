/* ANTKRIS · optional personalized embroidery configurator, no checkout/payment integration. */
(() => {
  'use strict';
  const COLOR_NAMES = {gold:'Золото',silver:'Серебро',white:'Белый',red:'Бордовый'};
  const COLORS = {gold:'#d8ae58',silver:'#c3c8d0',white:'#f4f4f0',red:'#a73745'};
  const SIZE_OPTIONS = ['S','M','L','XL','XXL'];
  const INITIAL = Object.freeze({type:'eagle',crestCm:23,crestColor:'gold',inscription:'',inscriptionColor:'gold',position:'below'});
  let state={...INITIAL},size='',editing=-1,returnFocus=null;
  const get=(sel,root=document)=>root.querySelector(sel);
  const getAll=(sel,root=document)=>Array.from(root.querySelectorAll(sel));
  const safe=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const app=()=>window.ANTKRIS_CUSTOMIZER_BRIDGE;
  const maskSource='assets/eagle-embroidery-mask.png';
  const swatches=(attribute,selected)=>Object.keys(COLORS).map(c=>`<button class="cust-swatch" data-custom-${attribute}="${c}" style="--swatch:${COLORS[c]}" aria-pressed="${c===selected}" type="button">${COLOR_NAMES[c]}</button>`).join('');
  function markup(){return `<section id="antkris-customizer" class="cust-screen" hidden role="dialog" aria-modal="true" aria-label="Конструктор худи">
    <header class="cust-top"><button type="button" data-custom-close aria-label="Вернуться назад">← Назад</button><h1>Конструктор</h1><button type="button" class="cust-help" data-custom-info>Помощь</button></header>
    <div class="cust-scroll" id="cust-scroll">
      <div class="cust-heading"><div><p>ANTKRIS / СВОЙ ДИЗАЙН</p><h2>Худи с вышивкой</h2></div><p>01 / 01</p></div>
      <div class="cust-stage" aria-label="Эскиз кастомного худи, вид сзади"><span class="cust-stage-tag">Вид сзади · фото изделия</span>
      <img class="cust-garment-photo" src="assets/hoodie-back-photo.jpg" alt="Чёрное худи ANTKRIS, фотография спинки" loading="eager" decoding="async"/>
      <img id="custom-crest" class="cust-crest" src="assets/crest-stitch-gold.webp" alt="Герб из реальной вышивки ANTKRIS" draggable="false"/>
      <div id="custom-preview-text" class="cust-text-preview" style="--letter:${COLORS.gold}" aria-hidden="true"></div>
      </div><p class="cust-figure-note">Фотография худи и фрагмент настоящей вышивки ANTKRIS. Посадка и масштаб приблизительные; параметры подтвердит мастер.</p>
      <details class="cust-reference"><summary>Посмотреть оригинальную вышивку ↗</summary><img src="assets/embroidery-reference.jpg" alt="Фото вышивки на изделии ANTKRIS" loading="lazy"/><p>На фото отмечено: 26 см - ширина надписи, 29 см - общая высота композиции. Это ориентир для предпросмотра, не подтверждённые лимиты производства.</p></details><div class="cust-panel"><div class="cust-section-title"><b>01. Основа</b><span>Чёрный</span></div><div class="cust-garment-choice"><img src="assets/hoodie-back-photo.jpg" alt="Чёрное худи, вид сзади"/><div><strong>Худи ANTKRIS</strong><p>Чёрный · размер по запросу</p></div><span class="cust-check">✓</span></div><div class="cust-section-title"><b>Размер одежды</b><span>Уточняется в магазине</span></div><div class="cust-picks" id="cust-sizes" role="group" aria-label="Размер одежды">${SIZE_OPTIONS.map(s=>`<button type="button" class="cust-pick" data-custom-size="${s}" aria-pressed="false">${s}</button>`).join('')}</div></div>
      <div class="cust-divider"></div><div class="cust-panel"><div class="cust-section-title"><b>02. Герб</b><span>Вид сзади</span></div><div class="cust-picks" id="cust-crests" role="group" aria-label="Изображение герба"><button type="button" class="cust-pick" data-custom-crest="eagle" aria-pressed="true">Двуглавый орёл</button><button type="button" class="cust-pick" data-custom-crest="none" aria-pressed="false">Без герба</button></div><div id="cust-crest-options"><div class="cust-section-title" style="margin-top:17px"><b>Ширина герба</b><span id="cust-size-value">23 см · ориентир</span></div><input class="cust-range" id="cust-crest-range" type="range" min="16" max="26" step="1" value="23" aria-label="Размер герба в сантиметрах"/><div class="cust-range-labels"><span>16 см</span><span>26 см</span></div><div class="cust-section-title" style="margin-top:19px"><b>Цвет основной нити</b><span>Под согласование</span></div><p class="cust-figure-note" style="text-align:left;margin:-3px 0 10px">Золотой вариант показан по реальному образцу. Серебро, белый и бордовый - визуальные варианты для согласования с мастерской.</p><div class="cust-colors" id="cust-crest-colors">${swatches('crest-color','gold')}</div></div></div>
      <div class="cust-divider"></div><div class="cust-panel"><div class="cust-section-title"><b>03. Своя надпись</b><span>Необязательно</span></div><label for="cust-inscription" class="cust-figure-note" style="display:block;text-align:left;margin:0 0 9px">Текст будет вышит вместе с гербом или отдельно.</label><input type="text" id="cust-inscription" class="cust-input" placeholder="Например: СВОЙ ПУТЬ" maxlength="24" autocomplete="off"/><span id="cust-char-count" class="cust-char-count">0 / 24</span><div class="cust-section-title" style="margin-top:13px"><b>Цвет надписи</b><span>Под согласование</span></div><div class="cust-colors" id="cust-text-colors">${swatches('text-color','gold')}</div><div class="cust-section-title" style="margin-top:16px"><b>Расположение</b></div><div class="cust-select-row"><button type="button" class="cust-pick" data-custom-position="above" aria-pressed="false">Над гербом</button><button type="button" class="cust-pick" data-custom-position="below" aria-pressed="true">Под гербом</button></div></div>
      <div class="cust-divider"></div><p class="cust-warning">Это предварительная визуализация, не производственный макет. Наличие худи, техническая возможность вышивки, точные цвета нитей и итоговая стоимость согласовываются с магазином до оплаты.</p>
    </div><footer class="cust-footer"><div class="cust-footer-row"><span>Индивидуальная вышивка</span><strong>Цена по запросу</strong></div><button class="cust-primary" type="button" id="cust-add">Добавить эскиз в корзину →</button></footer>
  </section>`}
  function sync(){const root=get('#antkris-customizer');if(!root)return;
    getAll('[data-custom-size]',root).forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.customSize===size)));
    getAll('[data-custom-crest]',root).forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.customCrest===state.type)));
    getAll('[data-custom-crest-color]',root).forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.customCrestColor===state.crestColor)));
    getAll('[data-custom-text-color]',root).forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.customTextColor===state.inscriptionColor)));
    getAll('[data-custom-position]',root).forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.customPosition===state.position)));
    get('#cust-crest-options',root).hidden=state.type==='none';
    get('#cust-crest-range',root).value=String(state.crestCm);
    get('#cust-size-value',root).textContent=state.crestCm+' см · ориентир';
    const crest=get('#custom-crest',root);crest.hidden=state.type==='none';crest.style.width=(state.crestCm/26*34)+'%';crest.src='assets/crest-stitch-'+(COLORS[state.crestColor]?state.crestColor:'gold')+'.webp';crest.classList.toggle('with-text-above',Boolean(state.inscription)&&state.position==='above');crest.classList.toggle('with-text-below',Boolean(state.inscription)&&state.position==='below');
    const txt=get('#custom-preview-text',root);txt.textContent=state.inscription;txt.style.setProperty('--letter',COLORS[state.inscriptionColor]);txt.classList.toggle('above',state.position==='above');txt.classList.toggle('no-crest',state.type==='none');txt.hidden=!state.inscription;
    const input=get('#cust-inscription',root);if(input.value!==state.inscription)input.value=state.inscription;
    get('#cust-char-count',root).textContent=state.inscription.length+' / 24';
    get('#cust-add',root).textContent=size?'Добавить эскиз в корзину →':'Выбрать размер и добавить →';
  }
  function open(index=-1){const root=get('#antkris-customizer');if(!root||!app())return;editing=index;const entry=index>=0?app().getCart()[index]:null;
    state=entry?.customization?{...INITIAL,...entry.customization}:{...INITIAL};state.crestCm=Math.max(16,Math.min(26,Number(state.crestCm)||23));size=entry?.size||app().getDefaultSize()||'';
    returnFocus=document.activeElement;root.hidden=false;document.body.classList.add('cust-open');get('#cust-scroll',root).scrollTop=0;sync();get('[data-custom-close]',root).focus();
  }
  function close(){const root=get('#antkris-customizer');root.hidden=true;document.body.classList.remove('cust-open');if(returnFocus?.isConnected)returnFocus.focus();returnFocus=null;}
  function add(){if(state.type==='none'&&!state.inscription.trim()){tip('Добавьте герб или собственную надпись');return;}if(!size){get('#cust-sizes').scrollIntoView({behavior:'smooth',block:'center'});tip('Выберите размер худи');return;}
    const config=app().normalize({...state});const list=app().getCart();if(editing>=0&&list[editing]){const old=list[editing];old.size=size;old.customization=config;const key=app().itemKey(old);const duplicate=list.findIndex((x,i)=>i!==editing&&app().itemKey(x)===key);if(duplicate>=0){list[duplicate].qty=Math.min(10,list[duplicate].qty+old.qty);list.splice(editing,1)}}else{
      const entry={id:'hoodie',size,qty:1,customization:config},key=app().itemKey(entry);const same=list.find(x=>app().itemKey(x)===key);if(same)same.qty=Math.min(10,same.qty+1);else list.push(entry);
    }
    app().save();app().updateBadges();close();app().navigate('cart');tip('Эскиз добавлен в корзину');
  }
  function tip(message){const root=get('#antkris-customizer');const old=get('.cust-toast',root);old?.remove();if(root.hidden){app()?.toast(message);return;}const n=document.createElement('div');n.className='cust-toast';n.role='status';n.textContent=message;root.appendChild(n);setTimeout(()=>n.remove(),2300)}
  function bootstrap(){if(get('#antkris-customizer'))return;document.body.insertAdjacentHTML('beforeend',markup());
    const home=get('.home-categories');if(home&&!get('.home-constructor'))home.insertAdjacentHTML('afterend',`<div class="home-constructor"><button type="button" data-custom-open class="cust-launch" style="width:100%"><span><span class="eyebrow">ПЕРСОНАЛИЗАЦИЯ</span><strong>Создай своё худи</strong><small>Размер герба · цвет нитей · своя надпись</small></span><span class="cust-arrow" aria-hidden="true">↗</span></button></div>`);
    const detail=get('[data-screen="detail"] .detail-info');if(detail){detail.insertAdjacentHTML('beforeend',`<button type="button" data-custom-open class="cust-launch" style="width:100%"><span><strong>Настроить вышивку</strong><small>Измени герб и добавь свою надпись</small></span><span class="cust-arrow">↗</span></button>`)}
    document.addEventListener('click',e=>{const launch=e.target.closest('[data-custom-open]');if(launch){e.preventDefault();e.stopPropagation();open();return}
      const edit=e.target.closest('[data-custom-edit]');if(edit){e.preventDefault();e.stopPropagation();open(Number(edit.dataset.customEdit));return}
      const root=get('#antkris-customizer');if(root.hidden||!root.contains(e.target))return;
      const btn=e.target.closest('button');if(!btn)return;
      if(btn.hasAttribute('data-custom-close')){close();return}
      if(btn.hasAttribute('data-custom-info')){tip('Это эскиз. Точный цвет и размер вышивки подтвердит магазин.');return}
      if(btn.hasAttribute('data-custom-size'))size=btn.dataset.customSize;
      if(btn.hasAttribute('data-custom-crest'))state.type=btn.dataset.customCrest;
      if(btn.hasAttribute('data-custom-crest-color'))state.crestColor=btn.dataset.customCrestColor;
      if(btn.hasAttribute('data-custom-text-color'))state.inscriptionColor=btn.dataset.customTextColor;
      if(btn.hasAttribute('data-custom-position'))state.position=btn.dataset.customPosition;
      if(btn.id==='cust-add'){add();return}sync();
    },true);
    get('#cust-inscription').addEventListener('input',e=>{state.inscription=e.target.value.replace(/[\r\n<>]/g,'').slice(0,24);sync()});
    get('#cust-crest-range').addEventListener('input',e=>{state.crestCm=Number(e.target.value);sync()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!get('#antkris-customizer').hidden){e.preventDefault();close()}});
    window.addEventListener('hashchange',()=>{if(!get('#antkris-customizer').hidden)close()});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootstrap,{once:true});else bootstrap();
})();