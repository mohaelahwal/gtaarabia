import fs from 'node:fs/promises';
import path from 'node:path';
export function budgetedFetch({root,cfg,fetchImpl,key,sleep=ms=>new Promise(r=>setTimeout(r,ms))}){
 const file=path.join(root,'drafts/gemini-budget.json');
 return async(url,options)=>{
  let state={calls:0,lastCall:0};try{state=JSON.parse(await fs.readFile(file,'utf8'))}catch(e){if(e.code!=='ENOENT')throw e}
  if(state.blocked)throw Error('Gemini requests paused after an earlier quota/access error. See report.json.');
  if(state.calls >= (cfg.maxGeminiRequestsPerRun??100))throw Error('Per-run Gemini request budget reached; remaining items deferred.');
  const wait=Math.max(0,(cfg.geminiMinIntervalMs??0)-(Date.now()-state.lastCall));if(wait)await sleep(wait);
  state.calls++;state.lastCall=Date.now();await fs.writeFile(file,JSON.stringify(state));
  const response=await fetchImpl(url,options);
  if(!response.ok){
   let message='';try{const body=await response.json();message=String(body.error?.message||body.error?.status||'')}catch{}
   message=message.split(key||'___NO_KEY___').join('[REDACTED]').replace(/AIza[\w-]+/g,'[REDACTED]').slice(0,1800);
   if([429,401,403].includes(response.status)){state.blocked=true;await fs.writeFile(file,JSON.stringify(state))}
   throw Error(`Gemini HTTP ${response.status}: ${message||'No error detail returned'}. No automatic retry; remaining requests deferred.`);
  }
  return response;
 };
}
