import test from 'node:test';
import assert from 'node:assert/strict';
import {publisherEntries} from '../scripts/publisher-discovery.mjs';
import {discoverPublishers} from '../scripts/discover-publishers.mjs';
import {renderArticleMedia} from '../article-media.js';
import {renderLeaks} from '../leaks.js';
import {extractMedia,verifyVideo} from '../scripts/content-library.mjs';
const host='https://www.pcgamer.com',now=new Date('2026-11-10T09:00:00Z');
const item=(slug,date='2026-11-10',title='GTA VI '+slug)=>`<item><title>${title}</title><link>${host}/games/grand-theft-auto/${slug}</link><pubDate>${date}</pubDate></item>`;
const article=(title,date='2026-11-10')=>`<head>${date?`<meta property="article:published_time" content="${date}">`:''}</head><article><h1>${title}</h1><p>${'GTA VI announcement details from the publisher. '.repeat(20)}</p></article>`;
const cfg={maxSources:1,maxCandidates:20,maxAgeHours:72,allowedHosts:['www.pcgamer.com'],mediaHosts:[],publishers:[{name:'PC Gamer',endpoints:[host+'/feed']}]};
test('RSS dates survive; /games/ article URLs are permitted; GTA V is excluded',()=>{
 const entries=publisherEntries(item('gta-vi-new')+item('gta-v-old','2026-11-10','GTA V old'),host,cfg.allowedHosts);
 assert.equal(entries.length,1);assert.equal(entries[0].publishedAt,'2026-11-10T00:00:00.000Z');assert.match(entries[0].url,/\/games\//);
});
test('old and already-covered first entries do not exhaust the source pool',async()=>{
 const calls=[],report={warnings:[]};
 const getPage=async url=>{calls.push(url);return {url,html:url.endsWith('/feed')?item('old')+item('known')+item('fresh'):article('GTA VI fresh',url.endsWith('old')?'2026-11-01':null)}};
 const sources=await discoverPublishers({cfg,getPage,now,posts:[{source:host+'/games/grand-theft-auto/known'}],report});
 assert.equal(sources.length,1);assert.match(sources[0].url,/fresh$/);assert.equal(sources[0].fresh,true);
 assert.equal(calls.length,3);assert.equal(report.discoveryCounts['already-covered'],1);assert.equal(report.discoveryCounts['outside-date-window'],1);
});
test('news and rumor discovery use independent sections; footer rumors do not misclassify news',async()=>{
 const getPage=async url=>({url,html:url.endsWith('/feed')?item('gta6-leak')+item('gta6-announcement'):article(url.endsWith('leak')?'GTA6 leak':'GTA6 official announcement')+'<footer>GTA6 leaks</footer>'});
 for(const kind of ['news','leaks']){
  const report={warnings:[]},sources=await discoverPublishers({cfg,getPage,now,kind,report});
  assert.equal(sources.length,1);assert.match(sources[0].url,kind==='leaks'?/leak$/:/announcement$/);
 }
});
test('blocked source cannot prevent a second publisher from returning evidence',async()=>{
 const report={warnings:[]},getPage=async url=>{if(url.endsWith('blocked'))throw Error('Source HTTP 403');return {url,html:url.endsWith('/feed')?item('fresh'):article('GTA VI fresh')}};
 const sources=await discoverPublishers({cfg:{...cfg,publishers:[{name:'Blocked',endpoints:[host+'/blocked']},...cfg.publishers]},getPage,now,report});
 assert.equal(sources.length,1);assert.ok(report.publishers.some(x=>!x.readable));
});
test('videos replace images, autoplay muted, and remain outside article links',()=>{
 const p={title:'عنوان',image:'assets/test.jpg',videoId:'abcdefghijk'};
 const html=renderArticleMedia(p);assert.match(html,/autoplay=1&amp;mute=1/);assert.doesNotMatch(html,/<img/);assert.match(html,/allow="autoplay/);
 const leak=renderLeaks([{...p,publishedAt:'2026-11-10',media:[{type:'image',src:p.image}]}]);assert.equal((leak.match(/<iframe/g)||[]).length,1);assert.doesNotMatch(leak,/<img/);
 const native=renderArticleMedia({...p,videoFile:'assets/clip.mp4'});assert.match(native,/autoplay muted loop playsinline/);assert.doesNotMatch(native,/<iframe|<img/);
 assert.doesNotMatch(renderArticleMedia({title:'x',videoFile:'javascript:alert(1)',videoId:'bad" onload="x'}),/javascript|iframe|video/);
});
test('extract lazy YouTube and native MP4',()=>{
 const media=extractMedia('<iframe data-lazy-src="https://www.youtube.com/embed/abcdefghijk"></iframe><video><source src="/video.mp4"></video>',host);
 assert.deepEqual(media.videos,['https://www.youtube.com/watch?v=abcdefghijk',host+'/video.mp4']);
});
test('MP4 validation checks file signature and blocks private redirects',async()=>{
 const bytes=Buffer.concat([Buffer.from([0,0,0,32]),Buffer.from('ftypisom'),Buffer.alloc(100)]);
 const v=await verifyVideo(host+'/clip.mp4',async()=>new Response(bytes,{headers:{'content-type':'video/mp4'}}),['www.pcgamer.com']);
 assert.equal(v.mediaType,'mp4');assert.equal(v.videoFile,host+'/clip.mp4');
 await assert.rejects(verifyVideo(host+'/clip.mp4',async()=>new Response('',{status:302,headers:{location:'https://127.0.0.1/clip.mp4'}}),['www.pcgamer.com']),/Unapproved/);
 await assert.rejects(verifyVideo(host+'/clip.mp4',async()=>new Response('not video',{headers:{'content-type':'video/mp4'}}),['www.pcgamer.com']),/Invalid MP4/);
});
