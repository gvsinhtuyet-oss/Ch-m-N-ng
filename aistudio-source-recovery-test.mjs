import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {recoverSources} from './scripts/recover-aistudio-source.mjs';
const bytes=Buffer.from('export const restored = true;\n');
const manifest={commit:'02d04447aa496a6b59c8da243084f5b56b358d75',files:[{path:'src/main.tsx',sha256:createHash('sha256').update(bytes).digest('hex')}]};
test('recovers only absent pinned source; existing files never use network or change',async t=>{
 const root=await mkdtemp(join(tmpdir(),'cham-recovery-'));t.after(()=>rm(root,{recursive:true,force:true}));let calls=0;
 const fetchImpl=async url=>{calls++;assert.ok(url.includes('/'+manifest.commit+'/src/main.tsx'));return new Response(bytes);};
 assert.equal(await recoverSources({root,manifest,fetchImpl}),1);
 assert.deepEqual(await readFile(join(root,'src/main.tsx')),bytes);
 await writeFile(join(root,'src/main.tsx'),'local edits');
 assert.equal(await recoverSources({root,manifest,fetchImpl}),0);assert.equal(calls,1);
 assert.equal(await readFile(join(root,'src/main.tsx'),'utf8'),'local edits');
});
test('rejects corrupted downloads and unsafe paths without writing source',async t=>{
 const root=await mkdtemp(join(tmpdir(),'cham-recovery-'));t.after(()=>rm(root,{recursive:true,force:true}));
 await assert.rejects(recoverSources({root,manifest,fetchImpl:async()=>new Response('corrupted')}),/checksum mismatch/);
 await assert.rejects(readFile(join(root,'src/main.tsx')),/ENOENT/);
 await assert.rejects(recoverSources({root,manifest:{...manifest,files:[{...manifest.files[0],path:'../secret.ts'}]}}),/Invalid source recovery entry/);
});
