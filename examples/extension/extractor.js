/** Pure, tiny public reference: never transmit raw hidden payloads. */
export function clipText(value,limit){
  const cps=[...String(value||'')];
  if(cps.length<=limit)return cps.join('');
  const head=Math.min(100,Math.floor(limit*.25));
  return cps.slice(0,head).join('')+' … '+cps.slice(-(limit-head-3)).join('');
}
export function makeUnseenDelta(snapshot,{seenIds=[],maxMessages=4,maxChars=600}={}){
  const seen=new Set(seenIds);
  const candidates=(snapshot?.messages||[]).filter(m=>
    m?.id&&!seen.has(m.id)&&['user','assistant'].includes(m.role)&&typeof m.text==='string'&&m.text.trim()
  ).slice(-maxMessages);
  if(!candidates.length)return {messages:[],ids:[],selected:0,sentChars:0};
  const each=Math.floor(maxChars/candidates.length);
  const messages=candidates.map(m=>({role:m.role,text:clipText(m.text,each)}));
  return {messages,ids:candidates.map(m=>m.id),selected:messages.length,
    sentChars:messages.reduce((n,m)=>n+[...m.text].length,0)};
}
