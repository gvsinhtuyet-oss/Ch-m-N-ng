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
