import test from 'node:test';
import assert from 'node:assert/strict';
import {proxyApi, BACKEND_ORIGIN} from './functions/api/[[path]].js';

const origin = 'https://cham-contest.pages.dev';
const request = (path, method='GET', headers={}, body) => new Request(origin + path, {
  method, headers, ...(body ? {body} : {}),
});
test('gateway preserves POST body, host-only session and API query, strips spoofed headers', async () => {
  const token='a'.repeat(64);
  const body=JSON.stringify({email:'synthetic@example.com',password:'synthetic-only'});
  let calls=0;
  const result=await proxyApi(request('/api/auth/login?test=1','POST',{
    origin,'content-type':'application/json',cookie:'other=private; cham_session='+token,
    authorization:'must-not-forward','x-forwarded-host':'attacker.example',
  },body), async(url,options)=>{
    calls++;
    assert.equal(url,BACKEND_ORIGIN+'/api/auth/login?test=1');
    assert.equal(options.headers.get('origin'),BACKEND_ORIGIN);
    assert.equal(options.headers.get('cookie'),'cham_session='+token);
    assert.equal(options.headers.get('authorization'),null);
    assert.equal(options.headers.get('x-forwarded-host'),null);
    assert.equal(options.redirect,'manual');
    assert.equal(new TextDecoder().decode(options.body),body);
    return Response.json({user:{role:'admin'}},{headers:{
      'set-cookie':'cham_session='+token+'; Path=/; HttpOnly; Secure; SameSite=Strict',
    }});
  });
  assert.equal(calls,1);assert.equal(result.status,200);
  assert.match(result.headers.get('set-cookie'),/HttpOnly; Secure; SameSite=Strict/);
  assert.equal(result.headers.get('cache-control'),'no-store');
  assert.equal(result.headers.get('access-control-allow-origin'),null);
});
test('cross-origin/missing-origin mutations, form posts and non-API paths fail before upstream',async()=>{
  const noFetch=()=>assert.fail('blocked request contacted backend');
  for(const headers of [{},{origin:'https://attacker.example'},{origin,'sec-fetch-site':'cross-site'}]) {
    assert.equal((await proxyApi(request('/api/content/g1-station-1','PUT',{
      'content-type':'application/json',...headers},'{}'),noFetch)).status,403);
  }
  assert.equal((await proxyApi(request('/api/auth/login','POST',{origin,'content-type':'text/plain'},'{}'),noFetch)).status,415);
  assert.equal((await proxyApi(request('/images/maps/g1-station-1.webp'),noFetch)).status,404);
  assert.equal((await proxyApi(request('/api/auth/login','OPTIONS'),noFetch)).status,405);
});
test('API failures and retry hints survive; upstream HTML/redirect/network errors fail closed',async()=>{
  const result=await proxyApi(request('/api/student/sync/restore','POST',{
    origin,'content-type':'application/json'},'{}'),async()=>Response.json({error:'busy'}, {
      status:503,headers:{'retry-after':'60'},
    }));
  assert.equal(result.status,503);assert.equal(result.headers.get('retry-after'),'60');
  for(const response of [new Response('<html>login</html>',{headers:{'content-type':'text/html'}}),
    new Response(null,{status:302,headers:{location:'https://attacker.example','content-type':'application/json'}})]) {
    assert.equal((await proxyApi(request('/api/health'),async()=>response)).status,502);
  }
  assert.equal((await proxyApi(request('/api/health'),async()=>{throw Error('offline');})).status,503);
});
