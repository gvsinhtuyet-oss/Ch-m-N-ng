// Read-only Production probe. A missing backend route must block release, never
// masquerade as a successful teacher-issued student identity deployment.
const hosts=['https://chamdanang-gddp.pages.dev','https://chamdanang-gddp.ai.studio'];
let failed=false;
for(const host of hosts){
  const url=new URL('/api/teacher/student-access?classId='+('a'.repeat(64)),host);
  try{
    const response=await fetch(url,{method:'GET',headers:{Accept:'application/json'},signal:AbortSignal.timeout(12000)});
    const type=response.headers.get('content-type')||'';
    const pass=response.status===401&&type.includes('application/json');
    console.log(JSON.stringify({host,status:response.status,json:type.includes('application/json'),result:pass?'protected-route-present':'route-not-verified'}));
    if(!pass)failed=true;
  }catch(error){
    console.error(host+': '+error.message);
    failed=true;
  }
}
if(failed){
  console.error('Student identity backend is not proven live on both hosts. Do not publish student-code-only UI until the existing backend service is updated and rerun this probe.');
  process.exitCode=1;
}
