// AI Studio's incremental GitHub sync can leave unchanged source files absent.
// Recover only allowlisted missing build inputs from an immutable, tested commit.
import {readFile, mkdir, writeFile, lstat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve, dirname, relative} from 'node:path';
import {fileURLToPath} from 'node:url';

export async function recoverSources({root=process.cwd(),fetchImpl=fetch,manifest}={}) {
  manifest ||= JSON.parse(await readFile(new URL('./aistudio-source-manifest.json',import.meta.url),'utf8'));
  if(!/^[a-f0-9]{40}$/.test(manifest.commit))throw new Error('Invalid recovery commit');
  let restored=0;
  for(const entry of manifest.files) {
    if(!/^(?:src\/[A-Za-z0-9_./-]+\.(?:tsx?|css|json)|tsconfig\.json|vite\.config\.ts)$/.test(entry.path) || entry.path.split('/').includes('..') || !/^[a-f0-9]{64}$/.test(entry.sha256))throw new Error('Invalid source recovery entry');
    const destination=resolve(root,entry.path);
    if(relative(resolve(root),destination).startsWith('..'))throw new Error('Recovery path escapes project');
    try { await lstat(destination); continue; } catch(e) { if(e.code!=='ENOENT')throw e; }
    const response=await fetchImpl(`https://raw.githubusercontent.com/gvsinhtuyet-oss/Ch-m-N-ng/${manifest.commit}/${entry.path}`,{signal:AbortSignal.timeout(20000)});
    if(!response.ok)throw new Error(`Cannot recover ${entry.path}: HTTP ${response.status}`);
    const bytes=Buffer.from(await response.arrayBuffer());
    if(createHash('sha256').update(bytes).digest('hex')!==entry.sha256)throw new Error(`Source checksum mismatch: ${entry.path}`);
    await mkdir(dirname(destination),{recursive:true});
    // Exclusive creation also protects changes made while the download was running.
    try { await writeFile(destination,bytes,{flag:'wx'});restored++; }
    catch(e) { if(e.code!=='EEXIST')throw e; }
  }
  return restored;
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const count=await recoverSources();
  if(count)console.log(`Recovered ${count} missing source files from the pinned GitHub commit.`);
}
