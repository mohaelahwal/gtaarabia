import {publisherEntries,articleText,articleMarkup,articleHeadline,gtaVI,leakTopic} from './publisher-discovery.mjs';
import {publicationDate,isRecent,canonicalURL,allowedURL} from './news-sources.mjs';
import {extractMedia,hash} from './content-library.mjs';

export async function discoverPublishers({cfg,getPage,now,posts=[],state={},kind='news',report}){
 const deadline=Date.now()+(cfg.discoveryBudgetMs||180000);
 report.publishers=[];report.sourcesChecked=[];
 const candidates=new Map(),known=new Set();
 for(const p of posts)for(const u of [p.source,...(p.sourceUrls||[]),...(p.sources||[]).map(x=>x.url)].filter(Boolean))try{known.add(canonicalURL(u))}catch{}
 const add=e=>{if(!candidates.has(e.url))candidates.set(e.url,e)};
 (cfg.sourcePages||[]).forEach(url=>add({url,title:'',publishedAt:null}));
 // A blocked publisher cannot prevent other feeds from being read.
 const publishers=cfg.publishers||[];let index=0;
 await Promise.all(Array.from({length:Math.min(4,publishers.length)},async()=>{
  while(index<publishers.length){const p=publishers[index++],row={publisher:p.name,readable:false,candidates:0,endpoints:[]},found=new Map();
   report.publishers.push(row);
   for(const endpoint of p.endpoints){try{
    const page=await getPage(endpoint);
    if(page.html.trim().length<80||/Site Unavailable|Access Denied|Just a moment/i.test(page.html.slice(0,500)))throw Error('Empty or challenge page');
    row.readable=true;const entries=publisherEntries(page.html,page.url,cfg.allowedHosts);
    entries.forEach(e=>found.set(e.url,e));row.endpoints.push({url:endpoint,result:'readable',candidates:entries.length});
    if(entries.length)break;
   }catch(e){row.endpoints.push({url:endpoint,result:e.message})}}
   row.candidates=found.size;[...found.values()].slice(0,cfg.maxPerPublisher||12).forEach(add);
  }
 }));
 const sources=[],rows=[...candidates.values()].sort((a,b)=>(Date.parse(b.publishedAt)||0)-(Date.parse(a.publishedAt)||0));
 report.discovered=rows.length;report.unchecked=0;
 for(const entry of rows.slice(0,cfg.maxCandidates||80)){
  if(Date.now()>deadline){report.warnings.push('Discovery time budget reached; uninspected candidates deferred.');break}
  const checked={url:entry.url,result:'pending'};report.sourcesChecked.push(checked);
  if(known.has(canonicalURL(entry.url))){checked.result='already-covered';continue}
  if(entry.publishedAt&&!isRecent(Date.parse(entry.publishedAt),now,cfg.maxAgeHours)){checked.result='outside-date-window';continue}
  if(kind==='leaks'&&entry.title&&!leakTopic.test(entry.title+' '+new URL(entry.url).pathname)){checked.result='routed-to-news';continue}
  try{
   const page=await getPage(entry.url);
   if(known.has(page.url)){checked.result='already-covered';continue}
   if(sources.some(s=>s.url===page.url)){checked.result='duplicate-url';continue}
   const title=articleHeadline(page.html)||entry.title,text=articleText(page.html).slice(0,cfg.maxCharactersPerSource||4000);
   if(!gtaVI.test(title+' '+page.url)||text.length<300||!gtaVI.test(text)){checked.result='not-substantial-gta6-article';continue}
   const isLeak=leakTopic.test(title+' '+new URL(page.url).pathname);
   if((kind==='leaks')!==isLeak){checked.result=isLeak?'routed-to-leaks':'routed-to-news';continue}
   const date=publicationDate(page.html)??(entry.publishedAt?Date.parse(entry.publishedAt):null);
   if(!isRecent(date,now,cfg.maxAgeHours)){checked.result=date===null?'missing-publication-date':'outside-date-window';continue}
   const media=extractMedia((page.html.match(/<head[^>]*>[\s\S]*?<\/head>/i)?.[0]||'')+articleMarkup(page.html),page.url);
   media.images=media.images.filter(u=>allowedURL(u,cfg.mediaHosts||[])&&!/placeholder|gravatar|scorecard|%7B/i.test(u)).slice(0,4);
   media.videos=media.videos.slice(0,5);
   const fingerprint=hash(text+JSON.stringify(media));
   if(state.seen?.includes(fingerprint)){checked.result='already-covered';continue}
   checked.result='fresh-evidence';checked.title=title;
   sources.push({url:page.url,title,text,publishedAt:new Date(date).toISOString(),fresh:true,fingerprint,...media});
   // Apply the pool limit AFTER freshness, relevance and duplicate checks.
   if(sources.length>=(cfg.maxSources||10))break;
  }catch(e){checked.result='unreadable';checked.reason=e.message}
 }
 report.unchecked=rows.length-report.sourcesChecked.length;
 report.discoveryCounts=Object.fromEntries([...new Set(report.sourcesChecked.map(s=>s.result))].map(k=>[k,report.sourcesChecked.filter(s=>s.result===k).length]));
 return sources;
}
