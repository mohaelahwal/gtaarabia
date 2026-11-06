import fs from 'node:fs';
import path from 'node:path';
export function validatePost(p){
 for(const k of ['id','title','excerpt','publisher','date','image','category','status'])if(typeof p[k]!=='string'||!p[k].trim())throw Error('Missing post field: '+k);
 if(!/^[a-z0-9-]{3,100}$/.test(p.id))throw Error('Invalid post ID');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(p.date)||Number.isNaN(Date.parse(p.date)))throw Error('Invalid date');
 if(!/[\u0600-\u06ff]/.test(p.title))throw Error('Arabic title required');
 if(!p.image.startsWith('assets/')||p.image.includes('..'))throw Error('Local image required');
 if(!Array.isArray(p.body)||p.body.length<3||p.body.some(t=>typeof t!=='string'||t.length<35))throw Error('Article body too short');
 if(!Array.isArray(p.sources)||!p.sources.length)throw Error('Sources required');
 for(const s of p.sources){if(!s.title||new URL(s.url).protocol!=='https:')throw Error('Invalid source')}
 if(p.videoId&&!/^[\w-]{11}$/.test(p.videoId))throw Error('Invalid YouTube ID');
 return true;
}
export function checkSite(root=process.cwd()){
 const read=n=>JSON.parse(fs.readFileSync(path.join(root,'data',n+'.json')));
 const posts=read('posts'),videos=read('videos'),config=read('config');
 const localImage=p=>{if(typeof p!=='string'||!p.startsWith('assets/')||p.includes('..')||!fs.existsSync(path.join(root,p)))throw Error('Invalid or missing local media')};
 const catalog=read('catalog'),research=read('research'),locations=read('map-locations');
 for(const rows of [catalog.vehicles,catalog.weapons]){const seen=new Set();for(const row of rows){if(!/^[a-z0-9-]+$/.test(row.id)||seen.has(row.id))throw Error('Invalid catalog ID');seen.add(row.id);localImage(row.image);if(!row.name||!row.description||!Array.isArray(row.facts))throw Error('Invalid catalog record')}}
 for(const c of research.characters)if(c.updatedAt){localImage(c.image);if(!c.name||!c.nameAr||!c.source)throw Error('Invalid character')}
 const leaks=read('leaks');const leakIDs=new Set();for(const l of leaks){if(!/^\d+$/.test(l.id)||leakIDs.has(l.id)||!l.title||!l.description||!Array.isArray(l.media)||!l.media.length)throw Error('Invalid leak');leakIDs.add(l.id);for(const m of l.media){if(!['image','video'].includes(m.type))throw Error('Invalid leak media');const validLeakMedia=u=>{if(u.startsWith('https:')){const parsed=new URL(u);if(!['pbs.twimg.com','video.twimg.com'].includes(parsed.hostname)||parsed.username||parsed.password)throw Error('Unapproved leak media')}else localImage(u)};validLeakMedia(m.src);if(m.poster)validLeakMedia(m.poster)}}
 const pins=new Set();for(const p of locations){if(!/^[a-z0-9-]+$/.test(p.id)||pins.has(p.id)||!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x<0||p.x>2048||p.y<0||p.y>2048)throw Error('Invalid map pin');pins.add(p.id);for(const photo of p.photos||[])localImage(photo.src)}

 const ids=new Set;for(const p of posts){validatePost(p);if(ids.has(p.id))throw Error('Duplicate post');ids.add(p.id);if(!fs.existsSync(path.join(root,p.image)))throw Error('Missing image '+p.image)}
 const vids=new Set;for(const v of videos){if(!/^[\w-]{11}$/.test(v.id)||vids.has(v.id))throw Error('Invalid/duplicate video');vids.add(v.id);if(!v.title||!v.publisher)throw Error('Missing video metadata');if(v.thumbnail.startsWith('assets/')&&!fs.existsSync(path.join(root,v.thumbnail)))throw Error('Missing thumbnail')}
 for(const u of [config.siteUrl,config.subscribeUrl,config.donationUrl,...Object.values(config.socials)])if(u&&new URL(u).protocol!=='https:')throw Error('Configured URLs must use HTTPS');
 return {posts:posts.length,videos:videos.length};
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(new URL(import.meta.url).pathname))console.log(checkSite());
