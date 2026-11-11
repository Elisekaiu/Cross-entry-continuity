import test from 'node:test';
import assert from 'node:assert/strict';
import {makeUnseenDelta,clipText} from '../examples/extension/extractor.js';
test('four-message and 600-character limit',()=>{const messages=Array.from({length:10},(_,i)=>({id:'id'+i,role:i%2?'assistant':'user',text:'你好😀'.repeat(600)}));const x=makeUnseenDelta({messages});assert.equal(x.messages.length,4);assert.ok(x.sentChars<=600);});
test('new stable ID with same text is not incorrectly skipped',()=>{const x=makeUnseenDelta({messages:[{id:'old',role:'user',text:'你好'},{id:'new',role:'user',text:'你好'}]},{seenIds:['old']});assert.deepEqual(x.ids,['new']);});
test('same ID not repeated',()=>{const x=makeUnseenDelta({messages:[{id:'old',role:'user',text:'你好'}]},{seenIds:['old']});assert.equal(x.selected,0);});
test('Unicode remains well formed',()=>{assert.equal([...clipText('😀'.repeat(100),12)].some(x=>x==='😀'),true);});
