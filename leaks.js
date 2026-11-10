import {renderArticleMedia,hasVideo} from './article-media.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderLeaks(items){
 const shown=[...items].sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt));
 return `<section class="section leaks-section"><div class="leaks-heading"><span class="eyebrow">GTA VI</span><h1>التسريبات</h1><p>لقطات ومعلومات متداولة غير مؤكدة.</p></div><div class="leaks-grid">${shown.map(p=>{
  const native=p.media.find(m=>m.type==='video');
  const mediaPost={...p,videoFile:p.videoFile||native?.src,videoPoster:native?.poster,image:p.media.find(m=>m.type==='image')?.src};
  const visual=hasVideo(mediaPost)?renderArticleMedia(mediaPost,{lazy:true,caption:false}):p.media.filter(m=>m.type==='image').map(m=>`<a href="${esc(m.src)}" target="_blank" rel="noopener" aria-label="تكبير الصورة"><img src="${esc(m.src)}" alt="${esc(p.title)}" loading="lazy"></a>`).join('');
  return `<article class="leak-card"><div class="leak-media">${visual}<p class="leak-media-error" hidden>تعذر تحميل الوسائط حالياً. حاول مرة أخرى لاحقاً.</p></div><div class="leak-copy"><div class="leak-meta"><span class="leak-badge">${esc(p.status||'تسريب غير مؤكد')}</span><time datetime="${esc(p.publishedAt)}">${esc(p.publishedAt.slice(0,10))}</time></div><h2>${esc(p.title)}</h2><p>${esc(p.description)}</p>${hasVideo(mediaPost)?'<p class="leak-caption">فيديو شرح مستقل · ليس تأكيداً رسمياً · يبدأ بدون صوت</p>':p.mediaCaption?`<p class="leak-caption">${esc(p.mediaCaption)}</p>`:''}${/^[a-z0-9-]+$/.test(p.articleId||'')?`<a class="text-link" href="articles/${esc(p.articleId)}/index.html">اقرأ التقرير الكامل ←</a>`:''}</div></article>`;
 }).join('')||'<p>لا توجد تسريبات متاحة حالياً.</p>'}</div></section>`;
}
export function mountLeaks(main,items){
 main.innerHTML=renderLeaks(items);
 main.querySelectorAll('.leak-media video,.leak-media img').forEach(el=>{const fail=()=>{const message=el.closest('.leak-media').querySelector('.leak-media-error');if(message)message.hidden=false};el.addEventListener('error',fail);el.querySelector('source')?.addEventListener('error',fail);if(el.tagName==='IMG'&&el.complete&&!el.naturalWidth)fail()});
 const videos=[...main.querySelectorAll('video')];
 const observer=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{if(isIntersecting)target.play().catch(()=>{});else target.pause()}),{threshold:.25});
 videos.forEach(v=>observer.observe(v));
 return ()=>{observer.disconnect();videos.forEach(v=>v.pause())};
}
