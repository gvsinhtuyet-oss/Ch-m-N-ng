// Read-only deployment acceptance check. Never logs in or writes school data.
// Exits non-zero unless the public Production root and Admin chunks match
// the exact dist/ that the trusted GitHub Actions run just deployed.
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';

const base='https://chamdanang-gddp.pages.dev';
const html=readFileSync('dist/index.html','utf8');
const entry=[...html.matchAll(/<script\b[^>]*src=["']([^"']+\.js)["']/gi)]
  .map(m=>m[1]).filter(s=>s.startsWith('/assets/'));
assert.ok(entry.length,'The release must have a Vite JavaScript entry script');

const chunks=readdirSync('dist/assets').filter(f=>f.endsWith('.js'));
const adminTitle='Hiệu quả sử dụng và hành trình khám phá';
const adminAsset=chunks.find(f=>readFileSync(resolve('dist/assets',f),'utf8').includes(adminTitle));
assert.ok(adminAsset,'Admin report entry not found in local build');

const checks=[...entry,'/assets/'+adminAsset];
const fetchText=async(path)=> {
 const res=await fetch(base+path+(path.includes('?')?'&':'?')+'release-verification='+Date.now(),{
   cache:'no-store',signal:AbortSignal.timeout(20000)
 });
 const content=await res.text();
 return {status:res.status,type:res.headers.get('content-type')||'',content};
};
let success=false;
for(let attempt=1;attempt<=6;attempt++){
  const root=await fetchText('/');
  const current=entry.every(url=>root.content.includes(url));
  let assetsMatch=true;
  for(const path of checks){
    const res=await fetchText(path);
    const isJS=res.status===200&&/javascript/i.test(res.type)&&res.content.length>100;
    const matchingTitle=path.endsWith(adminAsset)?res.content.includes(adminTitle):true;
    const ok=isJS&&matchingTitle;
    assetsMatch&&=ok;
    console.log(JSON.stringify({attempt,path,status:res.status,type:res.type,length:res.content.length,ok}));
  }
  console.log(JSON.stringify({attempt,liveRootMatchesBuild:current,allAssetsValid:assetsMatch}));
  if(root.status===200&&current&&assetsMatch){success=true;break;}
  if(attempt<6)await new Promise(done=>setTimeout(done,10000));
}
assert.ok(success,'The live Cloudflare Pages Production URL still does not serve this GitHub build');
console.log('PRODUCTION VERIFIED: exact trusted release is served on chamdanang-gddp.pages.dev');
