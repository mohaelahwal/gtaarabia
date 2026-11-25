const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const asset = path => new URL(path, import.meta.url).href;
const storageKey = 'gta-arabia-map-progress-v2';
const count = value => new Intl.NumberFormat('ar').format(value);

export function renderMapShell() {
  return `<section class="explorer" aria-label="خريطة ليونيدا التفاعلية" dir="rtl">
    <aside class="explorer-sidebar">
      <div class="explorer-brand"><img src="assets/logo.svg" alt="GTA Arabia"><div><h1>خريطة ليونيدا</h1><p>استكشف. اكتشف. احفظ تقدمك.</p></div><button class="explorer-close" data-explorer="sidebar" aria-label="إخفاء الفلاتر">×</button></div>
      <label class="explorer-search"><span>⌕</span><input type="search" data-explorer-search placeholder="ابحث عن موقع أو نشاط..." aria-label="البحث في المواقع والفئات"></label>
      <div class="explorer-actions"><button data-explorer="all">إظهار الكل</button><button data-explorer="none">إخفاء الكل</button></div>
      <div class="explorer-progress"><span>تم اكتشاف <strong data-found-count>٠</strong></span><span data-total-count>جاري التحميل</span><progress value="0" max="1" aria-label="تقدم الاستكشاف"></progress></div>
      <div class="explorer-switches"><label><input type="checkbox" data-hide-found> إخفاء المكتشف</label><label><input type="checkbox" data-favorites-only> المفضلة فقط</label></div>
      <div class="explorer-personal"><button data-explorer="personal">＋ علامتي الخاصة</button><button data-explorer="my-markers">علاماتي <span data-own-count>٠</span></button></div>
      <div class="explorer-results" data-search-results hidden aria-live="polite"></div>
      <div class="explorer-categories" data-map-categories><p class="explorer-loading" role="status">جاري تجهيز المواقع والفئات...</p></div>
      <div class="explorer-storage"><span data-storage-status>يُحفظ تقدمك في هذا المتصفح</span><div><button data-explorer="export">تصدير التقدم</button><label class="explorer-import">استيراد<input type="file" accept="application/json" data-progress-file hidden></label></div></div>
    </aside>
    <div class="explorer-stage">
      <div class="explorer-canvas" id="leonida-explorer-map" tabindex="0" aria-label="اسحب الخريطة للتحريك واستخدم زائد وناقص للتكبير"></div>
      <button class="explorer-filter-open" data-explorer="sidebar">☰ الفلاتر</button>
      <div class="explorer-tools"><button data-explorer="zoom-in" aria-label="تكبير">+</button><button data-explorer="zoom-out" aria-label="تصغير">−</button><button data-explorer="reset" aria-label="إظهار ليونيدا كاملة">⌖</button><button data-explorer="fullscreen" aria-label="ملء الشاشة">⛶</button></div>
      <div class="explorer-status" role="status" data-map-status>تحميل الخريطة...</div>
      <div class="explorer-credit">GTA Arabia · بيانات <a href="https://www.gtabase.com/gta-6/map/" target="_blank" rel="noopener noreferrer">GTABase / gtadb.org والمساهمون</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a> · الخريطة والصور © Rockstar Games</div>
    </div>
  </section>`;
}

let libraries;
function loadLibraries() {
  if (libraries) return libraries;
  for (const name of ['leaflet.css','markercluster.css','explorer.css']) {
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = asset('assets/map-kit/' + name);
    document.head.append(link);
  }
  const script = name => new Promise((resolve, reject) => {
    const element = document.createElement('script');
    element.src = asset('assets/map-kit/' + name);
    element.onload = resolve;
    element.onerror = () => reject(new Error('تعذر تحميل أدوات الخريطة. أعد المحاولة.'));
    document.head.append(element);
  });
  libraries = script('leaflet.js').then(() => script('markercluster.js')).catch(error => { libraries = null; throw error; });
  return libraries;
}

