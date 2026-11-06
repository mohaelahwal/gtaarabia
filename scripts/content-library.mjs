import {createHash} from 'node:crypto';
import {allowedURL,normalizedTitle,escapeHTML as esc} from './news-sources.mjs';
import {validatePost} from './validate.mjs';
export const categories=['news','videos','vehicles','weapons','characters','locations','events'];
export const labels={news:'الأخبار',videos:'الفيديوهات',vehicles:'المركبات',weapons:'الأسلحة',characters:'الشخصيات',locations:'مواقع الخريطة',events:'الفعاليات'};
export function youtubeID(value){try{const u=new URL(value);if(u.protocol!=='https:')return null;const id=u.hostname==='youtu.be'?u.pathname.slice(1):['www.youtube.com','youtube.com','www.youtube-nocookie.com'].includes(u.hostname)?(u.searchParams.get('v')||u.pathname.match(/^\/(?:embed|shorts)\/([\w-]{11})/)?.[1]):null;return /^[\w-]{11}$/.test(id||'')?id:null}catch{return null}}
export function extractMedia(html,base){
 const images=new Set(),videos=new Set();
 const add=(v,image=false)=>{try{const u=new URL(v.replace(/&amp;/g,'&'),base).href;const id=youtubeID(u);if(id)videos.add('https://www.youtube.com/watch?v='+id);else if(image&&u.startsWith('https:'))images.add(u)}catch{}};
 for(const m of html.matchAll(/<(?:meta|img|iframe|a|source)\b[^>]*>/gi)){
  const attrs=Object.fromEntries([...m[0].matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map(x=>[x[1].toLowerCase(),x[2]]));
  if(/^(og:image(?::url)?|twitter:image)$/.test(attrs.property||attrs.name||''))add(attrs.content||'',true);
  for(const k of ['src','data-src','href'])if(attrs[k])add(attrs[k],/^<img/i.test(m[0]));
 }
 for(const m of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi))try{const walk=(o,key='')=>{if(typeof o==='string'&&['image','thumbnailUrl','embedUrl','contentUrl'].includes(key))add(o,key==='image'||key==='thumbnailUrl');else if(Array.isArray(o))o.forEach(v=>walk(v,key));else if(o&&typeof o==='object')for(const [k,v]of Object.entries(o))walk(v,k==='url'&&key==='image'?'image':k)};walk(JSON.parse(m[1]))}catch{}
 return {images:[...images].slice(0,30),videos:[...videos].slice(0,12)};
}
export async function boundedFetch(url,hosts,fetchImpl,max=12000000){
 for(let i=0;i<5;i++){
  if(!allowedURL(url,hosts))throw Error('Unapproved media host');
  const r=await fetchImpl(url,{redirect:'manual',signal:AbortSignal.timeout(25000)});
  if(r.status>=300&&r.status<400&&r.headers.get('location')){url=new URL(r.headers.get('location'),url).href;continue}
  if(!r.ok)throw Error('Media HTTP '+r.status);
  if(Number(r.headers.get('content-length'))>max)throw Error('Media too large');
  const chunks=[];let size=0;for await(const chunk of r.body){size+=chunk.length;if(size>max)throw Error('Media too large');chunks.push(Buffer.from(chunk))}
  return {bytes:Buffer.concat(chunks),type:r.headers.get('content-type')||''};
 }throw Error('Too many media redirects');
}
export async function fetchImage(url,hosts,fetchImpl){
 const {bytes,type}=await boundedFetch(url,hosts,fetchImpl);
 const ext=bytes[0]===255&&bytes[1]===216&&bytes[2]===255?'jpg':bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))?'png':bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP'?'webp':null;
 if(!ext||!/^image\//i.test(type)||bytes.length<1000)throw Error('Invalid or undersized image');
 return {bytes,ext};
}
export async function verifyVideo(url,fetchImpl){
 const id=youtubeID(url);if(!id)throw Error('Unsupported video URL');
 const r=await boundedFetch('https://www.youtube.com/oembed?url='+encodeURIComponent('https://www.youtube.com/watch?v='+id)+'&format=json',['www.youtube.com'],fetchImpl,100000);
 const v=JSON.parse(r.bytes.toString());
 if(v.type!=='video'||!v.title||!v.author_name||!v.html?.includes('/embed/'+id))throw Error('Video embedding unavailable');
 return {id,title:v.title,publisher:v.author_name,channelUrl:v.author_url||'',thumbnail:'https://i.ytimg.com/vi/'+id+'/hqdefault.jpg',url:'https://www.youtube.com/watch?v='+id};
}
export function inventory(data){return {news:data.posts,events:data.posts.filter(p=>p.kind==='event'),videos:data.videos,vehicles:data.catalog.vehicles,weapons:data.catalog.weapons,characters:data.research.characters,locations:data.locations}}
export function compactInventory(data){return Object.fromEntries(Object.entries(inventory(data)).map(([k,rows])=>[k,rows.map((x,i)=>({id:x.id||'character-'+i,name:x.name,title:x.title||x.nameAr||x.name,description:x.excerpt||x.description,game:x.game,url:x.url,source:x.source}))]))}
export function findExisting(item,rows){
 const names=x=>[x.name,x.nameAr,x.title,...(x.aliases||[])].filter(v=>typeof v==='string').map(normalizedTitle);
 const matches=rows.filter((x,i)=>(item.targetId&&(x.id||'character-'+i)===item.targetId)||(x.id===item.id)||names(x).some(n=>names(item).includes(n))||(item.category==='videos'&&youtubeID(item.videoUrl)===x.id));
 if(matches.length>1)throw Error('Ambiguous existing entry; review manually');
 if(item.action==='update'&&!matches.length)throw Error('Update target not found');
 if(item.action==='add'&&matches.length)throw Error('Existing entry: duplicate add blocked');
 return matches[0];
}
export function validateCandidate(item,sources){
 if(!item||typeof item!=='object')throw Error('Invalid candidate');
 if(item.aliases!==undefined&&(!Array.isArray(item.aliases)||item.aliases.some(x=>typeof x!=='string')))throw Error('Invalid aliases');
 if(item.body!==undefined&&(!Array.isArray(item.body)||item.body.some(x=>typeof x!=='string')))throw Error('Invalid body');
 for(const key of ['name','targetId','imageUrl','videoUrl','reason','evidenceQuote'])if(item[key]!=null&&typeof item[key]!=='string')throw Error('Invalid '+key);

 if(!categories.includes(item.category)||!['add','update'].includes(item.action)||!/^[a-z0-9-]{3,80}$/.test(item.id||''))throw Error('Invalid change category/action/ID');
 if(typeof item.title!=='string'||!/[\u0600-\u06ff]/.test(item.title)||typeof item.description!=='string'||item.description.length<35)throw Error('Arabic title and substantial description required');
 if(!Array.isArray(item.sourceUrls)||!item.sourceUrls.length||item.sourceUrls.some(u=>!sources.some(s=>s.url===u)))throw Error('Unverified source URL');
 if(!item.reason||!item.evidenceQuote||!sources.some(s=>item.sourceUrls.includes(s.url)&&s.text.includes(item.evidenceQuote)))throw Error('Exact supporting evidence required');
 if(item.category==='events'&&(!/^\d{4}-\d{2}-\d{2}$/.test(item.eventDate||'')||Number.isNaN(Date.parse(item.eventDate))))throw Error('Confirmed event date required');
}
export function applyCandidate(data,item,media,now,existing){
 const sources=item.sourceUrls.map(url=>({url,title:new URL(url).hostname}));const source=item.sourceUrls[0];
 const common={image:media.image,imageCaption:media.caption,source,sourceUrls:item.sourceUrls,updatedAt:now.toISOString(),automationEvidence:item.evidenceQuote,aliases:item.aliases||[]};
 let record;
 if(['news','events'].includes(item.category)){
  const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Qatar',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
  record={...existing,...common,id:existing?.id||day+'-'+item.id,title:item.title,excerpt:item.description,body:item.body,sources,publisher:'GTA Arabia',date:existing?.date||day,publishedAt:existing?.publishedAt||now.toISOString(),category:'أخبار',status:'ملخص بمساعدة الذكاء الاصطناعي',videoId:media.video?.id||null,...(item.category==='events'?{kind:'event',eventDate:item.eventDate,eventTimezone:item.eventTimezone||'غير معلن'}:{})};validatePost(record);
 }else if(item.category==='videos'){
  if(!media.video)throw Error('Verified embedded video required');
  record={...existing,...common,...media.video,title:item.title,originalTitle:media.video.title,thumbnail:media.image,caption:item.description,category:'تغطية',official:false,verification:'Linked from cited publisher; YouTube oEmbed verified. Playback may vary by region.'};
 }else if(['vehicles','weapons'].includes(item.category)){
  if(!item.name)throw Error('Canonical English name required');
  record={...existing,...common,id:existing?.id||item.id,name:item.name,nameAr:item.title,description:item.description,category:existing?.category||'أخرى',manufacturer:existing?.manufacturer||'غير معلن',game:'VI',facts:[{label:'اللعبة',value:'GTA VI'},{label:'المصدر',value:new URL(source).hostname},{label:'التحديث',value:now.toISOString().slice(0,10)}],gtaV:existing?.gtaV||'لا تتوفر مقارنة موثقة.',gtaVI:item.description,status:'GTA VI · مصدر مرفق',imageSourcePage:source,imagePublisher:new URL(source).hostname};
 }else if(item.category==='characters'){
  if(!item.name)throw Error('Canonical character name required');
  record={...existing,...common,name:item.name,nameAr:item.title,description:item.description,status:source.startsWith('https://www.rockstargames.com/')?'confirmed':'reported'};
 }else{
  // Coordinates never come from the model. Existing calibrated positions are preserved.
  const placement=data.placements[item.id];
  if(!existing&&!placement)throw Error('Map position awaits manual calibration');
  const pos=existing||placement;
  if(!Number.isFinite(pos.x)||!Number.isFinite(pos.y)||pos.x<0||pos.x>2048||pos.y<0||pos.y>2048)throw Error('Invalid calibrated map position');
  record={...existing,...common,id:existing?.id||item.id,name:item.title,description:item.description,type:existing?.type||placement.type||'city',x:pos.x,y:pos.y,official:existing?.official||false,photos:[{src:media.image,caption:media.caption}],photoSource:source};
 }
 const rows=['news','events'].includes(item.category)?data.posts:inventory(data)[item.category];
 if(existing)rows[rows.indexOf(existing)]=record;else if(item.category==='news'||item.category==='events')rows.unshift(record);else rows.push(record);
 return record;
}
export function renderPreview(changes){return `<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>مراجعة تحديثات GTA Arabia</title><style>body{background:#0b0715;color:#faf5fa;font:18px/1.8 Arial;max-width:1000px;margin:auto;padding:24px}article{border:1px solid #76376b;border-radius:16px;padding:24px;margin:24px 0}h1,h2{color:#ff86d4}img{max-width:100%;max-height:380px}iframe{width:100%;aspect-ratio:16/9;border:0}a{color:#60ddd4}small{color:#c6b3c9}</style><h1>مسودة للمراجعة</h1><p>التحديثات المقترحة ومصادرها. العناصر المعلّقة لا تُنشر.</p>${changes.map(c=>`<article><small>${esc(labels[c.item.category]||c.item.category)} · ${esc(c.item.action)} · ${esc(c.status)}</small><h2>${esc(c.item.title)}</h2><p>${esc(c.reason||c.item.reason||'')}</p>${c.previewImage?`<img src="${esc(c.previewImage)}" alt="${esc(c.item.title)}">`:''}${c.media?.video?`<iframe loading="lazy" src="https://www.youtube-nocookie.com/embed/${c.media.video.id}" title="${esc(c.item.title)}" allowfullscreen></iframe>`:''}<p>${esc(c.item.description||'')}</p>${(c.item.body||[]).map(p=>`<p>${esc(p)}</p>`).join('')}<details><summary>قبل التحديث / بعد التحديث</summary><pre style="white-space:pre-wrap;overflow-wrap:anywhere">${esc(JSON.stringify({before:c.before||null,after:c.after||null},null,2))}</pre></details>${(c.item.sourceUrls||[]).map(u=>`<p><a href="${esc(u)}">${esc(u)}</a></p>`).join('')}</article>`).join('')}</html>`}
export const hash=s=>createHash('sha256').update(s).digest('hex');
