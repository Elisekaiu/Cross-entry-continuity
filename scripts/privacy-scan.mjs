#!/usr/bin/env node
import {readdirSync,readFileSync,statSync} from 'node:fs';
import {join,relative,resolve} from 'node:path';
const base=resolve('.');
const bannedNames=new Set(['.env','config.js','state.json','.DS_Store']);
const bannedParts=['node_modules','.git','.data'];
const checks=[
  [/(?:\/(?:Users|home)\/(?!example|user|your-user)[^/\s]+\/)/i,'absolute private home path'],
  [/\b(?:sk-proj|sk-ant|ghp_|github_pat_|xoxb-|AIza)[A-Za-z0-9_-]{10,}/,'credential prefix'],
  [/-----BEGIN (?:RSA|OPENSSH|EC|PRIVATE) KEY-----/,'private key'],
  [/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,'non-loopback IP']
];
const exceptions=new Set(['127.0.0.1']);
let files=0,issues=[];
function visit(dir){
 for(const entry of readdirSync(dir)){
  if(bannedParts.includes(entry))continue;
  const path=join(dir,entry),rel=relative(base,path);
  if(statSync(path).isDirectory()){visit(path);continue;}
  files++;
  if(bannedNames.has(entry)){issues.push(`${rel}: disallowed file`);continue;}
  if(rel==='scripts/privacy-scan.mjs')continue; // static scanner patterns are intentional
  const str=readFileSync(path,'utf8');
  for(const [re,label] of checks){
    if(label==='non-loopback IP'){
      for(const match of str.matchAll(re))if(!exceptions.has(match[0]))issues.push(`${rel}: ${label}`);
    }else if(re.test(str))issues.push(`${rel}: ${label}`);
  }
 }
}
visit(base);
if(issues.length){for(const issue of issues)console.error('FAIL',issue);process.exitCode=1;}
else console.log(`Privacy source scan passed for ${files} files. Manual review is still required.`);
