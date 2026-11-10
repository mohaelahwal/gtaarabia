import {allowedURL,canonicalURL,plain} from './news-sources.mjs';
export const gtaVI = /\b(?:gta[\s_-]*(?:6|vi)|grand[\s_-]+theft[\s_-]+auto[\s_-]+(?:vi|6))\b/i;
const decode=s=>s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'");
export const leakTopic=/\b(?:leak(?:ed|s|ing)?|rumou?rs?|datamin(?:e|ed|ing)|unconfirmed)\b/i;
export function publisherEntries(html,base,hosts){
 const links=new Map();
 const add=(href,title,date=null)=>{try{const u=new URL(decode(href),base);if(allowedURL(u.href,hosts)&&gtaVI.test(u.pathname+' '+plain(decode(title)))&&!/\/(?:tag|tags|author|category|search|downloads)(?:\/|$)/i.test(u.pathname)){
  const url=canonicalURL(u.href),publishedAt=Number.isFinite(Date.parse(date))?new Date(date).toISOString():null;
  if(!links.has(url)||publishedAt)links.set(url,{url,title:plain(decode(title)),publishedAt});
 }}catch{}};
 for(const m of html.matchAll(/<(?:item|entry)\b[^>]*>([\s\S]*?)<\/(?:item|entry)>/gi)){
  const block=m[1],title=block.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'';
  const link=block.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1]||block.match(/<link[^>]*href=["']([^"']+)/i)?.[1];
  const date=block.match(/<(?:pubDate|published|dc:date)[^>]*>([^<]+)/i)?.[1];if(link)add(link.trim(),title,date);
 }
 for(const m of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi))add(m[1],m[2]);
 return [...links.values()];
}
export const publisherLinks=(html,base,hosts)=>publisherEntries(html,base,hosts).map(x=>x.url);
export function articleHeadline(html){return plain(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]||html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'')}
export function articleMarkup(html){
 const main=html.match(/<article\b[^>]*>[\s\S]*?<\/article>/i)?.[0]||html.match(/<main\b[^>]*>[\s\S]*?<\/main>/i)?.[0]||html;
 return main.replace(/<(nav|aside|footer)\b[^>]*>[\s\S]*?<\/\1>/gi,'');
}
export function articleText(html){
 let body='';
 for(const m of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi))try{const walk=o=>{if(!o||typeof o!=='object')return;if(typeof o.articleBody==='string'&&o.articleBody.length>body.length)body=o.articleBody;Object.values(o).forEach(v=>{if(v&&typeof v==='object')walk(v)})};walk(JSON.parse(m[1]))}catch{}
 return plain(body||articleMarkup(html));
}
