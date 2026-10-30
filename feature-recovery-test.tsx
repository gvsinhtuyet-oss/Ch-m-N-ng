import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {FeatureLoadBoundary} from './src/components/common/FeatureLoadBoundary';

test('missing exports are module-version errors and an optional feature can fail without full-screen recovery',()=>{
 const failure=FeatureLoadBoundary.getDerivedStateFromError(new SyntaxError("The requested module '/src/utils/assistantPosition.ts' does not provide an export named 'compactAssistantPosition'"));
 assert.equal(failure.code,'CHAM-MODULE');
 const optional=new FeatureLoadBoundary({fallback:null,children:<p>Trợ lý</p>});
 optional.state={...optional.state,...failure};assert.equal(optional.render(),null);
 const required=new FeatureLoadBoundary({children:<p>Bài học</p>});
 required.state={...required.state,...failure};
 const html=renderToStaticMarkup(required.render());
 assert.match(html,/CHAM-MODULE/);assert.doesNotMatch(html,/assistantPosition|compactAssistantPosition/);
});

test('recovery preserves Preview auth and deep links and never clears learner storage',async()=>{
 const names=['window','navigator','location','caches'];
 const originals=names.map(name=>Object.getOwnPropertyDescriptor(globalThis,name));
 const originalUrl='https://preview.invalid/?__aistudio_auth_token=unit-test&stage2-preview=1#lesson';
 let replaced='',unregistered=0;const removed:string[]=[];
 const values={
  window:{location:{href:originalUrl,replace(url:string){replaced=url;}},caches:{},localStorage:{clear(){assert.fail('progress cleared');},removeItem(){assert.fail('progress removed');}}},
  navigator:{serviceWorker:{getRegistrations:async()=>[{scope:'https://preview.invalid/',unregister:async()=>{unregistered++;}}]}},
  location:{origin:'https://preview.invalid'},
  caches:{keys:async()=>['cham-feature-scripts-v2','workbox-precache-v2','unrelated-data'],delete:async(key:string)=>{removed.push(key);return true;}},
 };
 try{
  for(const name of names)Object.defineProperty(globalThis,name,{value:values[name as keyof typeof values],configurable:true,writable:true});
  await (new FeatureLoadBoundary({}) as any).recover();
  const url=new URL(replaced);assert.equal(url.searchParams.get('__aistudio_auth_token'),'unit-test');assert.equal(url.searchParams.get('stage2-preview'),'1');assert.equal(url.hash,'#lesson');assert.ok(url.searchParams.get('recovery'));
  assert.equal(unregistered,1);assert.deepEqual(removed,['cham-feature-scripts-v2','workbox-precache-v2']);
 }finally{
  names.forEach((name,i)=>{if(originals[i])Object.defineProperty(globalThis,name,originals[i]!);else delete (globalThis as any)[name];});
 }
});
