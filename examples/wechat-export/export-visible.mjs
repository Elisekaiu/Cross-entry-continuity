#!/usr/bin/env node
// Only authorized local visible Agent messages. This is a bounded JSONL demo.
// The real Codex rollout schema is version-dependent and should be audited.
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {bridge} from '../shared/client.mjs';

const file=process.env.AGENT_LOG_PATH;
const cursorFile=resolve(process.env.AGENT_CURSOR_FILE||'.data/agent-export-cursor.json');
if(!file||!existsSync(file))throw Error('Set AGENT_LOG_PATH to a file you own');
function visible(line){
  let row;try{row=JSON.parse(line);}catch{return null;}
  if(row?.type==='response_item'&&row.payload?.type==='message'){
    const msg=row.payload;
    if(msg.role!=='user'&&!(msg.role==='assistant'&&msg.phase==='final_answer'))return null;
    const itemType=msg.role==='user'?'input_text':'output_text';
    const raw=(msg.content||[]).filter(x=>x.type===itemType&&typeof x.text==='string').map(x=>x.text).join('\n').trim();
    if(!raw||/^\[(?:internal|微信内部唤醒)/i.test(raw)||raw.startsWith('# AGENTS.md instructions'))return null;
    return {id:msg.id||'',role:msg.role,text:raw};
  }
  // Simpler portable JSONL format supported by this example.
  if(['user','assistant'].includes(row?.role)&&typeof row.text==='string'&&row.text.trim()){
    return {id:String(row.id||''),role:row.role,text:row.text.trim()};
  }
  return null;
}
function digest(value){return createHash('sha256').update(value).digest('hex').slice(0,40);}
const full=readFileSync(file);
const cursor=existsSync(cursorFile)?JSON.parse(readFileSync(cursorFile,'utf8')):null;
if(!cursor||cursor.path!==resolve(file)||cursor.offset>full.length){
  // Default is non-backfill to avoid leaking entire history on first run.
  mkdirSync(dirname(cursorFile),{recursive:true});writeFileSync(cursorFile,JSON.stringify({path:resolve(file),offset:full.length}),{mode:0o600});
  console.log('Initial cursor recorded. Existing history was NOT uploaded.');
  process.exit(0);
}
const tail=full.subarray(cursor.offset);
const lastNl=tail.lastIndexOf(10);
if(lastNl<0){console.log('No complete new JSONL record.');process.exit(0);}
const complete=tail.subarray(0,lastNl+1).toString('utf8');
let sent=0;
for(const line of complete.split('\n').filter(Boolean)){
  const record=visible(line);
  if(!record)continue;
  const key=record.id||digest(record.role+'\0'+record.text);
  await bridge('/continuity/handoff',{method:'POST',body:{source:'agent',kind:'message',role:record.role,
    text:[...record.text].slice(0,1800).join(''),idempotency_key:key}});
  sent++;
}
mkdirSync(dirname(cursorFile),{recursive:true});
writeFileSync(cursorFile,JSON.stringify({path:resolve(file),offset:cursor.offset+Buffer.byteLength(complete)}),{mode:0o600});
console.log(`Sent ${sent} visible new message(s).`);
