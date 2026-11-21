import { randomBytes, createHash } from 'node:crypto';

const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const unavailable = () => Object.assign(new Error('Không đọc được kho học liệu. Vui lòng thử lại; dữ liệu đã lưu không bị thay thế.'), { status:503 });
// Small immutable chunks keep uploaded files below Firestore's document limit.
// Publish the manifest last so a failed upload never replaces the previous version.
export function contentStorage(store, {cacheTtlMs=30*60*1000,maxCacheBytes=32*1024*1024,now=Date.now}={}) {
  // Cache only verified immutable generations, never accounts or reports.
  // The manifest is still read each time, so publishing a new generation is visible.
  const cache=new Map();
  const pending=new Map();
  let cacheBytes=0;
  const discard=key=>{const old=cache.get(key);if(old){cacheBytes-=old.size;cache.delete(key);}};
  async function save(id, value) {
    const bytes = Buffer.from(JSON.stringify(value));
    if (bytes.length > 32 * 1024 * 1024) throw Object.assign(new Error('Học liệu vượt quá 32 MB.'), {status:413});
    const generation = randomBytes(16).toString('hex');
    const chunks = [];
    for (let offset=0; offset<bytes.length; offset+=512*1024) {
      const key = generation+'-'+chunks.length;
      await store.put('cham_content_chunks',key,{data:bytes.subarray(offset,offset+512*1024).toString('base64')},true);
      chunks.push(key);
    }
    await store.put('cham_content',id,{id,chunks,size:bytes.length,sha256:digest(bytes),savedAt:Date.now()});
  }
  async function read(manifest) {
    if (!manifest || !Array.isArray(manifest.chunks) || !manifest.chunks.length || manifest.chunks.length>64) throw unavailable();
    const key=JSON.stringify([manifest.id,manifest.size,manifest.sha256,manifest.chunks]);
    const hit=cache.get(key);
    if(hit && now()-hit.at<cacheTtlMs){
      cache.delete(key);cache.set(key,hit);
      return JSON.parse(hit.json);
    }
    discard(key);
    if(pending.has(key))return JSON.parse(await pending.get(key));
    const operation=(async()=>{
      const pieces=[];
      for (const key of manifest.chunks) {
        const chunk=await store.get('cham_content_chunks',key);
        if (!chunk || typeof chunk.data !== 'string') throw unavailable();
        pieces.push(Buffer.from(chunk.data,'base64'));
      }
      const bytes=Buffer.concat(pieces);
      if (bytes.length !== manifest.size || digest(bytes) !== manifest.sha256) throw unavailable();
      const json=bytes.toString('utf8');
      try { JSON.parse(json); } catch { throw unavailable(); }
      if(cacheTtlMs>0 && bytes.length<=maxCacheBytes){
        for(const [oldKey,entry] of cache)if(now()-entry.at>=cacheTtlMs)discard(oldKey);
        while(cache.size && (cacheBytes+bytes.length>maxCacheBytes || cache.size>=64))discard(cache.keys().next().value);
        cache.set(key,{json,size:bytes.length,at:now()});cacheBytes+=bytes.length;
      }
      return json;
    })();
    pending.set(key,operation);
    try{return JSON.parse(await operation);}finally{pending.delete(key);}
  }
  return {
    saveStation:(id,value)=>save('station-'+id,value),
    saveTheme:value=>save('theme',value),
    async load() {
      const manifests=await store.list('cham_content');
      const stations={}; let theme={desktop:'',mobile:'',lightness:.12,blur:0};
      for (const manifest of manifests) {
        if (manifest.id === 'theme') theme=await read(manifest);
        else if (typeof manifest.id === 'string' && manifest.id.startsWith('station-')) stations[manifest.id.slice(8)]=await read(manifest);
      }
      return {stations,theme};
    },
  };
}
