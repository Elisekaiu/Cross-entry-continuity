import {readFileSync,existsSync} from 'node:fs';
// Tiny local demo client; .env does not get committed.
if(existsSync('.env'))for(const line of readFileSync('.env','utf8').split(/\r?\n/)){
  const m=line.match(/^([A-Z_]+)=(.*)$/);if(m&&!process.env[m[1]])process.env[m[1]]=m[2];
}
const URL_BASE=String(process.env.CONTINUITY_URL||'http://127.0.0.1:8794').replace(/\/$/,'');
const TOKEN=String(process.env.CONTINUITY_TOKEN||'');
export async function bridge(path,{method='GET',body,timeoutMs=2000}={}){
  if(TOKEN.length<32||TOKEN.startsWith('REPLACE_'))throw Error('CONTINUITY_TOKEN_missing');
  const r=await fetch(URL_BASE+path,{method,
    headers:{'authorization':'Bearer '+TOKEN,'content-type':'application/json'},
    body:body===undefined?undefined:JSON.stringify(body),
    signal:AbortSignal.timeout(timeoutMs),cache:'no-store'});
  const out=await r.json();
  if(!r.ok||!out.ok)throw Error(out.error||'bridge_http_'+r.status);
  return out;
}
