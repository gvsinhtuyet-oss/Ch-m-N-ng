import test from 'node:test';
import assert from 'node:assert/strict';
import {contentStorage} from './content-storage.mjs';
function memory() {
  const data=new Map();
  return {data,async put(c,id,value){data.set(c+'/'+id,structuredClone(value));},async get(c,id){return structuredClone(data.get(c+'/'+id)||null);},async list(c){return [...data].filter(([key])=>key.startsWith(c+'/')).map(([,v])=>structuredClone(v));}};
}
test('uploaded assets persist across fresh storage instances and Unicode round trips',async()=>{
  const store=memory(); const content={title:'Đà Nẵng 🌻',image:'data:image/png;base64,'+'A'.repeat(6*1024*1024)};
  await contentStorage(store).saveStation('g1-station-4',content);
  await contentStorage(store).saveTheme({desktop:'ảnh',mobile:'',lightness:.12,blur:0});
  const restored=await contentStorage(store).load();
  assert.deepEqual(restored.stations['g1-station-4'],content);
  assert.equal(restored.theme.desktop,'ảnh');
  assert.ok([...store.data.values()].every(v=>Buffer.byteLength(JSON.stringify(v))<1024*1024));
});
test('interrupted upload keeps previous published version',async()=>{
  const store=memory(); await contentStorage(store).saveStation('demo',{title:'old'});
  const original=store.put; let n=0;
  store.put=async(...args)=>{if (++n===2) throw new Error('network'); return original(...args);};
  await assert.rejects(contentStorage(store).saveStation('demo',{image:'A'.repeat(1024*1024)}));
  assert.deepEqual((await contentStorage(store).load()).stations.demo,{title:'old'});
});
test('corrupt or missing chunks return an error instead of empty content',async()=>{
  const store=memory(); await contentStorage(store).saveStation('demo',{title:'old'});
  const manifest=await store.get('cham_content','station-demo');
  store.data.delete('cham_content_chunks/'+manifest.chunks[0]);
  await assert.rejects(contentStorage(store).load(),e=>e.status===503);
});

function measuredStore(){
  const store=memory();let chunkReads=0,manifestLists=0;
  const get=store.get,list=store.list;
  store.get=async(c,id)=>{if(c==='cham_content_chunks')chunkReads++;return get(c,id);};
  store.list=async(c)=>{if(c==='cham_content')manifestLists++;return list(c);};
  return {store,reads:()=>chunkReads,lists:()=>manifestLists};
}
test('unchanged large media reuses verified chunks while checking fresh manifests',async()=>{
  const m=measuredStore(),storage=contentStorage(m.store);
  const value={title:'Học liệu thật không đổi',image:'A'.repeat(1024*1024)};
  await storage.saveStation('a',value);
  assert.deepEqual((await storage.load()).stations.a,value);
  const first=m.reads();assert.ok(first>=2);
  const restored=await storage.load();restored.stations.a.title='local edit';
  assert.equal((await storage.load()).stations.a.title,value.title);
  assert.equal(m.reads(),first);assert.equal(m.lists(),3);
});
test('newly published generation is read immediately; failed publication keeps old data',async()=>{
  const m=measuredStore(),storage=contentStorage(m.store);
  await storage.saveStation('a',{title:'old'});await storage.load();
  await storage.saveStation('a',{title:'new'});
  assert.equal((await storage.load()).stations.a.title,'new');assert.equal(m.reads(),2);
  const put=m.store.put;
  m.store.put=async(c,...args)=>{if(c==='cham_content')throw new Error('publication failed');return put(c,...args);};
  await assert.rejects(storage.saveStation('a',{title:'unpublished'}));
  assert.equal((await storage.load()).stations.a.title,'new');assert.equal(m.reads(),2);
});
test('cache expires and storage failures are never accepted as empty content',async()=>{
  let clock=0;const m=measuredStore(),storage=contentStorage(m.store,{now:()=>clock,cacheTtlMs:100});
  await storage.saveStation('a',{title:'old'});await storage.load();
  const manifest=await m.store.get('cham_content','station-a');
  m.store.data.delete('cham_content_chunks/'+manifest.chunks[0]);
  clock=100;
  await assert.rejects(storage.load(),e=>e.status===503);
  await assert.rejects(storage.load(),e=>e.status===503);
  assert.equal(m.reads(),3);
});
test('oversized entries are not retained beyond the memory budget',async()=>{
  const m=measuredStore(),storage=contentStorage(m.store,{maxCacheBytes:10});
  await storage.saveStation('a',{image:'A'.repeat(100)});
  await storage.load();await storage.load();assert.equal(m.reads(),2);
});
test('combined cached generations stay within the total memory budget',async()=>{
  const m=measuredStore(),storage=contentStorage(m.store,{maxCacheBytes:100});
  await storage.saveStation('a',{image:'A'.repeat(60)});
  await storage.saveStation('b',{image:'B'.repeat(60)});
  await storage.load();await storage.load();assert.equal(m.reads(),4);
});
test('concurrent content requests share chunk reads without sharing mutable results',async()=>{
  const m=measuredStore(),storage=contentStorage(m.store);
  await storage.saveStation('a',{image:'A'.repeat(1024*1024)});
  const results=await Promise.all(Array.from({length:8},()=>storage.load()));
  assert.equal(m.reads(),3);
  results[0].stations.a.image='changed';
  assert.notEqual(results[1].stations.a.image,'changed');
});
