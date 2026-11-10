// Read-only live diagnostic. No credentials; never sends a POST or mutates data.
// GET on a POST-only route must return 405 if the handler is installed.
const base=process.env.API_ORIGIN||'https://chamdanang-gddp.pages.dev';
const routes=['/api/learning/rating','/api/learning/proposals','/api/admin/station-ratings'];
let failed=false;
for(const path of routes){
 try{
  const response=await fetch(new URL(path,base),{
   headers:{Accept:'application/json'},
   cache:'no-store',redirect:'manual',signal:AbortSignal.timeout(20000),
  });
  const expected=path.startsWith('/api/learning/')?405:401;
  const ok=response.status===expected && (response.headers.get('content-type')||'').includes('application/json');
  if(!ok)failed=true;
  console.log(JSON.stringify({path,status:response.status,expectedWithoutCredentials:expected,ok,missing:response.status===404}));
 }catch(error){failed=true;console.error(JSON.stringify({path,unavailable:error.name||'NetworkError'}));}
}

if(failed){console.error('RELEASE BLOCKED: rating/proposal/Admin handlers not verified live.');process.exitCode=1;}
