const output=document.getElementById('output');
for(const [id,type] of [['preview','preview'],['status','status'],['poll','poll-now']]){
  document.getElementById(id).addEventListener('click',async()=>{
    output.textContent='Checking…';
    try{const data=await chrome.runtime.sendMessage({type});output.textContent=JSON.stringify(data,null,2);}
    catch(error){output.textContent=String(error.message||error);}
  });
}
