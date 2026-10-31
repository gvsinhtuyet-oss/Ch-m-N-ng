import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
test('isolated production package serves original assets and protects AI API',async()=>{
 const root=resolve('.production-build');
 const manifest=JSON.parse(await readFile(root+'/runtime-manifest.json','utf8'));
 assert.ok(manifest.sizes.total<200_000_000);
 for(const file of ['.env','src','public','node_modules/vite','node_modules/sharp'])await assert.rejects(access(root+'/'+file));
 // Loading the SDK from the isolated package verifies the production dependency closure.
 await import(pathToFileURL(root+'/node_modules/@google/genai/dist/node/index.mjs').href);
 const child=spawn(process.execPath,['content-server.mjs'],{cwd:root,env:{...process.env,PORT:'0',NODE_ENV:'production',AUTH_ADMIN_EMAIL:'',AUTH_ADMIN_PASSWORD:'',AUTH_FIRESTORE_PROJECT:'',AUTH_LOCAL_HTTP:'true',EDUCATION_ASSISTANT_AI_ENABLED:'true',GEMINI_API_KEY:'synthetic-never-sent'},stdio:['ignore','pipe','pipe']});
 try {
  const port=await new Promise((done,fail)=>{
   const timer=setTimeout(()=>fail(new Error('Startup timeout')),10000);
   child.stdout.on('data',b=>{const m=String(b).match(/port=(\d+)/);if(m){clearTimeout(timer);done(m[1]);}});
   child.once('error',fail);child.once('exit',code=>{clearTimeout(timer);fail(new Error('Server exited '+code));});
  });
  const base='http://127.0.0.1:'+port;
  for(const path of ['/','/images/maps/g2-station-1.webp','/audio/cham-danang-background.mp3']){
   const r=await fetch(base+path); assert.equal(r.status,200,path);
   assert.deepEqual(Buffer.from(await r.arrayBuffer()),await readFile(root+'/dist'+(path==='/'?'/index.html':path)),path);
  }
  const request={method:'POST',headers:{'content-type':'application/json',origin:base},body:'{"query":"Xin chào"}'};
  assert.equal((await fetch(base+'/api/education-assistant',request)).status,401);
  request.headers.origin='https://untrusted.example';
  assert.equal((await fetch(base+'/api/education-assistant',request)).status,403);
 } finally {child.kill();}
});
