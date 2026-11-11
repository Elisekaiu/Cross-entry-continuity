// DOM-only educational capture. We intentionally do NOT inspect cookies,
// request auth tokens, scan the whole sidebar or call private backend APIs.
(()=>{
  const getId=()=>location.pathname.match(/^\/c\/([\w-]+)(?:\/|$)/)?.[1]||'';
  const clean=value=>String(value||'').replace(/\s+/g,' ').trim();
  const hash=value=>{
    let n=2166136261;
    for(const ch of value){n^=ch.charCodeAt(0);n=Math.imul(n,16777619);}
    return (n>>>0).toString(16);
  };
  function capture(){
    const route=getId();
    if(!route)throw Error('no_current_conversation_id');
    let nodes=[...document.querySelectorAll('[data-message-author-role="user"],[data-message-author-role="assistant"]')];
    let family='message-author-role';
    if(!nodes.length){
      nodes=[...document.querySelectorAll('[data-turn="user"],[data-turn="assistant"]')];
      family='data-turn';
    }
    const messages=[];
    for(let i=0;i<nodes.length;i++){
      const node=nodes[i];
      const role=node.getAttribute(family==='message-author-role'?'data-message-author-role':'data-turn');
      if(!['user','assistant'].includes(role))continue;
      const root=role==='assistant'?(node.querySelector('.markdown,[data-markdown-text-style="assistant-message"]')||node):
        (node.querySelector('[data-user-message-bubble="true"]')||node);
      const text=clean(root.innerText||root.textContent);
      if(!text)continue;
      const dataId=node.getAttribute('data-message-id')||node.getAttribute('data-turn-id');
      // DOM fallback is best effort; stable true IDs are preferable.
      const id=dataId||`dom:${role}:${i}:${hash(text)}`;
      messages.push({id,role,text:[...text].slice(0,6000).join('')});
    }
    if(!messages.length)throw Error('no_visible_messages');
    if(getId()!==route)throw Error('conversation_changed_during_capture');
    return {conversationId:route,capturedAt:new Date().toISOString(),schema:'dom-only-reference',messages:messages.slice(-24)};
  }
  chrome.runtime.onMessage.addListener((message,_sender,reply)=>{
    if(message?.type!=='capture-reference')return;
    try{reply({ok:true,snapshot:capture()});}
    catch(error){reply({ok:false,error:String(error.message||error).slice(0,120)});}
  });
})();
