// Keep the existing Google Cloud identity, database, accounts and API code.
// This gateway has no database credentials and never acts as an open proxy.
export const BACKEND_ORIGIN = 'https://chamdanang-gddp.ai.studio';
const error = (status, message) => Response.json({error: message}, {
  status, headers: {'Cache-Control': 'no-store'},
});

export async function proxyApi(request, fetchUpstream = fetch) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/api/')) return error(404, 'Not found');
  if (!['GET', 'HEAD', 'POST', 'PUT', 'DELETE'].includes(request.method)) {
    return error(405, 'Method not allowed');
  }
  const mutation = !['GET', 'HEAD'].includes(request.method);
  // Validate at the public boundary BEFORE translating the origin for Cloud Run.
  // Cross-site forms/fetches must never acquire same-origin privileges upstream.
  if (mutation && (request.headers.get('origin') !== url.origin ||
      request.headers.get('sec-fetch-site') === 'cross-site')) {
    return error(403, 'Nguồn yêu cầu không hợp lệ.');
  }
  if (mutation && !request.headers.get('content-type')?.startsWith('application/json')) {
    return error(415, 'Yêu cầu phải dùng JSON.');
  }
  const headers = new Headers({Accept: 'application/json'});
  if (mutation) {
    headers.set('Origin', BACKEND_ORIGIN);
    headers.set('Content-Type', 'application/json');
  }
  // Do not forward Cloudflare cookies, Authorization, Host or spoofed proxy headers.
  const session = /(?:^|;\s*)(cham_session=[a-f0-9]{48}(?:[a-f0-9]{16})?)(?:;|$)/
    .exec(request.headers.get('cookie') || '')?.[1];
  const feedback = /(?:^|;\s*)(cham_feedback=[a-f0-9]{64})(?:;|$)/.exec(request.headers.get('cookie') || '')?.[1];
  const cookies = [session, feedback].filter(Boolean).join('; ');
  if (cookies) headers.set('Cookie', cookies);
  try {
    const upstream = await fetchUpstream(BACKEND_ORIGIN + url.pathname + url.search, {
      method: request.method, headers, redirect: 'manual',
      ...(mutation ? {body: await request.arrayBuffer()} : {}),
      signal: AbortSignal.timeout(120000),
    });
    // An auth wall/redirect/HTML page must not masquerade as a successful API call.
    if (upstream.status >= 300 && upstream.status < 400 ||
        !upstream.headers.get('content-type')?.includes('application/json')) {
      return error(502, 'Máy chủ dữ liệu chưa trả về API hợp lệ.');
    }
    const responseHeaders = new Headers({
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
    });
    for (const name of ['Set-Cookie', 'Retry-After']) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    // The backend cookie is host-only, Secure, HttpOnly, SameSite=Strict.
    return new Response(request.method === 'HEAD' ? null : upstream.body, {
      status: upstream.status, headers: responseHeaders,
    });
  } catch {
    return error(503, 'Chưa kết nối được máy chủ dữ liệu. Tiến độ trên máy vẫn được giữ.');
  }
}

export const onRequest = ({request}) => proxyApi(request);
