import test from 'node:test';
import assert from 'node:assert/strict';
import {summarizeRatings,formatRating} from './src/features/admin/ratingSummary';

test('all-station average weights every review equally, then scopes to one lesson',()=>{
 const ratings={a:[1,0,0,0,9],b:[1,0,0,0,0]};
 const all=summarizeRatings(ratings,['a','b']);
 assert.equal(all.total,11);assert.equal(all.average,47/11);assert.equal(all.available,true);
 assert.equal(summarizeRatings(ratings,['b']).average,1);
 assert.equal(formatRating(5),'5,0');assert.equal(formatRating(4.6666),'4,7');
});
test('missing or malformed server results never become verified zero ratings',()=>{
 assert.equal(summarizeRatings({},['a']).available,false);
 assert.equal(summarizeRatings({a:[0,0,0,0,-1]},['a']).available,false);
 assert.equal(summarizeRatings({a:[0,0,0,0,0]},['a']).available,true);
});

test('a free explorer after a staff session gets a new countable visit',async()=>{
 const {readFile}=await import('node:fs/promises');
 const {transform}=await import('esbuild');
 const source=(await readFile(new URL('./src/services/EffectivenessService.ts',import.meta.url),'utf8')).replace("import.meta.env.VITE_EFFECTIVENESS_ENABLED", "'true'");
 const js=(await transform(source,{loader:'ts',format:'esm',target:'es2022'})).code;
 const saved=new Map<string,string>();const bodies:any[]=[];let timers:(()=>void)[]=[];
 const oldOnline=Object.getOwnPropertyDescriptor(navigator,'onLine');Object.defineProperty(navigator,'onLine',{configurable:true,value:true});
 const prior={localStorage:globalThis.localStorage,window:globalThis.window,fetch:globalThis.fetch};
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>saved.get(key)??null,setItem:(key:string,value:string)=>saved.set(key,value)}});
 Object.defineProperty(globalThis,'window',{configurable:true,value:{setTimeout:(fn:()=>void)=>{timers.push(fn);return timers.length;},clearTimeout:()=>{}}});
 globalThis.fetch=async(_url:any,init:any)=>{bodies.push(JSON.parse(init.body));return new Response(null,{status:204});};
 try{
  const {effectivenessService:service}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
  service.visit(2);service.flush();await new Promise(resolve=>setImmediate(resolve));
  service.visit(0);service.stage('g1-station-1',4);service.flush();await new Promise(resolve=>setImmediate(resolve));
  assert.equal(bodies.length,2);assert.equal(bodies[0].audience,2);assert.equal(bodies[1].audience,0);
  assert.notEqual(bodies[0].session,bodies[1].session);assert.deepEqual(bodies[1].stations,[{id:'g1-station-1',stage:4}]);
 }finally{if(oldOnline)Object.defineProperty(navigator,'onLine',oldOnline);else delete (navigator as any).onLine;Object.defineProperty(globalThis,'localStorage',{configurable:true,value:prior.localStorage});Object.defineProperty(globalThis,'window',{configurable:true,value:prior.window});globalThis.fetch=prior.fetch;}
});
