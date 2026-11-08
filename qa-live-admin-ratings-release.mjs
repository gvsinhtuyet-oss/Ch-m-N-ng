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
const page=await fetch(new URL('/?admin-ui-qa=20261108',base),{cache:'no-store',signal:AbortSignal.timeout(25000)});
assert.equal(page.status,200,'Production website must load');
for(const filename of matches){
  const response=await fetch(new URL('/assets/'+filename,base),{cache:'no-store',signal:AbortSignal.timeout(25000)});
  assert.equal(response.status,200,'Production must serve exact current Admin asset '+filename);
  const actual=await response.text();
  assert.ok(actual.includes(marker),'Production Admin asset not updated: '+filename);
  assert.ok(!actual.includes('API thống kê sao chưa có trên máy chủ đang chạy (HTTP 404)'),
    'Old red technical banner must no longer be bundled');
  console.log('PRODUCTION ADMIN UI RELEASE VERIFIED',filename,'neutral honest ratings state is live');
}
const ratings=await fetch(new URL('/api/admin/station-ratings',base),{cache:'no-store',signal:AbortSignal.timeout(25000)});
console.log('PRODUCTION RATINGS BACKEND STATUS',ratings.status,
  ratings.status===404?'ROUTE STILL MISSING':ratings.status===401?'AUTH GATE PRESENT':'Check Admin authentication separately');
console.log('PRODUCTION UI SMOKE PASS: no authenticated data modified');
