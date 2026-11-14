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
      <div class="cust-stage" aria-label="Эскиз кастомного худи, вид сзади"><span class="cust-stage-tag">Вид сзади · эскиз</span>
      <svg class="cust-garment" viewBox="0 0 360 390" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs><linearGradient id="cg" x1="0" x2="1" y1="0" y2=".4"><stop stop-color="#15161a"/><stop offset=".38" stop-color="#292a2d"/><stop offset=".7" stop-color="#151518"/><stop offset="1" stop-color="#252628"/></linearGradient><linearGradient id="ch" x1="0" x2="1"><stop stop-color="#191a1b"/><stop offset=".5" stop-color="#303034"/><stop offset="1" stop-color="#191a1b"/></linearGradient></defs>
      <path d="M118 80 Q102 84 73 100 Q56 110 48 137 L13 250 Q7 267 18 273 L54 284 Q65 288 71 276 L102 199 L103 350 Q102 364 119 367 L241 367 Q258 366 257 348 L258 199 L289 276 Q294 289 306 284 L342 272 Q354 268 347 250 L312 137 Q304 108 285 99 L242 81 Q221 90 180 93 Q140 89 118 80 Z" fill="url(#cg)" stroke="#0f1114" stroke-width="3"/>
      <path d="M116 80 C123 44 142 28 180 24 C218 28 236 47 244 80 C229 108 213 123 180 126 C146 122 130 107 116 80 Z" fill="url(#ch)" stroke="#0b0d11" stroke-width="3"/>
      <path d="M119 79 Q151 105 180 105 Q208 105 242 80 Q221 132 180 135 Q140 130 119 79" fill="#101114" opacity=".95"/>
      <path d="M142 45 Q146 79 180 92 Q212 80 219 45" fill="none" stroke="#5b5c60" stroke-width="1" opacity=".38"/>
      <path d="M105 205 L103 349 L258 349 L256 206" fill="none" stroke="#4c4d50" stroke-width="1.5" opacity=".4"/>
      <path d="M103 349 H257 V364 Q180 371 103 364 Z" fill="#191a1c" stroke="#111" stroke-width="1.5"/>
      <path d="M17 262 L60 277 L54 287 L13 274Z M299 278 L345 262 L350 273 L304 287Z" fill="#191a1b" stroke="#131313" stroke-width="1.5"/>
      <path d="M78 114 Q88 155 76 219 M279 114 Q268 161 282 213" fill="none" stroke="#54555a" stroke-width="1.4" opacity=".25"/>
      <path d="M104 192 Q113 177 113 158 M258 192 Q246 173 248 158" fill="none" stroke="#666" opacity=".17"/>
      </svg>
      <div id="custom-crest" class="cust-crest" style="--thread:${COLORS.gold}" aria-hidden="true"></div>
      <div id="custom-preview-text" class="cust-text-preview" style="--letter:${COLORS.gold}" aria-hidden="true"></div>
      </div><p class="cust-figure-note">Условный эскиз. Итоговое расположение, цвет нитей и размер вышивки подтвердит мастер.</p>
      <div class="cust-panel"><div class="cust-section-title"><b>01. Основа</b><span>Чёрный</span></div><div class="cust-garment-choice"><img src="assets/hoodie_gold.jpg" alt="Пример чёрного худи ANTKRIS"/><div><strong>Худи ANTKRIS</strong><p>Чёрный · размер по запросу</p></div><span class="cust-check">✓</span></div><div class="cust-section-title"><b>Размер одежды</b><span>Уточняется в магазине</span></div><div class="cust-picks" id="cust-sizes" role="group" aria-label="Размер одежды">${SIZE_OPTIONS.map(s=>`<button type="button" class="cust-pick" data-custom-size="${s}" aria-pressed="false">${s}</button>`).join('')}</div></div>
      <div class="cust-divider"></div><div class="cust-panel"><div class="cust-section-title"><b>02. Герб</b><span>Вид сзади</span></div><div class="cust-picks" id="cust-crests" role="group" aria-label="Изображение герба"><button type="button" class="cust-pick" data-custom-crest="eagle" aria-pressed="true">Двуглавый орёл</button><button type="button" class="cust-pick" data-custom-crest="none" aria-pressed="false">Без герба</button></div><div id="cust-crest-options"><div class="cust-section-title" style="margin-top:17px"><b>Размер герба</b><span id="cust-size-value">23 см · ориентир</span></div><input class="cust-range" id="cust-crest-range" type="range" min="16" max="30" step="1" value="23" aria-label="Размер герба в сантиметрах"/><div class="cust-range-labels"><span>16 см</span><span>30 см</span></div><div class="cust-section-title" style="margin-top:19px"><b>Цвет вышивки</b><span>Под согласование</span></div><div class="cust-colors" id="cust-crest-colors">${swatches('crest-color','gold')}</div></div></div>
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
    const crest=get('#custom-crest',root);crest.hidden=state.type==='none';crest.style.width=(state.crestCm/30*35)+'%';crest.style.setProperty('--thread',COLORS[state.crestColor]);
    const txt=get('#custom-preview-text',root);txt.textContent=state.inscription;txt.style.setProperty('--letter',COLORS[state.inscriptionColor]);txt.classList.toggle('above',state.position==='above');txt.classList.toggle('no-crest',state.type==='none');
    const input=get('#cust-inscription',root);if(input.value!==state.inscription)input.value=state.inscription;
    get('#cust-char-count',root).textContent=state.inscription.length+' / 24';
    get('#cust-add',root).textContent=size?'Добавить эскиз в корзину →':'Выбрать размер и добавить →';
  }
  function open(index=-1){const root=get('#antkris-customizer');if(!root||!app())return;editing=index;const entry=index>=0?app().getCart()[index]:null;
    state=entry?.customization?{...INITIAL,...entry.customization}:{...INITIAL};size=entry?.size||app().getDefaultSize()||'';
    returnFocus=document.activeElement;root.hidden=false;document.body.classList.add('cust-open');get('#cust-scroll',root).scrollTop=0;sync();get('[data-custom-close]',root).focus();
  }
  function close(){const root=get('#antkris-customizer');root.hidden=true;document.body.classList.remove('cust-open');if(returnFocus?.isConnected)returnFocus.focus();returnFocus=null;}
  function add(){if(!size){get('#cust-sizes').scrollIntoView({behavior:'smooth',block:'center'});tip('Выберите размер худи');return;}
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