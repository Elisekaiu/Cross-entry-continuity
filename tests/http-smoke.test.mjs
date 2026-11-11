import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createServer} from 'node:net';
const token='TEST_0123456789_abcdefghijklmnopqrstuvwxyz';
async function freePort(){const s=createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));const p=s.address().port;await new Promise(r=>s.close(r));return p;}
test('HTTP one-shot handoff, ACK, reverse, checkpoint and auth',async()=>{
 const port=await freePort(),root=mkdtempSync(join(tmpdir(),'cec-smoke-'));
 const base=`http://127.0.0.1:${port}`;
 const child=spawn(process.execPath,['examples/collector/server.mjs'],{cwd:process.cwd(),
   env:{...process.env,CONTINUITY_HOST:'127.0.0.1',CONTINUITY_PORT:String(port),CONTINUITY_TOKEN:token,CONTINUITY_STATE_FILE:join(root,'state.json')},stdio:'ignore'});
 try{
  let ready=false;
  for(let i=0;i<40;i++){try{if((await fetch(base+'/health')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,30));}
  assert.equal(ready,true,'server started');
  assert.equal((await fetch(base+'/status')).status,401);
  async function req(p,method='GET',body){const r=await fetch(base+p,{method,headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});const j=await r.json();assert.equal(r.ok,true,JSON.stringify(j));return j;}
  await req('/surface','POST',{app:'chatgpt',event:'open'});
  await req('/surface','POST',{app:'chatgpt',event:'close'});
  const gate=await req('/sync/preflight');assert.equal(gate.action,'capture');
  const wanted=await req('/sync/request','POST',{transition_id:gate.transition_id});assert.equal(wanted.created,true);
  const claimed=await req('/jobs/claim');assert.equal(claimed.job.id,wanted.job.id);
  const uploaded=await req('/jobs/'+wanted.job.id+'/upload','POST',{messages:[{role:'user',text:'A short chat'}]});
  assert.equal(uploaded.job.result,'batch');
  const again=await req('/sync/preflight');assert.equal(again.action,'consume_ready');
  const event=await req('/continuity/latest?source=official&job_id='+wanted.job.id);assert.equal(event.items.length,1);
  await req('/sync/consume','POST',{transition_id:gate.transition_id,job_id:wanted.job.id});
  assert.equal((await req('/sync/preflight')).action,'skip');
  const repeated=await req('/sync/request','POST',{transition_id:gate.transition_id});assert.equal(repeated.created,false);
  await req('/continuity/handoff','POST',{source:'agent',role:'user',text:'hello from agent',idempotency_key:'demo-m1'});
  await req('/continuity/handoff','POST',{source:'agent',role:'user',text:'hello from agent',idempotency_key:'demo-m1'});
  assert.equal((await req('/continuity/latest?source=agent')).items.length,1);
  await req('/continuity/handoff','POST',{source:'official',kind:'checkpoint',text:'Working on cross-entry sync',idempotency_key:'checkpoint1'});
  assert.equal((await req('/continuity/latest?source=official&kind=checkpoint')).items.length,1);
 }finally{child.kill();rmSync(root,{recursive:true,force:true});}
});
