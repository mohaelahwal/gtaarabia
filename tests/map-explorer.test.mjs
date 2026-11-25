import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {readMapProgress,selectMapLocations,normalizeMapSearch,renderMapShell} from '../map.js';
const data=JSON.parse(await fs.readFile(new URL('../data/map-explorer.json',import.meta.url)));
const categories=Object.fromEntries(data.categories.map(c=>[c.id,c]));
test('map data has unique locations, valid coordinates, translated categories and usable local symbols',async()=>{
 assert.equal(data.markers.length,4854);
 assert.equal(new Set(data.markers.map(m=>m.id)).size,data.markers.length);
 assert.equal(new Set(data.markers.map(m=>m.category)).size,105);
 const symbols=JSON.parse(await fs.readFile(new URL('../assets/map-kit/symbols.json',import.meta.url)));
 for(const c of data.categories){assert.match(c.nameAr,/[\u0600-\u06ff]/);assert.ok(symbols[c.icon]);if(symbols[c.icon].img)await fs.access(new URL('../assets/map-kit/icons/'+symbols[c.icon].img,import.meta.url));}
 for(const m of data.markers){assert.ok(categories[m.category]);assert.ok(Number.isFinite(m.x)&&Number.isFinite(m.y));assert.ok(m.x>=-12032&&m.x<=5120&&m.y>=-10112&&m.y<=12032);assert.ok(m.descriptionAr);}
});
test('Arabic search normalizes diacritics and combines category and progress filters',()=>{
 assert.equal(normalizeMapSearch('إِكْتِشَاف'),normalizeMapSearch('اكتشاف'));
 const bank=data.markers.find(m=>m.category==='bank');
 const matching=selectMapLocations(data.markers,{query:'البنوك'},categories);
 assert.ok(matching.some(m=>m.id===bank.id));assert.ok(matching.every(m=>m.category==='bank'));
 assert.deepEqual(selectMapLocations(matching,{hidden:['bank']},categories),[]);
 assert.deepEqual(selectMapLocations(matching,{favoritesOnly:true,favorites:[bank.id]},categories).map(m=>m.id),[bank.id]);
 assert.ok(!selectMapLocations(matching,{hideFound:true,found:[bank.id]},categories).some(m=>m.id===bank.id));
});
test('progress restores notes and personal pins, rejects unsafe IDs and invalid coordinates',()=>{
 const progress={found:['bank-001',false],favorites:['bank-001'],notes:{'bank-001':'ملاحظتي'},personal:[{id:'personal-valid',name:'بيتي',x:0,y:100},{id:'personal-" onclick="bad',name:'bad',x:0,y:0},{id:'personal-outside',name:'bad',x:999999,y:0}],hideFound:true};
 const restored=readMapProgress({getItem:()=>JSON.stringify(progress)});
 assert.deepEqual(restored.found,['bank-001']);assert.equal(restored.notes['bank-001'],'ملاحظتي');assert.equal(restored.personal.length,1);assert.equal(restored.personal[0].nameAr,'بيتي');assert.equal(restored.hideFound,true);
 assert.deepEqual(readMapProgress({getItem:()=>'{invalid'}).found,[]);
 assert.deepEqual(readMapProgress({getItem:()=>{throw Error('blocked')}}).personal,[]);
});
test('static map shell includes accessible search, progress and licensing',()=>{
 const html=renderMapShell();assert.match(html,/dir="rtl"/);assert.match(html,/aria-label="البحث في المواقع والفئات"/);assert.match(html,/CC BY 4.0/);assert.match(html,/data-progress-file/);
});
