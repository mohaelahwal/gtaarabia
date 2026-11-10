import {renderArticleMedia,hasVideo} from './article-media.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderLeonidaArticle(p){return `<article class="leonida-feature" dir="rtl">
<div class="phone-breadcrumb"><a href="news/index.html">الأخبار</a><span>/</span><a href="leaks/index.html">التسريبات</a><time>${esc(p.date)}</time></div>
<header class="leonida-hero" ${hasVideo(p)?'':`style="background-image:linear-gradient(0deg,#100d18 0%,#100d1822 100%),url('${esc(p.image)}')"`}><span class="phone-kicker">GTA VI / ملف الاستكشاف</span><h1>القصة تنتهي.<br><em>ليونيدا لا تنتهي.</em></h1><p>${esc(p.excerpt)}</p></header>${renderArticleMedia(p)}
<div class="leonida-stats"><div><strong>٦</strong><span>مناطق معلنة</span></div><div><strong>+١٧٠</strong><span>نوعاً من الحيوانات وفق التقارير</span></div><div><strong>٣٤٢؟</strong><span>كم² · تقدير متداول غير مؤكد</span></div></div>
<section class="leonida-watch"><div><span class="phone-kicker">شاهد التقرير</span><h2>خارج مسار<br>المهمات.</h2><p>${esc(p.body[0])}</p><p>${esc(p.body[1])}</p><aside>الفيديو يعرض أرقاماً متداولة. تقدير المساحة والمقارنات الواردة فيه ليست قياسات رسمية مؤكدة.</aside></div></section>
<section class="leonida-regions"><span class="phone-kicker">من الساحل إلى الجبال</span><h2>ست وجهات. عالم واحد.</h2><div>${['فايس سيتي','ليونيدا كيز','جراس ريفرز','بورت جيلهورن','أمبروسيا','ماونت كالاغا'].map((n,i)=>`<div><span>٠${['١','٢','٣','٤','٥','٦'][i]}</span><h3>${n}</h3></div>`).join('')}</div><p>${esc(p.body[3])}</p></section>
<section class="leonida-details"><h2>الأرقام تحتاج سياقاً.</h2><p>${esc(p.body[2])}</p><p>${esc(p.body[4])}</p><p>${esc(p.body[5])}</p></section>
<footer class="phone-story-footer"><p>GTA ARABIA <span>· ملف ليونيدا · ٢٠٢٦</span></p><a href="articles/gta6-phone-apps-leaks-explained/index.html">اقرأ أيضاً: تطبيقات الهاتف ←</a></footer></article>`;}
