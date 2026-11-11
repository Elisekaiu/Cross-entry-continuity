import {randomUUID} from 'node:crypto';

const clone = x => structuredClone(x);
const iso = n => new Date(n).toISOString();
const terminal = s => ['failed','completed'].includes(s);

/** Small educational one-shot state machine. Not the private production engine. */
export class HandoffState {
  constructor({now=()=>Date.now(),state=null,retentionMs=24*3600_000}={}) {
    this.now=now;
    this.retentionMs=retentionMs;
    this.state=state || {revision:0,consumed:0,activeOpen:null,dirty:null,jobs:[],events:[]};
  }
  snapshot(){return clone(this.state);}
  prune(){
    const now=this.now();
    this.state.events=this.state.events.filter(x=>now-Date.parse(x.created_at)<this.retentionMs);
    // Persist a completed cursor even when a terminal job is pruned.
    this.state.jobs=this.state.jobs.filter(j=>!terminal(j.status)||now-Date.parse(j.finished_at||j.created_at)<this.retentionMs);
  }
  ingest({app,event,at}={}){
    if(app!=='chatgpt'||!['open','close'].includes(event))throw Error('invalid_surface_event');
    const t=at?Date.parse(at):this.now();
    if(!Number.isFinite(t))throw Error('invalid_event_time');
    if(event==='open'){this.state.activeOpen=iso(t);return {status:'open_recorded'};}
    const started=this.state.activeOpen;
    this.state.activeOpen=null;
    if(!started)return {status:'close_without_open_ignored'};
    this.state.revision+=1;
    this.state.dirty={revision:this.state.revision,capture_start:started,capture_end:iso(t)};
    return {status:'dirty_marked',revision:this.state.revision};
  }
  /** Consume/skip older outstanding work before asking for a newer capture. */
  preflight(){
    const s=this.state;
    const outstanding=s.jobs.filter(x=>x.revision>s.consumed&&!terminal(x.status))
      .sort((a,b)=>a.revision-b.revision)[0];
    if(outstanding){
      return {action:outstanding.status==='ready'?'consume_ready':'in_flight',
        needs_consume:outstanding.status==='ready',transition_id:outstanding.revision,job:clone(outstanding)};
    }
    if(s.dirty&&s.dirty.revision>s.consumed){
      return {action:'capture',needs_consume:true,transition_id:s.dirty.revision};
    }
    return {action:'skip',needs_consume:false,transition_id:s.consumed};
  }
  request({transition_id}={}){
    const s=this.state,rev=Number(transition_id);
    if(!s.dirty||!Number.isInteger(rev)||s.dirty.revision!==rev||rev<=s.consumed){
      return {created:false,status:'not_current',job:null};
    }
    const found=s.jobs.find(j=>j.revision===rev);
    if(found)return {created:false,status:terminal(found.status)?'terminal':'already_requested',job:clone(found)};
    const j={id:`job_${randomUUID()}`,revision:rev,status:'pending',created_at:iso(this.now()),
      capture_start:s.dirty.capture_start,capture_end:s.dirty.capture_end,error:null,result:null,event_id:null};
    s.jobs.push(j);
    return {created:true,status:'requested',job:clone(j)};
  }
  claim(){
    const j=this.state.jobs.find(x=>x.status==='pending');
    if(!j)return null;
    j.status='claimed';
    return clone(j);
  }
  status(id){return clone(this.state.jobs.find(x=>x.id===id)||null);}
  ready(id,{messages=[]}={}){
    const j=this.state.jobs.find(x=>x.id===id);
    if(!j)throw Error('unknown_job');
    if(terminal(j.status))return clone(j);
    if(!['claimed','pending','ready'].includes(j.status))throw Error('not_claimed');
    if(j.status==='ready')return clone(j);
    if(messages.length>4)throw Error('message_count_exceeded');
    const clean=messages.filter(m=>['user','assistant'].includes(m.role)&&typeof m.text==='string'&&m.text.trim())
      .map(m=>({role:m.role,text:m.text}));
    if(clean.length&&clean.reduce((n,m)=>n+[...m.text].length,0)>600)throw Error('message_budget_exceeded');
    if(clean.length){
      const event={id:`event_${randomUUID()}`,source:'official',kind:'message',
        job_id:j.id,created_at:iso(this.now()),text:clean.map(m=>`${m.role}: ${m.text}`).join('\n')};
      this.state.events.push(event);
      j.event_id=event.id;
    }
    j.status='ready';j.result=clean.length?'batch':'no_delta';
    return clone(j);
  }
  fail(id,error='capture_failed'){
    const j=this.state.jobs.find(x=>x.id===id);
    if(!j)throw Error('unknown_job');
    if(terminal(j.status))return clone(j);
    j.status='failed';j.error=String(error).slice(0,120);j.finished_at=iso(this.now());
    // Don't skip a previously ready job. When it is ACKed, the failed newer
    // revision becomes the consumed cursor without being retried.
    this.settleFailures();
    return clone(j);
  }
  settleFailures(){
    const s=this.state;
    const active=s.jobs.filter(x=>x.revision>s.consumed&&!terminal(x.status));
    const oldestActive=active.length?Math.min(...active.map(x=>x.revision)):Infinity;
    const failed=s.jobs.filter(x=>x.status==='failed'&&x.revision>s.consumed&&x.revision<oldestActive);
    if(failed.length){
      s.consumed=Math.max(s.consumed,...failed.map(x=>x.revision));
      if(s.dirty&&s.dirty.revision<=s.consumed)s.dirty=null;
    }
  }
  consume({transition_id,job_id}={}){
    const j=this.state.jobs.find(x=>x.id===job_id&&x.revision===Number(transition_id));
    if(!j)throw Error('unknown_transition');
    if(j.status==='completed')return {consumed:true,idempotent:true};
    if(j.status!=='ready')throw Error('job_not_ready');
    j.status='completed';j.finished_at=iso(this.now());
    this.state.consumed=Math.max(this.state.consumed,j.revision);
    if(this.state.dirty&&this.state.dirty.revision<=this.state.consumed)this.state.dirty=null;
    this.settleFailures();
    return {consumed:true,consumed_transition_id:this.state.consumed};
  }
  addContinuityEvent(data){
    const key=String(data.idempotency_key||'').slice(0,160);
    const source=data.source==='official'?'official':'agent';
    const kind=source==='official'&&data.kind==='checkpoint'?'checkpoint':'message';
    if(!key)throw Error('idempotency_key_required');
    const found=this.state.events.find(x=>x.source===source&&x.idempotency_key===key);
    if(found)return {created:false,event:clone(found)};
    const role=data.role==='assistant'?'assistant':'user';
    const event={id:`event_${randomUUID()}`,source,kind,
      idempotency_key:key,role,created_at:iso(this.now()),text:[...String(data.text||'')].slice(0,1800).join('')};
    if(!event.text.trim())throw Error('empty_event');
    this.state.events.push(event);
    return {created:true,event:clone(event)};
  }
  addAgentEvent(data){return this.addContinuityEvent({...data,source:'agent'});}
  latest({source,kind,limit=6,job_id}={}){
    this.prune();
    return clone(this.state.events.filter(e=>(!source||e.source===source)&&(!kind||e.kind===kind)&&(!job_id||e.job_id===job_id)).slice(-Math.min(20,Math.max(1,Number(limit)||6))));
  }
}
