// Strict, anonymous, read-only Production acceptance gate.
// Check public routes without triggering Firestore writes.
// The legacy /api/health performs a write/delete probe, so never call it
// from anonymous live CI while production may still run that backend.
// Never send cookies, secrets or student information.
const base = process.env.PUBLIC_URL || 'https://chamdanang-gddp.pages.dev/';
const cases = [
 {path:'/',status:200,kind:'html'},
 {path:'/api/auth/google/config',status:200,kind:'config'},
 {path:'/api/admin/station-ratings',statuses:[401,403],kind:'protected'},
 {path:'/api/teacher/proposals',statuses:[401,403],kind:'protected'},
 {path:'/api/effectiveness?days=7',statuses:[401,403],kind:'protected'},
 {path:'/api/education-assistant',status:200,kind:'teacher-only-ai'},
 {path:'/apple-touch-icon.png',status:200,kind:'image'},
 {path:'/icon.svg',status:200,kind:'image'},
];
let failed = false;
for (const test of cases) {
 try {
  const response = await fetch(new URL(test.path,base),{
   headers:{Accept:test.kind==='html'?'text/html':test.kind==='image'?'image/*':'application/json'},
   redirect:'manual',cache:'no-store',signal:AbortSignal.timeout(30000),
  });
  const type=response.headers.get('content-type')||'';
  const json=type.includes('application/json')?await response.json().catch(()=>null):null;
  let ok=(test.statuses||[test.status]).includes(response.status);
  if(test.kind==='html'){
   const html=await response.text();
   ok=ok&&type.includes('text/html')&&html.includes('CHẠM ĐÀ NẴNG')&&html.includes('id="root"');
  }
  if(test.kind==='image')ok=ok&&(type.startsWith('image/')||type.includes('octet-stream'));
  if(test.kind==='config')ok=ok&&type.includes('application/json')&&typeof json?.clientId==='string';
  if(test.kind==='protected')ok=ok&&type.includes('application/json');
  if(test.kind==='teacher-only-ai')ok=ok&&type.includes('application/json')&&json?.teacherOnly===true;
  const info={path:test.path,status:response.status,ok,contentType:type};
  if(test.kind==='teacher-only-ai')Object.assign(info,{teacherOnly:json?.teacherOnly===true,aiEnabled:json?.available===true});
  console.log('RELEASE PREFLIGHT',JSON.stringify(info));
  if(!ok)failed=true;
 }catch(error){
  failed=true;
  console.error('RELEASE PREFLIGHT FAILED',JSON.stringify({path:test.path,error:error?.name||'network_error'}));
 }
}
if(failed){
 console.error('RELEASE BLOCKED: Production does not pass strict anonymous readiness. Do not approve school-wide launch.');
 process.exitCode=1;
}else console.log('RELEASE READ-ONLY PREFLIGHT PASS: public routes checked without triggering Firestore write probes; Firestore write readiness is not verified.');
