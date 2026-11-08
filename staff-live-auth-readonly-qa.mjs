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
for(const route of ['/api/admin/users','/api/admin/gddp/catalog','/api/teacher/workspace','/api/teacher/classes','/api/teacher/implementations','/api/teacher/proposals']){
  const out=await probe(route);
  assert.equal(out.status,401,route+' unexpectedly accessible without login (or backend unavailable)');
  console.log('READ-ONLY LIVE: protected route denied unauthenticated request',route);
}
// This endpoint is an explicit health probe. The backend performs a short-lived
// Firestore write/delete against its dedicated health-check collection only.
const health=await probe('/api/health');
assert.equal(health.status,200,'Health API unavailable');
const summary={
  firestoreConnected:health.body.firestore==='connected',
  firestoreWriteConnected:health.body.firestoreWrite==='connected',
  adminReady:health.body.auth?.ready===true,
  adminAccountExists:health.body.auth?.adminAccountExists===true,
  persistentContent:health.body.contentStorage==='firestore'
};
console.log('LIVE HEALTH (non-sensitive booleans only)',JSON.stringify(summary));
assert.ok(summary.firestoreConnected,'Production Firestore read not connected');
assert.ok(summary.firestoreWriteConnected,'Production Firestore health-check write/delete not connected');
assert.ok(summary.adminReady,'Production Admin auth is not ready');
assert.ok(summary.persistentContent,'Production shared content is not backed by Firestore');
console.log('PUBLIC AUTH READ-ONLY QA PASSED; real Admin/Google sign-in and persisted writes still require controlled manual verification');