export function readMapProgress(storage) {
  const empty = {found:[],favorites:[],notes:{},personal:[],hidden:[],hideFound:false,favoritesOnly:false};
  try {
    const saved = JSON.parse((storage || globalThis.localStorage).getItem(storageKey) || '{}');
    for (const key of ['found','favorites','hidden']) if (Array.isArray(saved[key])) empty[key] = saved[key].filter(id => typeof id === 'string');
    if (saved.notes && typeof saved.notes === 'object' && !Array.isArray(saved.notes)) {
      empty.notes = Object.fromEntries(Object.entries(saved.notes).filter(([id,note]) => typeof note === 'string' && id.length < 150).map(([id,note]) => [id,note.slice(0,4000)]));
    }
    if (Array.isArray(saved.personal)) empty.personal = saved.personal.filter(p => typeof p.id === 'string' && /^personal-[a-zA-Z0-9-]{1,100}$/.test(p.id) && typeof p.name === 'string' && Number.isFinite(p.x) && Number.isFinite(p.y) && Math.abs(p.x) <= 16384 && Math.abs(p.y) <= 16384).map(p => ({id:p.id,name:p.name.slice(0,160),nameAr:p.name.slice(0,160),x:p.x,y:p.y,category:'personal'}));
    empty.hideFound = saved.hideFound === true;
    empty.favoritesOnly = saved.favoritesOnly === true;
  } catch {}
  return empty;
}

