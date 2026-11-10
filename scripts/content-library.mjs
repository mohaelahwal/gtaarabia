import {renderArticleMedia} from '../article-media.js';
import {createHash} from 'node:crypto';
import {allowedURL,normalizedTitle,escapeHTML as esc} from './news-sources.mjs';
import {validatePost} from './validate.mjs';
export const categories=['news','videos','vehicles','weapons','characters','locations','events'];
export const labels={news:'الأخبار',videos:'الفيديوهات',vehicles:'المركبات',weapons:'الأسلحة',characters:'الشخصيات',locations:'مواقع الخريطة',events:'الفعاليات'};
export function youtubeID(value){try{const u=new URL(value);if(u.protocol!=='https:')return null;const id=u.hostname==='youtu.be'?u.pathname.slice(1):['www.youtube.com','youtube.com','www.youtube-nocookie.com'].includes(u.hostname)?(u.searchParams.get('v')||u.pathname.match(/^\/(?:embed|shorts)\/([\w-]{11})/)?.[1]):null;return /^[\w-]{11}$/.test(id||'')?id:null}catch{return null}}
export function extractMedia(html,base){
 const images=new Set(),videos=new Set(),unsupportedVideos=new Set();
 const add=(v,image=false)=>{try{const u=new URL(v.replace(/&amp;/g,'&'),base).href;const id=youtubeID(u);if(id)videos.add('https://www.youtube.com/watch?v='+id);else if(!image&&u.startsWith('https:')&&/\.mp4(?:[?#]|$)/i.test(u))videos.add(u);else if(image&&u.startsWith('https:'))images.add(u)}catch{}};
 for(const m of html.matchAll(/<(?:meta|img|iframe|a|source|video)\b[^>]*>/gi)){
  const attrs=Object.fromEntries([...m[0].matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map(x=>[x[1].toLowerCase(),x[2]]));
  if(/^[\w-]{11}$/.test(attrs['data-youtube-id']||attrs['data-video-id']||''))add('https://www.youtube.com/watch?v='+(attrs['data-youtube-id']||attrs['data-video-id']));
  if(/^<iframe/i.test(m[0]))for(const key of ['src','data-src','data-lazy-src'])try{const u=new URL(attrs[key],base);if(/(^|\.)(vimeo\.com|dailymotion\.com|twitch\.tv|instagram\.com|tiktok\.com)$/.test(u.hostname))unsupportedVideos.add(u.href)}catch{}
  if(/^og:video(?::url|:secure_url)?$/.test(attrs.property||'')){add(attrs.content||'');try{const u=new URL(attrs.content,base);if(!youtubeID(u.href)&&! /\.mp4(?:[?#]|$)/i.test(u.href)&&u.protocol==='https:')unsupportedVideos.add(u.href)}catch{}}
  if(/^(og:image(?::url)?|twitter:image)$/.test(attrs.property||attrs.name||''))add(attrs.content||'',true);
  for(const k of ['src','data-src','data-lazy-src','data-original','href'])if(attrs[k])add(attrs[k],/^<img/i.test(m[0]));
 }
 for(const m of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi))try{const walk=(o,key='')=>{if(typeof o==='string'&&['image','thumbnailUrl','embedUrl','contentUrl'].includes(key))add(o,key==='image'||key==='thumbnailUrl');else if(Array.isArray(o))o.forEach(v=>walk(v,key));else if(o&&typeof o==='object')for(const [k,v]of Object.entries(o))walk(v,k==='url'&&key==='image'?'image':k)};walk(JSON.parse(m[1]))}catch{}
 return {images:[...images].slice(0,30),videos:[...videos].slice(0,12),...(unsupportedVideos.size?{unsupportedVideos:[...unsupportedVideos].slice(0,5)}:{})};
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
export async function verifyVideo(url,fetchImpl,hosts=[]){
 const id=youtubeID(url);
 if(!id){
  if(!/\.mp4(?:[?#]|$)/i.test(url))throw Error('Unsupported video URL');
  let current=url;
  for(let i=0;i<5;i++){
   if(!allowedURL(current,hosts))throw Error('Unapproved video host');
   const r=await fetchImpl(current,{redirect:'manual',headers:{Range:'bytes=0-4095'},signal:AbortSignal.timeout(15000)});
   if(r.status>=300&&r.status<400&&r.headers.get('location')){current=new URL(r.headers.get('location'),current).href;continue}
   if(!r.ok||!/^video\/mp4/i.test(r.headers.get('content-type')||''))throw Error('Video unavailable or not MP4');
   const reader=r.body.getReader(),chunks=[];let size=0;
   try{while(size<64){const {value,done}=await reader.read();if(done)break;chunks.push(Buffer.from(value));size+=value.length}}finally{await reader.cancel()}
   const head=Buffer.concat(chunks).subarray(0,64);
   if(!head.includes(Buffer.from('ftyp')))throw Error('Invalid MP4 header');
   return {id:hash(url).slice(0,11),mediaType:'mp4',videoFile:url,url,title:'Publisher video',publisher:new URL(url).hostname};
  }
  throw Error('Too many video redirects');
 }

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
  record={...existing,...common,id:existing?.id||day+'-'+item.id,title:item.title,excerpt:item.description,body:item.body,sources,publisher:'GTA Arabia',date:existing?.date||day,publishedAt:existing?.publishedAt||now.toISOString(),category:'أخبار',status:'ملخص بمساعدة الذكاء الاصطناعي',videoId:media.video?.mediaType==='mp4'?null:media.video?.id||existing?.videoId||null,videoFile:media.video?.videoFile||existing?.videoFile||null,...(item.category==='events'?{kind:'event',eventDate:item.eventDate,eventTimezone:item.eventTimezone||'غير معلن'}:{})};validatePost(record);
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
export function previewStatus(change){
 if(change.status==='accepted')return 'اجتاز التحقق وأصبح جاهزاً للمراجعة.';
 if(change.status==='skipped')return 'لم تُضف هذه المسودة لأنها مكررة أو لا تقدم معلومات جديدة.';
 const reason=change.reason||'';
 if(/429|quota|requests paused|request budget|token/i.test(reason))return 'لم تكتمل المراجعة بسبب حد الطلبات لدى مزود الذكاء الاصطناعي. لم يُنشر هذا المقال.';
 if(/503|connection|timeout|retries/i.test(reason))return 'تعذر إكمال المراجعة بسبب مشكلة اتصال مؤقتة. لم يُنشر هذا المقال.';
 if(/image|media|video/i.test(reason))return 'الصورة أو الفيديو لم يجتازا التحقق بعد. لم يُنشر هذا المقال.';
 return 'هذه مسودة غير معتمدة؛ لم تجتز مراجعة المعلومات أو التكرار. لم تُنشر.';
}
export function renderPreview(changes){
 const statuses={accepted:'جاهز للمراجعة',held:'معلّق — غير معتمد',skipped:'تم تجاوزه'};
 const actions={add:'مقال جديد',update:'تحديث مقال'};
 return `<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>مراجعة تحديثات GTA Arabia</title><style>body{background:#0b0715;color:#faf5fa;font:18px/1.8 Arial;max-width:1000px;margin:auto;padding:24px}article{border:1px solid #76376b;border-radius:16px;padding:24px;margin:24px 0}h1,h2{color:#ff86d4}img{display:block;width:100%;max-height:520px;object-fit:contain;border-radius:12px}iframe,video{width:100%;aspect-ratio:16/9;border:0}small{color:#c6b3c9}.notice{padding:12px 18px;background:#25172c;border-radius:10px}.missing{padding:32px;border:1px dashed #76376b;color:#c6b3c9}figure{margin:20px 0}figcaption{font-size:13px;color:#c6b3c9}</style><h1>مسودة للمراجعة</h1><p>هذه معاينة فقط. المقالات المعلّقة غير معتمدة ولا تُنشر. التفاصيل التقنية محفوظة في ملفات التقرير المنفصلة.</p>${changes.map(c=>`<article><small>${esc(labels[c.item.category]||'محتوى')} · ${actions[c.item.action]||'مسودة'} · ${statuses[c.status]||'قيد المراجعة'}</small><h2>${esc(c.item.title)}</h2><p class="notice">${previewStatus(c)}</p>${c.media?.video?renderArticleMedia({title:c.item.title,videoId:c.media.video.id,videoFile:c.media.video.videoFile}):`${c.previewImageDataURL||c.previewImage?`<figure><img src="${esc(c.previewImageDataURL||c.previewImage)}" alt="${esc(c.item.title)}"><figcaption>${c.status==='accepted'?'صورة المقال التي اجتازت التحقق.':'صورة مرشحة للمقال؛ لم تكتمل مراجعة ملاءمتها بعد.'}</figcaption></figure>`:'<div class="missing">لم تتوفر صورة قابلة للعرض لهذه المسودة. لن يُنشر المقال دون صورة معتمدة.</div>'}`}<p>${esc(c.item.description||'')}</p>${(c.item.body||[]).map(p=>`<p>${esc(p)}</p>`).join('')}</article>`).join('')}</html>`;
}

export const hash=s=>createHash('sha256').update(s).digest('hex');
