import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {canServeAds} from '../ads.js';
test('advertising ships disabled without account identifiers',()=>{
 const {ads}=JSON.parse(fs.readFileSync('data/config.json','utf8'));
 assert.equal(ads.enabled,false);assert.equal(ads.publisherId,'');assert.equal(canServeAds(ads,true),false);
});
test('ads require explicit enablement, consent and a valid publisher ID',()=>{
 const settings={enabled:true,publisherId:'ca-pub-1234567890123456'};
 assert.equal(canServeAds(settings,false),false);
 assert.equal(canServeAds({...settings,enabled:false},true),false);
 assert.equal(canServeAds({...settings,publisherId:'invalid'},true),false);
 assert.equal(canServeAds(settings,true),true);
});
