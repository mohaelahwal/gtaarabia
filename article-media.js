const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function safeMediaURL(value){
 if(typeof value!=='string')return false;
 if(/^assets\/[\w./-]+$/.test(value)&&!value.includes('..'))return true;
 try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password}catch{return false}
}
export const hasVideo=p=>safeMediaURL(p.videoFile)||/^[\w-]{11}$/.test(p.videoId||'');
export function renderArticleMedia(p,{lazy=false,caption=true}={}){
 const title=esc(p.title),note=caption?'<p class="media-note">يبدأ الفيديو تلقائياً بدون صوت. فعّل الصوت من المشغّل؛ إذا لم يبدأ، اضغط تشغيل.</p>':'';
 if(safeMediaURL(p.videoFile))return `<div class="story-media"><video controls autoplay muted loop playsinline preload="metadata" ${safeMediaURL(p.videoPoster||p.image)?`poster="${esc(p.videoPoster||p.image)}"`:''} aria-label="${title}"><source src="${esc(p.videoFile)}" type="video/mp4">تعذر تشغيل الفيديو في هذا المتصفح.</video></div>${note}`;
 if(/^[\w-]{11}$/.test(p.videoId||''))return `<div class="story-media"><iframe ${lazy?'loading="lazy"':''} title="${title}" src="https://www.youtube-nocookie.com/embed/${p.videoId}?autoplay=1&amp;mute=1&amp;playsinline=1&amp;loop=1&amp;playlist=${p.videoId}&amp;rel=0&amp;hl=ar" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>${note}`;
 return safeMediaURL(p.image)?`<img class="article-cover" ${lazy?'loading="lazy"':''} src="${esc(p.image)}" alt="${title}">${caption&&p.imageCaption?`<small class="muted">${esc(p.imageCaption)}</small>`:''}`:'';
}
