// Read-only post-merge verification that Cloudflare Production serves the
// exact Admin report build. This script does not log in or mutate school data.
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';

const base='https://chamdanang-gddp.pages.dev';
const localHtml=readFileSync('dist/index.html','utf8');
const scripts=[...localHtml.matchAll(/<script[^>]*src=["']([^"']+\.js)["']/g)].map(m=>m[1]);
assert.ok(scripts.length,'Vite build must provide an entry script');
const parts=readdirSync('dist/assets').filter(name=>name.endsWith('.js'));
const signals=['Hiệu quả sử dụng và hành trình khám phá','Đánh giá và góp ý toàn ứng dụng'];
const chunks=signals.map(signal=>{
  const hits=parts.filter(name=>readFileSync(resolve('dist/assets',name),'utf8').includes(signal));
  assert.ok(hits.length,'Missing expected Admin report title in built JS: '+signal);
  return {signal,filename:hits[0]};
});
console.log('EXPECTED RELEASE',JSON.stringify({scripts,chunks}));
let confirmed=false;
for(let attempt=1;attempt<=4&&!confirmed;attempt++){
  const homepage=await fetch(base+'/?admin-release-check='+attempt,{cache:'no-store',signal:AbortSignal.timeout(20000)});
  const html=await homepage.text();
  const entryOk=homepage.status===200 && scripts.every(path=>html.includes(path));
  let chunksOk=true;
  for(const {signal,filename} of chunks){
    const response=await fetch(base+'/assets/'+filename+'?release-check='+attempt,{cache:'no-store',signal:AbortSignal.timeout(20000)});
    const type=response.headers.get('content-type')||'';
    const js=await response.text();
    const ok=response.status===200&&/javascript/i.test(type)&&js.includes(signal);
    console.log('CHUNK',JSON.stringify({attempt,filename,status:response.status,type,ok}));
    chunksOk&&=ok;
  }
  console.log('PRODUCTION CHECK',JSON.stringify({attempt,homepageStatus:homepage.status,entryOk,chunksOk}));
  confirmed=entryOk&&chunksOk;
  if(!confirmed&&attempt<4)await new Promise(resolve=>setTimeout(resolve,15000));
}
if(!confirmed)throw Error('Cloudflare Production does not yet serve this Admin release; GitHub merge is not proof of deployment');
console.log('ADMIN REPORT PRODUCTION VERIFIED: exact bundled release on live website');
const health=await fetch(base+'/api/health',{cache:'no-store',signal:AbortSignal.timeout(20000)}).then(r=>r.json()).catch(()=>null);
console.log('SEPARATE FIRESTORE HEALTH',JSON.stringify({firestore:health?.firestore||null,authReady:health?.auth?.ready??null,firestoreWrite:health?.firestoreWrite||null}));