export function normalizeMapSearch(text) {
  return String(text || '').toLowerCase().normalize('NFKD').replace(/[\u064b-\u065f\u0670]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي');
}

export function selectMapLocations(markers, {query='',hidden=[],hideFound=false,favoritesOnly=false,found=[],favorites=[]}, categoryById) {
  const words = normalizeMapSearch(query);
  const excluded = new Set(hidden), discovered = new Set(found), starred = new Set(favorites);
  return markers.filter(marker => {
    const category = categoryById[marker.category] || {};
    return !excluded.has(marker.category) && (!hideFound || !discovered.has(marker.id)) &&
      (!favoritesOnly || starred.has(marker.id)) &&
      (!words || normalizeMapSearch([marker.name,marker.nameAr,category.name,category.nameAr].join(' ')).includes(words));
  });
}

export function mountMap({main,share}) {
  main.innerHTML = renderMapShell();
  const root = main.querySelector('.explorer');
  if (window.matchMedia('(max-width:800px)').matches) root.classList.add('sidebar-collapsed');
  const $ = selector => root.querySelector(selector);
  let disposed = false, map, observer, popup, adding = false, searchTimer;
  const abort = new AbortController();
  const state = readMapProgress();
  function save() {
    try { localStorage.setItem(storageKey,JSON.stringify(state)); $('[data-storage-status]').textContent = 'يُحفظ تقدمك في هذا المتصفح'; }
    catch { $('[data-storage-status]').textContent = 'تعذر الحفظ محلياً؛ صدّر تقدمك للاحتفاظ به'; }
  }
  async function start() {
    const [data,symbols] = await Promise.all([
      fetch(asset('data/map-explorer.json'),{signal:abort.signal}).then(r => {if(!r.ok) throw Error('تعذر تحميل المواقع'); return r.json();}),
      fetch(asset('assets/map-kit/symbols.json'),{signal:abort.signal}).then(r => r.json()),
      loadLibraries()
    ]);
    if (disposed) return;
    const L = window.L;
    const categories = [...data.categories,{id:'personal',name:'Personal',nameAr:'علاماتي الخاصة',group:'properties',color:'#fa42bd',icon:'personal'}];
    const byCategory = Object.fromEntries(categories.map(c => [c.id,c]));
    const byGroup = Object.fromEntries(data.groups.map(g => [g.id,g]));
    const totalByCategory = {};
    data.markers.forEach(m => { totalByCategory[m.category] = (totalByCategory[m.category] || 0) + 1; });
    const lookup = new Map(data.markers.map(m => [m.id,m]));
    const allMarkers = () => [...data.markers,...state.personal];
    const getLocation = id => lookup.get(id) || state.personal.find(m => m.id === id);
    const worldBounds = L.latLngBounds([[-10112,-12032],[12032,5120]]);
    const crs = L.extend({},L.CRS.Simple,{transformation:new L.Transformation(1/32,512,-1/32,512)});
    map = L.map($('#leonida-explorer-map'),{crs,zoomControl:false,attributionControl:false,minZoom:0,maxZoom:7,maxBounds:worldBounds.pad(0.25),zoomSnap:0.25,preferCanvas:true});
    const TileLayer = L.TileLayer.extend({
      getTileUrl(coords) {
        const file = coords.z + '/' + coords.z + ',' + coords.y + ',' + coords.x + '.jpg';
        return coords.z <= 3 ? asset('assets/map-kit/tiles/' + file) : 'https://www.gtabase.com/images/gta-6/maps/tiles/in-game/' + file;
      }
    });
    new TileLayer('',{tileSize:256,minNativeZoom:0,maxNativeZoom:6,bounds:worldBounds,keepBuffer:2,errorTileUrl:asset('assets/map-kit/sea.svg')}).addTo(map);
    const viewAll = () => map.fitBounds(worldBounds,{padding:[20,20],animate:false});
    viewAll();
    const clusters = L.markerClusterGroup({
      maxClusterRadius:35,disableClusteringAtZoom:4,showCoverageOnHover:false,spiderfyOnMaxZoom:true,
      iconCreateFunction: cluster => L.divIcon({html:`<span>${count(cluster.getChildCount())}</span>`,className:'explorer-cluster',iconSize:[38,38]})
    }).addTo(map);
    function iconHTML(category) {
      const symbol = symbols[category.icon];
      if (symbol?.img) return `<img src="${asset('assets/map-kit/icons/' + symbol.img)}" alt="" width="24" height="24">`;
      if (symbol?.paths?.length) return `<svg viewBox="${esc(symbol.viewBox)}" aria-hidden="true">${symbol.paths.map(path=>`<path d="${esc(path)}"/>`).join('')}</svg>`;
      return '<span aria-hidden="true">★</span>';
    }
    const markers = new Map();
    function createMarker(record) {
      const category = byCategory[record.category];
      const color = category.color || byGroup[category.group]?.color || '#fa42bd';
      const discovered = state.found.includes(record.id);
      const marker = L.marker([record.y,record.x],{
        title:record.nameAr || record.name,
        icon:L.divIcon({html:`<span class="explorer-pin ${discovered?'is-found':''}" style="--pin-color:${color}">${iconHTML(category)}${discovered?'<b>✓</b>':''}</span>`,className:'explorer-pin-wrap',iconSize:[29,29],iconAnchor:[14,25]})
      }).on('click',() => open(record.id));
      return marker;
    }
    function updateCounts() {
      const found = new Set(state.found);
      $('[data-found-count]').textContent = count(data.markers.filter(m=>found.has(m.id)).length);
      $('[data-total-count]').textContent = 'من ' + count(data.markers.length) + ' موقع';
      $('progress').max = data.markers.length;
      $('progress').value = data.markers.filter(m=>found.has(m.id)).length;
      $('[data-own-count]').textContent = count(state.personal.length);
      categories.forEach(category => {
        const records = category.id === 'personal' ? state.personal : data.markers.filter(m=>m.category===category.id);
        const node = root.querySelector(`[data-category-count="${category.id}"]`);
        if(node) node.textContent = count(records.filter(m=>found.has(m.id)).length)+' / '+count(records.length);
      });
    }
    function renderCategories() {
      $('[data-map-categories]').innerHTML = data.groups.map(group => {
        const list = categories.filter(c=>c.group===group.id && (totalByCategory[c.id] || c.id==='personal'));
        return `<details class="explorer-group" open><summary><strong>${esc(group.nameAr)}</strong><label title="تبديل المجموعة"><input type="checkbox" data-group="${group.id}" ${list.every(c=>!state.hidden.includes(c.id))?'checked':''} aria-label="إظهار أو إخفاء ${esc(group.nameAr)}"></label></summary><div>${list.map(category=>`<div class="explorer-category"><label><input type="checkbox" data-category="${category.id}" ${state.hidden.includes(category.id)?'':'checked'}><span class="explorer-category-icon" style="color:${category.color || group.color}">${iconHTML(category)}</span><span>${esc(category.nameAr)}</span></label><span class="explorer-category-count" data-category-count="${category.id}"></span><button data-next-category="${category.id}" title="الموقع التالي" aria-label="انتقل إلى موقع من ${esc(category.nameAr)}">‹</button></div>`).join('')}</div></details>`;
      }).join('');
      updateCounts();
    }
    function render() {
      if(disposed) return;
      const query = $('[data-explorer-search]').value;
      const visible = selectMapLocations(allMarkers(),{...state,query},byCategory);
      clusters.clearLayers();
      clusters.addLayers(visible.map(record => {
        if(!markers.has(record.id)) markers.set(record.id,createMarker(record));
        return markers.get(record.id);
      }));
      $('[data-map-status]').textContent = count(visible.length)+' موقع ظاهر';
      const searching = query.trim().length > 0;
      $('[data-search-results]').hidden = !searching;
      $('[data-map-categories]').hidden = searching;
      if(searching) $('[data-search-results]').innerHTML = visible.length
        ? `<p>${count(visible.length)} نتيجة</p>`+visible.slice(0,60).map(m=>`<button data-open-location="${m.id}"><strong>${esc(m.nameAr)}</strong><span>${esc(byCategory[m.category].nameAr)}</span></button>`).join('')
        : '<p>لا توجد مواقع مطابقة. جرّب إظهار الكل أو تغيير البحث.</p>';
      updateCounts();
    }
    function open(id) {
      const record = getLocation(id);
      if(!record) return;
      const category = byCategory[record.category];
      const found = state.found.includes(id), favorite = state.favorites.includes(id);
      const photo = record.image_small || record.image;
      const note = state.notes[id] || '';
      const original = record.description && record.description !== record.descriptionAr
        ? `<details class="explorer-original"><summary>تفاصيل المصدر الأصلية</summary><p lang="en" dir="ltr">${esc(record.description)}</p></details>` : '';
      const html = `<article class="explorer-popup" dir="rtl">${photo?`<img class="explorer-popup-photo" src="${esc(photo)}" alt="${esc(record.nameAr)}" loading="lazy" onerror="this.hidden=true">`:''}<div class="explorer-popup-body"><small>${esc(category.nameAr)}</small><h2>${esc(record.nameAr || record.name)}</h2>${record.nameAr!==record.name?`<p class="explorer-original-name" dir="ltr">${esc(record.name)}</p>`:''}<p>${esc(record.descriptionAr || 'علامتك الخاصة على خريطة ليونيدا.')}</p>${record.facts?.length?`<dl>${record.facts.map(f=>`<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl>`:''}${original}<div class="explorer-popup-actions"><button data-toggle-found="${id}" aria-pressed="${found}">${found?'✓ تم اكتشافه':'تحديد كمكتشف'}</button><button data-toggle-favorite="${id}" aria-pressed="${favorite}" aria-label="المفضلة">${favorite?'★':'☆'}</button><button data-share-location="${id}" aria-label="مشاركة الموقع">مشاركة</button></div><label class="explorer-note-label">ملاحظتي<textarea maxlength="4000" data-note="${id}" placeholder="اكتب ملاحظة لهذا الموقع...">${esc(note)}</textarea></label><button class="explorer-save-note" data-save-note="${id}">حفظ الملاحظة</button>${record.category==='personal'?`<button class="explorer-delete" data-delete-location="${id}">حذف علامتي</button>`:''}${record.shot_by?`<p class="explorer-photo-credit">الصورة: ${esc(record.shot_by)}</p>`:''}</div></article>`;
      popup = L.popup({maxWidth:340,minWidth:250,autoPan:true,className:'explorer-leaflet-popup'}).setLatLng([record.y,record.x]).setContent(html).openOn(map);
      const url = new URL(location.href); url.searchParams.set('location',id);
      history.replaceState(history.state,'',url);
    }
    function focus(id) {
      const record = getLocation(id);
      if(!record) return;
      if(state.hidden.includes(record.category)) state.hidden = state.hidden.filter(c=>c!==record.category);
      $('[data-explorer-search]').value='';
      state.hideFound=false; state.favoritesOnly=false;
      $('[data-hide-found]').checked=false; $('[data-favorites-only]').checked=false;
      save(); renderCategories();render();
      const marker = markers.get(id);
      map.setView([record.y,record.x],Math.max(4,map.getZoom()),{animate:false});
      clusters.zoomToShowLayer(marker,()=>open(id));
    }
    renderCategories();render();
    $('[data-hide-found]').checked = state.hideFound;
    $('[data-favorites-only]').checked = state.favoritesOnly;
    root.addEventListener('change',event=>{
      const input=event.target;
      if(input.matches('[data-category]')) {
        state.hidden = state.hidden.filter(id=>id!==input.dataset.category);
        if(!input.checked) state.hidden.push(input.dataset.category);
      } else if(input.matches('[data-group]')) {
        const ids=categories.filter(c=>c.group===input.dataset.group).map(c=>c.id);
        state.hidden=state.hidden.filter(id=>!ids.includes(id));
        if(!input.checked) state.hidden.push(...ids);
      } else if(input.matches('[data-hide-found]')) state.hideFound=input.checked;
      else if(input.matches('[data-favorites-only]')) state.favoritesOnly=input.checked;
      else return;
      save();renderCategories();render();
    },{signal:abort.signal});
    root.addEventListener('input',event=>{
      if(!event.target.matches('[data-explorer-search]'))return;
      clearTimeout(searchTimer);searchTimer=setTimeout(render,140);
    },{signal:abort.signal});
    root.addEventListener('click',async event=>{
      const target=event.target.closest('button');
      if(!target) return;
      if(target.dataset.openLocation) focus(target.dataset.openLocation);
      if(target.dataset.nextCategory) {
        const records=allMarkers().filter(m=>m.category===target.dataset.nextCategory);
        const next=records.find(m=>!state.found.includes(m.id)) || records[0];
        if(next) focus(next.id);
      }
      const toggle=(key,id)=>{state[key]=state[key].includes(id)?state[key].filter(x=>x!==id):[...state[key],id];save();};
      if(target.dataset.toggleFound) {
        const id=target.dataset.toggleFound;
        toggle('found',id); markers.delete(id);render();open(id);
      }
      if(target.dataset.toggleFavorite){toggle('favorites',target.dataset.toggleFavorite);render();open(target.dataset.toggleFavorite);}
      if(target.dataset.saveNote){const id=target.dataset.saveNote;state.notes[id]=root.querySelector('[data-note]').value;save();target.textContent='تم الحفظ';}
      if(target.dataset.shareLocation){
        const id=target.dataset.shareLocation;const url=new URL(location.href);url.searchParams.set('location',id);
        share((getLocation(id)?.nameAr || 'موقع')+' | GTA Arabia',url.href);
      }
      if(target.dataset.deleteLocation){
        const id=target.dataset.deleteLocation;state.personal=state.personal.filter(m=>m.id!==id);state.found=state.found.filter(x=>x!==id);state.favorites=state.favorites.filter(x=>x!==id);delete state.notes[id];markers.delete(id);save();map.closePopup();renderCategories();render();
      }
      if(target.dataset.savePersonal){
        const name=root.querySelector('[data-personal-name]').value.trim();
        if(!name){root.querySelector('[data-personal-name]').focus();return;}
        const record={id:'personal-'+crypto.randomUUID(),name,nameAr:name,category:'personal',x:Number(target.dataset.x),y:Number(target.dataset.y)};
        state.personal.push(record);save();map.closePopup();renderCategories();focus(record.id);
      }
      const action=target.dataset.explorer;
      if(action==='all'||action==='none'){state.hidden=action==='all'?[]:categories.map(c=>c.id);save();renderCategories();render();}
      if(action==='sidebar'){root.classList.toggle('sidebar-collapsed');setTimeout(()=>map.invalidateSize(),220);}
      if(action==='zoom-in')map.zoomIn();
      if(action==='zoom-out')map.zoomOut();
      if(action==='reset')viewAll();
      if(action==='fullscreen'){
        if(document.fullscreenElement)await document.exitFullscreen();
        else try{await root.requestFullscreen();}catch{root.classList.toggle('explorer-screen');map.invalidateSize();}
      }
      if(action==='personal'){adding=!adding;$('[data-map-status]').textContent=adding?'اضغط على الخريطة لوضع علامتك':'تم إلغاء الإضافة';target.classList.toggle('active',adding);}
      if(action==='my-markers'){state.hidden=categories.filter(c=>c.id!=='personal').map(c=>c.id);save();renderCategories();render();if(state.personal[0])map.setView([state.personal[0].y,state.personal[0].x],4);}
      if(action==='export'){
        const blob=new Blob([JSON.stringify({version:2,...state},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='gta-arabia-map-progress.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      }
    },{signal:abort.signal});
    $('[data-progress-file]').addEventListener('change',async event=>{
      const file=event.target.files[0];if(!file)return;
      try{
        if(file.size>2e6)throw Error('large');
        const content=await file.text();const parsed=JSON.parse(content);
        if(!parsed || !Array.isArray(parsed.found))throw Error('invalid');
        Object.assign(state,readMapProgress({getItem:()=>content}));markers.clear();save();renderCategories();render();
        $('[data-hide-found]').checked=state.hideFound;$('[data-favorites-only]').checked=state.favoritesOnly;
        $('[data-map-status]').textContent='تم استيراد تقدمك';
      }catch{$('[data-map-status]').textContent='تعذر استيراد الملف. اختر ملف تقدم صالحاً.';}
      event.target.value='';
    },{signal:abort.signal});
    map.on('click',event=>{
      if(!adding)return;adding=false;root.querySelector('[data-explorer="personal"]').classList.remove('active');
      const {lat:y,lng:x}=event.latlng;
      if(!worldBounds.contains(event.latlng)){ $('[data-map-status]').textContent='اختر موقعاً داخل حدود ليونيدا';return; }
      L.popup({className:'explorer-leaflet-popup'}).setLatLng(event.latlng).setContent(`<div class="explorer-popup-body" dir="rtl"><h2>علامتي الخاصة</h2><label>اسم الموقع<input data-personal-name maxlength="160" placeholder="مثلاً: مكان الاختباء"></label><button data-save-personal="true" data-x="${x}" data-y="${y}">حفظ العلامة</button></div>`).openOn(map);
    });
    observer = new ResizeObserver(()=>map.invalidateSize());observer.observe($('.explorer-stage'));
    const initial=new URLSearchParams(location.search).get('location');
    if(initial)focus(initial);
  }
  start().catch(error=>{
    if(disposed || error.name==='AbortError')return;
    $('[data-map-status]').textContent=error.message;
    $('[data-map-categories]').innerHTML='<p class="explorer-loading">تعذر تحميل الخريطة. تحقق من اتصالك ثم أعد تحميل الصفحة.</p>';
  });
  return ()=>{
    disposed=true;abort.abort();clearTimeout(searchTimer);observer?.disconnect();map?.remove();
  };
}
