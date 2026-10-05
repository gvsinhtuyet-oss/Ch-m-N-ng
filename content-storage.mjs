import { randomBytes, createHash } from 'node:crypto';

const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const unavailable = () => Object.assign(new Error('Không đọc được kho học liệu. Vui lòng thử lại; dữ liệu đã lưu không bị thay thế.'), { status:503 });
// Small immutable chunks keep uploaded files below Firestore's document limit.
// Publish the manifest last so a failed upload never replaces the previous version.
export function contentStorage(store) {
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
    const pieces=[];
    for (const key of manifest.chunks) {
      const chunk=await store.get('cham_content_chunks',key);
      if (!chunk || typeof chunk.data !== 'string') throw unavailable();
      pieces.push(Buffer.from(chunk.data,'base64'));
    }
    const bytes=Buffer.concat(pieces);
    if (bytes.length !== manifest.size || digest(bytes) !== manifest.sha256) throw unavailable();
    try { return JSON.parse(bytes.toString('utf8')); } catch { throw unavailable(); }
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
