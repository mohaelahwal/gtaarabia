import {addGuides,enhanceHTML,writeSEO} from './seo.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {checkSite} from './validate.mjs';
import {sortPosts} from '../content.js';
import {routeFile} from '../routes.js';
console.log('Validated',checkSite());
const read=async n=>JSON.parse(await fs.readFile('data/'+n+'.json','utf8'));
const [config,posts,videos,research,catalog]=await Promise.all(['config','posts','videos','research','catalog'].map(read));
posts.splice(0,posts.length,...sortPosts(posts));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const base=config.siteUrl.replace(/\/$/,'');
const template=await fs.readFile('templates/index.html','utf8');
const all=[];
const add=(route,title,description,body='',image='assets/leonida.jpg')=>all.push({route,title,description,body,image,file:routeFile(route)});
for(const [route,title,desc] of [['home','GTA 6 بالعربية: الأخبار والخريطة والعروض','تابع أخبار GTA 6 وGTA VI بالعربية، واستكشف خريطة ليونيدا والشخصيات والمركبات والأسلحة والفيديوهات، مع مصادر واضحة وتمييز المؤكد عن التحليل.'],['news','أخبار GTA 6 وGTA VI بالعربية','أحدث أخبار وتقارير جراند ثفت أوتو 6 بالعربية، مرتبة من الأحدث، مع مصادر روكستار وبلايستيشن وقراءات واضحة للشخصيات والعالم.'],['map','خريطة GTA 6 التفاعلية: ليونيدا وفايس سيتي','استكشف خريطة ليونيدا المقدمة للمجتمع مع 28 دبوساً، بحث وتكبير وتدوير وتفاصيل عند المرور. مواقع الصورة غير موثقة كإحداثيات اللعبة النهائية.'],['cars','سيارات GTA 6 وGTA 5: دليل المركبات والمقارنات','تصفح دليل المركبات مع صور ومصادر ومقارنة جنباً إلى جنب. تعرف على عناصر GTA VI المعلنة ومراجع GTA V وOnline مع توضيح حالة كل طراز.'],['weapons','أسلحة GTA 6 وGTA 5: الصور والمقارنات','دليل الأسلحة والمعدات مع صور ومواصفات موثقة ومقارنات. افصل إحصاءات GTA V وOnline عن أسلحة GTA VI المعلنة والمعلومات غير المؤكدة.'],['characters','الشخصيات','شخصيات GTA VI المعلنة.'],['stories','عالم اللعبة','قصص وقراءات من عالم ليونيدا.'],['videos','مكتبة الفيديو','عروض رسمية وتحليلات من قنواتها الأصلية.'],['about','عن GTA Arabia','مجتمع عربي مستقل.']])add(route,title,desc);
for(const p of posts)add('post/'+p.id,p.title,p.excerpt,p.body.map(t=>`<p>${esc(t)}</p>`).join('')+p.sources.map(s=>`<p><a href="${esc(s.url)}">${esc(s.title)}</a></p>`).join(''),p.image);
for(const v of videos)add('video/'+v.id,v.title,v.caption,`<p>${esc(v.caption)}</p><p>الناشر: ${esc(v.publisher)}</p><a href="${esc(v.url)}">شاهد الفيديو الأصلي</a>`,v.thumbnail);
research.characters.forEach((c,i)=>add('character/'+i,c.nameAr,c.description,`<p>${esc(c.description)}</p><a href="${esc(c.source)}">المصدر الرسمي</a>`,`assets/${['jason','lucia','cal','boobie','dre','realdimez','raul','brian'][i]}.jpg`));
for(const [type,items] of [['vehicle',catalog.vehicles],['weapon',catalog.weapons]])for(const i of items)add(type+'/'+i.id,i.nameAr||i.name,i.description,`<p>${esc(i.description)}</p><dl>${i.facts.map(f=>`<dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd>`).join('')}</dl><h2>GTA V / Online</h2><p>${esc(i.gtaV)}</p><h2>GTA VI</h2><p>${esc(i.gtaVI)}</p><a href="${esc(i.source)}">المصدر</a>${i.imageSourcePage?`<p><a href="${esc(i.imageSourcePage)}">مصدر الصورة: ${esc(i.imagePublisher||"MSK Scripts")}</a></p>`:""}`,i.image);
for(const p of all.filter(x=>!x.body)){const subset=p.route==='cars'?all.filter(x=>x.route.startsWith('vehicle/')):p.route==='weapons'?all.filter(x=>x.route.startsWith('weapon/')):p.route==='videos'?all.filter(x=>x.route.startsWith('video/')):p.route==='characters'?all.filter(x=>x.route.startsWith('character/')):all.filter(x=>x.route.startsWith('post/'));p.body=subset.map(x=>`<article><a href="${x.file}"><h2>${esc(x.title)}</h2></a><p>${esc(x.description)}</p></article>`).join('')}
for(const p of all){
 if(p.route==='map')p.body='<p>خريطة متجهة مشتقة من صورة مقدمة للمجتمع. أسماء بعض المناطق معلنة رسمياً، أما مواضع الدبابيس فمبنية على الصورة وليست إحداثيات مؤكدة للعبة.</p><img src="assets/leonida-map-vector.svg" alt="خريطة ليونيدا المقدمة للمجتمع" width="800" height="800"><h2>مناطق ليونيدا المعلنة</h2><ul><li>فايس سيتي</li><li>بورت غيلهورن</li><li>أمبروسيا</li><li>جبل كالاغا</li><li>غراس ريفرز</li><li>ليونيدا كيز</li></ul>';
 if(p.route==='about')p.body='<h2>مجتمع عربي مستقل</h2><p>GTA Arabia موقع يديره كاتب واحد لتقديم تغطية عربية لعالم Grand Theft Auto. لا نتبع روكستار أو Take-Two. نربط الأخبار بمصادرها ونميز التحليل عن المعلومات المؤكدة.</p><h2>المصادر والصور</h2><p>صور اللعبة وشعاراتها لأصحابها. تضم صفحات المقالات روابط المصادر وتواريخ النشر. الخريطة مقدمة للمجتمع ولا تمثل خريطة نهائية موثقة.</p><h2>الخصوصية</h2><p>لا يجمع الموقع البريد الإلكتروني ولا يتيح حسابات مستخدمين. مشغلات يوتيوب الخارجية قد تعالج بيانات الاستخدام وفق سياسة مزودها.</p>';
 if(p.route==='news'||p.route==='stories'){const subset=posts.filter(post=>post.category===(p.route==='news'?'أخبار':'عالم اللعبة'));p.body=subset.map(post=>`<article><a href="${routeFile('post/'+post.id)}"><h2>${esc(post.title)}</h2></a><time datetime="${post.date}">${post.date}</time><p>${esc(post.excerpt)}</p></article>`).join('');}
}
addGuides(all);
await fs.mkdir('dist',{recursive:true});for(const name of await fs.readdir('dist'))await fs.rm('dist/'+name,{recursive:true,force:true});
for(const f of ['style.css','app.js','routes.js','map.js','content.js','transitions.js','ads.js','assets','data'])await fs.cp(f,'dist/'+f,{recursive:true});
for(const p of all){const depth=p.file.split('/').length-1,rel=depth?'../'.repeat(depth):'./';let html=template.replace('<head>',`<head><base href="${rel}">`).replace('<body>',`<body data-route="${p.route}">`).replace(/<title>.*?<\/title>/,`<title>${esc(p.title)} | GTA Arabia</title>`).replace(/<meta name="description"[^>]*>/,`<meta name="description" content="${esc(p.description)}">`).replace('<main id="main"></main>',`<main id="main"><article class="article"><h1>${esc(p.title)}</h1>${p.body}</article></main>`);
 html=html.replace(/href="#([^"\s]+)"/g,(whole,r)=>r==='main'?whole:`href="${routeFile(r)}" data-route="${r}"`);
 const canonical=base?base+'/'+p.file:'';
 html=html.replace('</head>',`<meta property="og:title" content="${esc(p.title)}"><meta property="og:description" content="${esc(p.description)}"><meta property="og:type" content="${p.route.startsWith('post/')?'article':'website'}"><meta name="twitter:card" content="summary_large_image">${canonical?`<link rel="canonical" href="${esc(canonical)}"><meta property="og:url" content="${esc(canonical)}"><meta property="og:image" content="${esc(base+'/'+p.image)}">`:''}</head>`);
 html=enhanceHTML(p,html,{base,posts,all});
 for(const prefix of ['dist/','']){const filename=prefix+p.file;await fs.mkdir(path.dirname(filename),{recursive:true});await fs.writeFile(filename,html)}
}
const rss=`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>GTA Arabia</title><link>${esc(base||'./')}</link><description>أخبار GTA بالعربية</description><language>ar</language>${posts.map(p=>`<item><title>${esc(p.title)}</title><link>${esc(base)}/${routeFile('post/'+p.id)}</link><guid isPermaLink="false">gta-arabia-${p.id}</guid><description>${esc(p.excerpt)}</description><pubDate>${new Date(p.date+'T12:00:00Z').toUTCString()}</pubDate></item>`).join('')}</channel></rss>`;
for(const prefix of ['dist/',''])await fs.writeFile(prefix+'feed.xml',rss);
await writeSEO({all,base,posts});
await fs.writeFile('dist/.nojekyll','');
await fs.writeFile('data/page-manifest.json',JSON.stringify(all.map(({route,file,title})=>({route,file,title})),null,2));
await fs.copyFile('data/page-manifest.json','dist/data/page-manifest.json');
console.log(`Built ${all.length} physical HTML pages in project root and dist/.`);
