// Deterministic source checks. Search/model output is never treated as authority.
export function canonicalURL(value){
 const u=new URL(value);u.hash='';for(const k of [...u.searchParams.keys()])if(k.startsWith('utm_')||['fbclid','gclid'].includes(k))u.searchParams.delete(k);
 return u.href.replace(/\/$/,'');
}
export function allowedURL(value,hosts){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&(!u.port||u.port==='443')&&hosts.includes(u.hostname)}catch{return false}}
export function plain(html){return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim()}
export function publicationDate(html){
 // Only publication dates; a footer date or dateModified alone is not fresh news.
 const dates=[];
 for(const m of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){
  try{const walk=o=>{if(!o||typeof o!=='object')return;const types=[o['@type']].flat();if(types.some(t=>/Article|NewsArticle|BlogPosting/.test(t||''))&&typeof o.datePublished==='string')dates.push(o.datePublished);if(Array.isArray(o))o.forEach(walk);else for(const v of Object.values(o))if(v&&typeof v==='object')walk(v)};walk(JSON.parse(m[1]));}catch{}
 }
 for(const m of html.matchAll(/<meta\b[^>]+>/gi)){
  const attrs=Object.fromEntries([...m[0].matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map(x=>[x[1].toLowerCase(),x[2]]));
  if(['article:published_time','datepublished','pubdate','publishdate'].includes((attrs.property||attrs.name||'').toLowerCase()))dates.push(attrs.content);
 }
 return dates.map(d=>Date.parse(d)).filter(Number.isFinite).sort((a,b)=>a-b)[0]??null;
}
export function isRecent(date,now,hours){return date!==null&&date<=now.getTime()+3600000&&date>=now.getTime()-hours*3600000}
export function normalizedTitle(s){return s.normalize('NFKC').replace(/[\u064b-\u065f\u0670\u0640]/g,'').replace(/[^\p{L}\p{N}]/gu,'').toLowerCase()}
export function parseJSONResult(response){const candidate=response.candidates?.[0];if(candidate?.finishReason&&candidate.finishReason!=='STOP')throw Error('Gemini did not complete the response.');const text=candidate?.content?.parts?.filter(p=>p.text&&!p.thought).map(p=>p.text).join('')||'';return JSON.parse(text.replace(/^\s*```(?:json)?\s*/,'').replace(/\s*```\s*$/,''))}
export function escapeHTML(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
