// Public, read-only deployment diagnostics; do not send credentials or modify school data.
const base = process.env.PUBLIC_URL || 'https://chamdanang-gddp.pages.dev/';
const checks = ['/api/admin/station-ratings','/api/teacher/proposals','/api/effectiveness?days=7','/api/health'];
for (const path of checks) {
  try {
    const response = await fetch(new URL(path,base),{
      headers: {Accept:'application/json'},redirect:'manual',cache:'no-store',
      signal:AbortSignal.timeout(30000),
    });
    const json = response.headers.get('content-type')?.includes('application/json')
      ? await response.json().catch(()=>null) : null;
    if (path === '/api/health') {
      console.log('LIVE HEALTH',JSON.stringify({
        status:response.status,
        firestoreConnected: json?.firestore === 'connected',
        writeConnected: json?.firestoreWrite === 'connected',
        authReady: json?.auth?.ready === true,
        contentConfigured:json?.contentStorage === 'firestore',
        readErrorCode:json?.firestoreError?.code||null,
        writeErrorCode:json?.firestoreWriteError?.code||null,
      }));
    } else {
      console.log('LIVE API',JSON.stringify({path,status:response.status,
        available:response.status!==404,
        anonymousDenied:response.status===401||response.status===403,
        unconfigured:response.status===503,
      }));
    }
  } catch(error) {
    console.log('LIVE PROBE ERROR',JSON.stringify({path,message:error.name||'network-failure'}));
  }
}
