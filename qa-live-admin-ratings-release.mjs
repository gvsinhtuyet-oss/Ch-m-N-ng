import {readdirSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';

const base=process.env.PUBLIC_URL||'https://chamdanang-gddp.pages.dev/';
const marker='Thống kê sao đang chờ đồng bộ';
const assets=resolve('dist/assets');
const matches=readdirSync(assets)
  .filter(name=>name.endsWith('.js'))
  .filter(name=>readFileSync(resolve(assets,name),'utf8').includes(marker));
assert.ok(matches.length,'Built Admin JS must contain a truthful ratings fallback state.');
let productionVerified=false;
for(let attempt=1;attempt<=4&&!productionVerified;attempt++){
  const page=await fetch(new URL('/?admin-ui-qa=20261108-'+attempt,base),{cache:'no-store',signal:AbortSignal.timeout(25000)});
  assert.equal(page.status,200,'Production website must load');
  const html=await page.text();
  const entryScripts=[...html.matchAll(/<script[^>]*src=["']([^"']+\.js)["']/g)].map(m=>m[1]);
  console.log('LIVE PAGE',{attempt,entryScripts});
  let allCurrent=true;
  for(const filename of matches){
    const response=await fetch(new URL('/assets/'+filename,base),{cache:'no-store',signal:AbortSignal.timeout(25000)});
    const actual=await response.text();
    const good=response.status===200&&response.headers.get('content-type')?.includes('javascript')&&actual.includes(marker);
    console.log('LIVE ADMIN ASSET',{attempt,filename,status:response.status,contentType:response.headers.get('content-type'),length:actual.length,hasMarker:actual.includes(marker),head:actual.slice(0,70)});
    allCurrent=allCurrent&&good;
    if(good){
      assert.ok(!actual.includes('API thống kê sao chưa có trên máy chủ đang chạy (HTTP 404)'),'Old red technical banner present in released JS');
    }
  }
  productionVerified=allCurrent;
  if(!productionVerified&&attempt<4)await new Promise(r=>setTimeout(r,20000));
}
assert.ok(productionVerified,'Cloudflare Production still serves an older Admin release; GitHub merge alone does not publish new website');
console.log('PRODUCTION ADMIN UI RELEASE VERIFIED: new neutral honest ratings state is served');
const ratings=await fetch(new URL('/api/admin/station-ratings',base),{cache:'no-store',signal:AbortSignal.timeout(25000)});
console.log('PRODUCTION RATINGS BACKEND STATUS',ratings.status,
  ratings.status===404?'ROUTE STILL MISSING':ratings.status===401?'AUTH GATE PRESENT':'Check Admin authentication separately');
console.log('PRODUCTION UI SMOKE PASS: no authenticated data modified');
