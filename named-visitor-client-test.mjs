import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {webcrypto} from 'node:crypto';
import {transformSync} from 'esbuild';
test('entering a name annotates the current visit; another person gets a new visit',async()=>{
 let person=null;const requests=[],storage=new Map();
 const source=readFileSync('src/services/EffectivenessService.ts','utf8').replace("import {freeExplorerIdentity} from './FreeExplorerIdentity';",'const freeExplorerIdentity={current:()=>getPerson()};');
 const {code}=transformSync(source,{loader:'ts',format:'cjs',define:{'import.meta.env.VITE_EFFECTIVENESS_ENABLED':'"true"'}});
 const module={exports:{}};const context={module,exports:module.exports,getPerson:()=>person,crypto:webcrypto,Date,Map,AbortSignal,Error,JSON,navigator:{onLine:true},window:{setTimeout:()=>1,clearTimeout(){}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},fetch:async(_url,options)=>{requests.push(JSON.parse(options.body));return {status:204}}};
 runInNewContext(code,context);const service=module.exports.effectivenessService;
 const flush=async()=>{service.flush();await new Promise(resolve=>setImmediate(resolve));};
 service.visit(0);await flush();
 person={id:'a'.repeat(32),name:'Bạn An',role:'student'};service.visit(0);await flush();
 assert.equal(requests.length,2);assert.equal(requests[0].session,requests[1].session,'Name entry must not create a second counted visit');assert.equal(requests[1].visitor.name,'Bạn An');
 service.visit(0);await flush();assert.equal(requests.length,2,'Repeated UI renders must not resend');
 person={id:'b'.repeat(32),name:'Bạn Bình',role:'student'};service.visit(0);await flush();assert.notEqual(requests[2].session,requests[1].session,'Different people must not share attribution');
});
