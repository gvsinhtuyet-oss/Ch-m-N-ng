import assert from 'node:assert/strict';
const base=process.env.PUBLIC_URL||'https://chamdanang-gddp.pages.dev/';
async function probe(path){
  const r=await fetch(new URL(path,base),{headers:{Accept:'application/json'},cache:'no-store',redirect:'manual',signal:AbortSignal.timeout(25000)});
  const type=r.headers.get('content-type')||'';
  assert.ok(type.includes('application/json'),path+' returned non-JSON response (status '+r.status+')');
  const body=await r.json();
  return {status:r.status,body};
}
const config=await probe('/api/auth/google/config');
assert.equal(config.status,200,'Google client configuration route unavailable');
assert.ok(typeof config.body.clientId==='string'&&config.body.clientId.length>10,'Google Client ID not configured');
console.log('READ-ONLY LIVE: Google OAuth client configuration available (no ID exposed)');
const session=await probe('/api/auth/session');
assert.equal(session.status,200);
assert.equal(session.body.user,null,'new anonymous request unexpectedly authenticated');
console.log('READ-ONLY LIVE: anonymous session identified');
for(const route of ['/api/admin/users','/api/teacher/workspace','/api/teacher/classes','/api/teacher/implementations']){
  const out=await probe(route);
  assert.equal(out.status,401,route+' unexpectedly accessible without login (or backend unavailable)');
  console.log('READ-ONLY LIVE: protected route denied unauthenticated request',route);
}
console.log('PUBLIC AUTH READ-ONLY QA PASSED; real Admin/Google sign-in and persisted writes still require controlled manual verification');
