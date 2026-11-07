import fs from 'node:fs/promises';
import path from 'node:path';
import {modelFetch} from './ai-provider.mjs';
import {parseJSONResult} from './news-sources.mjs';
const root=process.cwd(),cfg=JSON.parse(await fs.readFile('data/automation.json','utf8'));
await fs.mkdir('drafts',{recursive:true});
try{
 const posts=JSON.parse(await fs.readFile('data/posts.json','utf8'));
 const bytes=await fs.readFile(path.join(root,posts[0].image));
 const mime=posts[0].image.endsWith('.png')?'image/png':posts[0].image.endsWith('.webp')?'image/webp':'image/jpeg';
 const request=modelFetch({root,cfg,env:process.env});
 const response=await request('',{body:JSON.stringify({contents:[{parts:[{text:'Return only JSON {"ok":true,"arabic":"a short Arabic greeting","imageDescription":"brief Arabic description of the attached image"}. Describe only visible elements, without identifying real people.'},{inlineData:{mimeType:mime,data:bytes.toString('base64')}}]}],generationConfig:{maxOutputTokens:250}})});
 const result=parseJSONResult(await response.json());
 if(result.ok!==true||!/[\u0600-\u06ff]/.test(result.arabic||'')||!/[\u0600-\u06ff]/.test(result.imageDescription||''))throw Error('Provider did not return valid Arabic JSON and image description.');
 await fs.writeFile('drafts/connection.json',JSON.stringify({status:'passed',provider:'groq',result},null,2));
 console.log('PASS: Groq authenticated request, Arabic JSON and image input. No public changes.');
 if(process.env.GITHUB_STEP_SUMMARY)await fs.appendFile(process.env.GITHUB_STEP_SUMMARY,'## AI connection\nGroq Arabic JSON and image-input check passed. No content published by this check.\n');
}catch(e){console.error(e.message);if(process.env.GITHUB_STEP_SUMMARY)await fs.appendFile(process.env.GITHUB_STEP_SUMMARY,'## AI connection failed\n'+e.message+'\n');process.exitCode=1}
