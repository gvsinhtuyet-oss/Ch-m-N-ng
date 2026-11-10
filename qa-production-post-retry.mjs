// External read-only production release verification. QA-only, never merge.
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
const live='https://chamdanang-gddp.pages.dev';
const html=readFileSync('dist/index.html','utf8');
const entry=[...html.matchAll(/<script\\b[^>]*src=["']([^"']+\\.js)["']/gi)].map(m=>m[1]).filter(x=>x.startsWith('/assets/'));
assert.ok(entry.length,'Vite index must contain at least one JS script');
const chunk=readdirSync('dist/assets').filter(x=>x.endsWith('.js')).find(x=>readFileSync(resolve('dist/assets',x),'utf8').includes('Hiệu quả sử dụng và hành trình khám phá'));
assert.ok(chunk,'New Admin dashboard chunk not found in local build');
let ok=false;
for(let i=1;i<=4;i++){
  const home=await fetch(live+'/?release-test='+i,{cache:'no-store',signal:AbortSignal.timeout(20000)});
  const currentHtml=await home.text();
  const rootOk=home.status===200&&entry.every(path=>currentHtml.includes(path));
  const paths=[...entry,'/assets/'+chunk];
  let assetsOk=true;
  for(const path of paths){
    const response=await fetch(live+path+'?release-test='+i,{cache:'no-store',signal:AbortSignal.timeout(20000)});
    const type=response.headers.get('content-type')||'';
    const body=await response.text();
    const good=response.ok&&/javascript/.test(type)&&body.length>100&&(path.endsWith(chunk)?body.includes('Hiệu quả sử dụng và hành trình khám phá'):true);
    assetsOk&&=good;
    console.log(JSON.stringify({attempt:i,path,status:response.status,type,good,length:body.length}));
  }
  console.log(JSON.stringify({attempt:i,rootOk,assetsOk,expectedEntry:entry,expectedAdminChunk:chunk}));
  if(rootOk&&assetsOk){ok=true;break}
  if(i<4)await new Promise(r=>setTimeout(r,5000));
}
assert.ok(ok,'Cloudflare Production does not yet serve latest merged GitHub build');
console.log('PASS: production serves exact latest source frontend entry and Admin report chunk');
