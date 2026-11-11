import {CONFIG} from './config.js';
import {makeUnseenDelta} from './extractor.js';

const ALARM='continuity-reference-poll';
const HEADER=()=>({'content-type':'application/json','authorization':'Bearer '+CONFIG.token});
async function api(path,{method='GET',body}={}){
  const response=await fetch(CONFIG.base+path,{method,headers:HEADER(),body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'});
  const data=await response.json();
  if(!response.ok||!data.ok)throw Error(data.error||`http_${response.status}`);
  return data;
}
async function selectedChatTab(){
  const matcher=['https://chatgpt.com/*','https://chat.openai.com/*'];
  const active=await chrome.tabs.query({active:true,currentWindow:true,url:matcher});
  if(active.length===1)return active[0];
  const all=await chrome.tabs.query({url:matcher});
  // Multiple background conversations are ambiguous; do not guess.
  return all.length===1?all[0]:null;
}
async function snapshot(){
  const tab=await selectedChatTab();
  if(!tab?.id)throw Error('no_unambiguous_chatgpt_tab');
  const res=await chrome.tabs.sendMessage(tab.id,{type:'capture-reference'});
  if(!res?.ok)throw Error(res?.error||'capture_failed');
  const route=tab.url?.match(/\/c\/([\w-]+)/)?.[1];
  if(!route||route!==res.snapshot.conversationId)throw Error('route_mismatch');
  return res.snapshot;
}
async function preview(){
  const snap=await snapshot();
  const key='seen:'+snap.conversationId;
  const stored=await chrome.storage.local.get(key);
  const delta=makeUnseenDelta(snap,{seenIds:stored[key]||[],maxMessages:CONFIG.maxMessages,maxChars:CONFIG.maxChars});
  return {conversationSuffix:snap.conversationId.slice(-6),schema:snap.schema,...delta};
}
async function reconcilePending(){
  const {pending=null}=await chrome.storage.local.get('pending');
  if(!pending)return;
  let j;
  try{j=(await api('/sync/status?job_id='+encodeURIComponent(pending.jobId))).job;}catch{return;}
  if(j?.status==='completed'){
    const key='seen:'+pending.conversationId;
    const v=await chrome.storage.local.get(key);
    await chrome.storage.local.set({[key]:[...new Set([...(v[key]||[]),...pending.ids])].slice(-250)});
    await chrome.storage.local.remove('pending');
  }else if(j?.status==='failed')await chrome.storage.local.remove('pending');
}
async function autoPoll(){
  if(!CONFIG.enabled||CONFIG.token.startsWith('REPLACE_'))return;
  await reconcilePending();
  const {job}=await api('/jobs/claim');
  if(!job)return;
  try{
    const snap=await snapshot();
    const key='seen:'+snap.conversationId;
    const saved=await chrome.storage.local.get(key);
    const delta=makeUnseenDelta(snap,{seenIds:saved[key]||[],maxMessages:CONFIG.maxMessages,maxChars:CONFIG.maxChars});
    // This demo cannot match an iOS route to the webpage: never infer that
    // current Mac tab must equal the last mobile Chat conversation.
    const response=delta.messages.length
      ?await api('/jobs/'+encodeURIComponent(job.id)+'/upload',{method:'POST',body:{messages:delta.messages,conversation_id:snap.conversationId}})
      :await api('/jobs/'+encodeURIComponent(job.id)+'/complete',{method:'POST',body:{ok:true}});
    if(response.job?.status==='ready'&&delta.ids.length){
      await chrome.storage.local.set({pending:{jobId:job.id,conversationId:snap.conversationId,ids:delta.ids}});
    }
    await chrome.storage.local.set({lastResult:{at:new Date().toISOString(),jobId:job.id,status:response.job?.result||'ready',selected:delta.selected}});
  }catch(error){
    try{await api('/sync/abandon',{method:'POST',body:{job_id:job.id,error:String(error.message||error).slice(0,120)}});}catch{}
    await chrome.storage.local.set({lastResult:{at:new Date().toISOString(),jobId:job.id,status:'failed',error:String(error.message||error).slice(0,100)}});
  }
}
chrome.runtime.onInstalled.addListener(()=>chrome.alarms.create(ALARM,{periodInMinutes:0.5}));
chrome.runtime.onStartup.addListener(()=>chrome.alarms.create(ALARM,{periodInMinutes:0.5}));
chrome.alarms.onAlarm.addListener(a=>{if(a.name===ALARM)autoPoll().catch(()=>{});});
chrome.runtime.onMessage.addListener((msg,_sender,reply)=>{
  if(msg.type==='preview'){preview().then(x=>reply({ok:true,report:{selected:x.selected,sentChars:x.sentChars,schema:x.schema,conversationSuffix:x.conversationSuffix}})).catch(e=>reply({ok:false,error:String(e.message||e)}));return true;}
  if(msg.type==='status'){chrome.storage.local.get('lastResult').then(x=>reply({ok:true,enabled:CONFIG.enabled,lastResult:x.lastResult||null}));return true;}
  if(msg.type==='poll-now'){autoPoll().then(()=>reply({ok:true})).catch(e=>reply({ok:false,error:String(e.message||e)}));return true;}
});
