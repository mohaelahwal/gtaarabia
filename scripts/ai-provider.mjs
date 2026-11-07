import fs from 'node:fs/promises';
import path from 'node:path';
import {budgetedFetch} from './gemini-budget.mjs';
// Keep the existing validation pipeline; adapt provider responses to its schema.
export function modelFetch({root,cfg,env,fetchImpl=fetch,sleep=ms=>new Promise(r=>setTimeout(r,ms)),clock=Date.now}){
 const provider=env.AI_PROVIDER||cfg.aiProvider||'gemini';
 if(provider==='gemini')return budgetedFetch({root,cfg,fetchImpl,key:env.GEMINI_API_KEY,sleep});
 if(provider!=='groq')throw Error('Unsupported AI_PROVIDER');
 const key=env.GROQ_API_KEY;
 const redact=s=>String(s).split(key||'___NO_KEY___').join('[REDACTED]').replace(/gsk_[\w-]+|AIza[\w-]+/g,'[REDACTED]');
 const file=path.join(root,'drafts/ai-budget.json');
 return async(_url,options)=>{
  if(!key)throw Error('Add GROQ_API_KEY in GitHub repository Actions secrets. Gemini is not used.');
  const input=JSON.parse(options.body),parts=input.contents[0].parts;
  if(input.tools)throw Error('Groq discovery must use direct publishers, not Google Search.');
  const text=parts.filter(p=>p.text).map(p=>p.text).join('\n');
  if(text.length>(cfg.maxPromptCharacters||18000))throw Error('AI input exceeds the configured free-tier prompt budget; nothing published.');
  const hasImage=parts.some(p=>p.inlineData);
  const model=hasImage?(env.GROQ_VISION_MODEL||cfg.groqVisionModel):(env.GROQ_TEXT_MODEL||cfg.groqTextModel);
  if(!/^[\w./-]+$/.test(model||''))throw Error('Missing or invalid Groq model');
  const content=parts.map(p=>p.text?{type:'text',text:p.text}:{type:'image_url',image_url:{url:`data:${p.inlineData.mimeType};base64,${p.inlineData.data}`}});
  const body={model,reasoning_effort:'none',messages:[{role:'user',content}],temperature:.2,max_completion_tokens:Math.min(input.generationConfig?.maxOutputTokens||800,cfg.aiMaxOutputTokens||800),response_format:{type:'json_object'}};
  for(let attempt=0;attempt<3;attempt++){
   let state={calls:0,lastCall:0};try{state=JSON.parse(await fs.readFile(file,'utf8'))}catch(e){if(e.code!=='ENOENT')throw e}
   if(state.blocked)throw Error('AI requests paused after an account/quota error. See ai-requests.jsonl.');
   if(state.calls>=(cfg.maxAIRequestsPerRun||10))throw Error('AI request budget exhausted; remaining items deferred.');
   const wait=Math.max(0,(cfg.aiMinIntervalMs??65000)-(clock()-state.lastCall));if(wait)await sleep(wait);
   state.calls++;state.lastCall=clock();await fs.writeFile(file,JSON.stringify(state));
   console.log(`Groq request ${state.calls}: ${hasImage?'image review':'Arabic text/review'}, attempt ${attempt+1}`);
   let response,errorText,status=0;
   const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),cfg.aiTimeoutMs||45000);
   try{
    response=await fetchImpl('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+key},body:JSON.stringify(body),signal:controller.signal});
    status=response.status;
    const data=await response.json();
    if(response.ok){
     const choice=data.choices?.[0];
     if(choice?.finish_reason!=='stop'||typeof choice.message?.content!=='string')throw Error('AI output incomplete or invalid; nothing published.');
     // Validate JSON before adapting; malformed content is never accepted.
     JSON.parse(choice.message.content);
     await fs.appendFile(path.join(root,'drafts/ai-requests.jsonl'),JSON.stringify({provider,model,status,attempt:attempt+1,usage:data.usage})+'\n');
     return new Response(JSON.stringify({candidates:[{finishReason:'STOP',content:{parts:[{text:choice.message.content}]}}]}),{headers:{'content-type':'application/json'}});
    }
    errorText=redact(data.error?.message||data.error?.code||'Request failed');
   }catch(e){errorText=redact(e.message)}finally{clearTimeout(timer)}
   await fs.appendFile(path.join(root,'drafts/ai-requests.jsonl'),JSON.stringify({provider,model,status,attempt:attempt+1,error:errorText})+'\n');
   const retryAfter=Number(response?.headers.get('retry-after'))||0;
   const oversized=status===429&&/request too large|expected output tokens exceed|reduce.*max_tokens/i.test(errorText);
   const exhausted=status===429&&!oversized&&(/per day|daily|quota (?:reached|exceeded)|insufficient (?:quota|credits)/i.test(errorText)||retryAfter>120);
   if(oversized){const limit=Number(errorText.match(/Limit:\s*(\d+)/i)?.[1]);if(attempt<2&&limit>0&&body.max_completion_tokens>Math.floor(limit*.75)){body.max_completion_tokens=Math.floor(limit*.75);await sleep(65000);continue}}
   const retryable=!exhausted&&(status===0||(status===429&&!oversized)||[500,502,503,504].includes(status));
   if([401,403].includes(status)||exhausted){state.blocked=true;await fs.writeFile(file,JSON.stringify(state))}
   if(retryable&&attempt<2){await sleep(Math.max(retryAfter*1000,10000*(attempt+1)));continue}
   throw Error(`Groq ${status?'HTTP '+status:'connection error'}: ${errorText}. ${retryable?'Bounded retries exhausted.':'No automatic retry.'}`);
  }
 };
}
