#!/usr/bin/env node
import {createServer} from 'node:http';
import {readFileSync,writeFileSync,mkdirSync,renameSync,existsSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {timingSafeEqual} from 'node:crypto';
import {HandoffState} from './state.mjs';

// Example-only .env parser: deliberately no shell evaluation.
if(existsSync('.env'))for(const line of readFileSync('.env','utf8').split(/\r?\n/)){
  const m=line.match(/^([A-Z_]+)=(.*)$/);if(m&&!process.env[m[1]])process.env[m[1]]=m[2];
}
const TOKEN=process.env.CONTINUITY_TOKEN||'';
if(TOKEN.length<32||TOKEN.startsWith('REPLACE_')){
  throw Error('Set a strong CONTINUITY_TOKEN in your untracked .env');
}
const HOST=process.env.CONTINUITY_HOST||'127.0.0.1';
if(!['127.0.0.1','localhost','::1'].includes(HOST)){
  throw Error('The demo server must listen on loopback only');
}
const PORT=Number(process.env.CONTINUITY_PORT)||8794;
const STATE_FILE=resolve(process.env.CONTINUITY_STATE_FILE||'.data/state.json');
const state=new HandoffState({state:existsSync(STATE_FILE)?JSON.parse(readFileSync(STATE_FILE,'utf8')):null});
function save(){mkdirSync(dirname(STATE_FILE),{recursive:true,mode:0o700});writeFileSync(STATE_FILE+'.tmp',JSON.stringify(state.snapshot()),{mode:0o600});renameSync(STATE_FILE+'.tmp',STATE_FILE);}
const respond=(res,status,data)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(data));};
function authorized(req){
  const input=(req.headers.authorization||'').replace(/^Bearer /,'');
  const a=Buffer.from(input),b=Buffer.from(TOKEN);
  return a.length===b.length&&timingSafeEqual(a,b);
}
async function payload(req){
  let text='';
  for await(const chunk of req){text+=chunk;if(text.length>10_000)throw Error('body_too_large');}
  try{return JSON.parse(text||'{}');}catch{throw Error('bad_json');}
}
createServer(async(req,res)=>{
  const path=new URL(req.url,'http://localhost');
  if(req.method==='GET'&&path.pathname==='/health')return respond(res,200,{ok:true,service:'continuity-reference',local_demo:true});
  if(!authorized(req))return respond(res,401,{ok:false,error:'unauthorized'});
  try{
    let out;
    const p=path.pathname;
    if(req.method==='GET'&&p==='/status')out={ok:true,preflight:state.preflight(),revision:state.state.revision,consumed:state.state.consumed,jobs:state.state.jobs.map(j=>({id:j.id,revision:j.revision,status:j.status,result:j.result,error:j.error}))};
    else if(req.method==='GET'&&p==='/sync/preflight')out={ok:true,...state.preflight()};
    else if(req.method==='POST'&&p==='/surface')out={ok:true,...state.ingest(await payload(req))};
    else if(req.method==='POST'&&p==='/sync/request')out={ok:true,...state.request(await payload(req))};
    else if(req.method==='GET'&&p==='/jobs/claim')out={ok:true,job:state.claim()};
    else if(req.method==='GET'&&p==='/sync/status')out={ok:true,job:state.status(path.searchParams.get('job_id'))};
    else if(req.method==='POST'&&p==='/sync/consume')out={ok:true,...state.consume(await payload(req))};
    else if(req.method==='POST'&&p==='/sync/abandon'){
      const body=await payload(req);out={ok:true,job:state.fail(body.job_id,body.error)};
    }
    else if(req.method==='POST'&&p==='/continuity/handoff')out={ok:true,...state.addContinuityEvent(await payload(req))};
    else if(req.method==='GET'&&p==='/continuity/latest')out={ok:true,items:state.latest({source:path.searchParams.get('source'),kind:path.searchParams.get('kind'),limit:path.searchParams.get('limit'),job_id:path.searchParams.get('job_id')})};
    else if(req.method==='POST'&&/^\/jobs\/[^/]+\/(upload|complete)$/.test(p)){
      const [,,id,method]=p.split('/'),body=await payload(req);
      out={ok:true,job:method==='upload'?state.ready(id,{messages:body.messages}):body.ok===false?state.fail(id,body.error):state.ready(id,{messages:[]})};
    }
    else return respond(res,404,{ok:false,error:'not_found'});
    save();return respond(res,200,out);
  }catch(error){return respond(res,400,{ok:false,error:String(error.message||error).slice(0,150)});}
}).listen(PORT,HOST,()=>console.log(`Local reference collector listening on http://${HOST}:${PORT}`));
