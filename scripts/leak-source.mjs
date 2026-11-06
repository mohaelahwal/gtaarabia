import {allowedURL} from './news-sources.mjs';
export const leakAccount='TheMemeVerseHq';
export const leakProfile='https://x.com/'+leakAccount;
export function parsePublicLeaks(html){
 const found=new Map();
 const walk=o=>{if(Array.isArray(o)){o.forEach(walk);return}if(!o||typeof o!=='object')return;
  if(o.__typename==='Tweet'){
   const author=o.core?.user_results?.result?.core?.screen_name||o.core?.user_results?.result?.legacy?.screen_name;
   const text=o.details?.full_text||o.legacy?.full_text||'';
   const id=o.rest_id;
   if(author?.toLowerCase()===leakAccount.toLowerCase()&&/^\d+$/.test(id||'')&&!o.legacy?.retweeted_status_result&&!o.retweeted_status_result&&/\bgta\s*(?:6|vi)\b/i.test(text)&&/\bleak(?:s|ed)?\b|تسريب/i.test(text)){
    const media=(o.media_entities2||o.legacy?.extended_entities?.media||[]).flatMap(m=>{
     if(!allowedURL(m.media_url_https,['pbs.twimg.com']))return [];
     if(m.type==='photo')return [{type:'image',url:m.media_url_https}];
     const variants=(m.video_info?.variants||[]).filter(v=>v.content_type==='video/mp4'&&allowedURL(v.url,['video.twimg.com'])).sort((a,b)=>(b.bitrate||0)-(a.bitrate||0));
     return variants.length?[{type:'video',url:variants[0].url,poster:m.media_url_https}]:[];
    });
    if(media.length)found.set(id,{id,author,text:text.replace(/https:\/\/t\.co\/\S+/g,'').trim(),publishedAt:o.details?.created_at_ms?new Date(o.details.created_at_ms).toISOString():new Date(o.legacy.created_at).toISOString(),media});
   }
   return; // Do not import quoted posts from other authors.
  }
  Object.values(o).forEach(walk);
 };
 for(const match of html.matchAll(/"(?:\\.|[^"\\])*"/g))try{const str=JSON.parse(match[0]);if(typeof str==='string'&&str.startsWith('{')&&str.includes('tweet_results'))walk(JSON.parse(str))}catch{}
 for(const m of html.matchAll(/<script[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/gi))try{walk(JSON.parse(m[1]))}catch{}
 return [...found.values()].sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt));
}
