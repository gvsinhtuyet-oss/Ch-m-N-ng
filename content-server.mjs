
import { createServer } from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';

const dataDir = path.resolve(process.env.CONTENT_DATA_DIR || './content-data');
const dataFile = path.join(dataDir, 'stations.json');
const password = process.env.CONTENT_ADMIN_PASSWORD;
const publishingEnabled = typeof password === 'string' && password.length >= 12;
if (!publishingEnabled) console.warn('Content publishing disabled: configure CONTENT_ADMIN_PASSWORD (at least 12 characters).');
await mkdir(dataDir, { recursive: true });
let stations = {};
try { stations = JSON.parse(await readFile(dataFile, 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const themeFile = path.join(dataDir, 'theme.json');
let theme = { desktop:'',mobile:'',lightness:.12,blur:0 };
try { theme = JSON.parse(await readFile(themeFile,'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const tokens = new Map();
let failures = 0, blockedUntil = 0, writes = Promise.resolve();
const validUrl = value => typeof value === 'string' && (
  value === '' || /^https:\/\//i.test(value) ||
  /^data:(image\/(png|jpeg|webp|gif)|application\/pdf|audio\/(mpeg|mp3|wav|ogg|mp4|x-wav)|video\/(mp4|webm|ogg));base64,/i.test(value)
);
const json = (res,status,data) => {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
};
async function body(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 32 * 1024 * 1024) throw Object.assign(new Error('Too large'), { status: 413 });
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw Object.assign(new Error('Invalid JSON'), { status: 400 }); }
}
const types = { '.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png', '.svg':'image/svg+xml', '.webmanifest':'application/manifest+json', '.jpg':'image/jpeg', '.webp':'image/webp', '.woff2':'font/woff2' };
const server = createServer(async (req,res) => {
  try {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (pathname === '/api/content' && req.method === 'GET') return json(res,200,{ schemaVersion:1,stations,theme });
    if (pathname === '/api/content/login' && req.method === 'POST') {
      if (!publishingEnabled) return json(res,503,{ error:'Chưa cấu hình mật khẩu xuất bản học liệu trên máy chủ.' });
      if (Date.now() < blockedUntil) return json(res,429,{ error:'Try again later' });
      const data = await body(req);
      const supplied = Buffer.from(typeof data.password === 'string' ? data.password : '');
      const expected = Buffer.from(password);
      if (supplied.length !== expected.length || !timingSafeEqual(supplied,expected)) {
        if (++failures >= 10) { blockedUntil = Date.now() + 60000; failures = 0; }
        return json(res,401,{ error:'Invalid password' });
      }
      failures = 0;
      for (const [token,expiry] of tokens) if (expiry < Date.now()) tokens.delete(token);
      const token = randomBytes(32).toString('hex');
      tokens.set(token, Date.now() + 3600000);
      return json(res,200,{ token });
    }
    if (pathname === '/api/theme' && req.method === 'PUT') {
      const token = (req.headers.authorization || '').replace(/^Bearer /,'');
      if ((tokens.get(token) || 0) < Date.now()) return json(res,401,{ error:'Authentication required' });
      const data = await body(req);
      const validImage = value => value === '' || (typeof value === 'string' && (/^https:\/\//i.test(value) || /^data:image\/(png|jpeg|webp|gif);base64,/i.test(value)));
      if (!validImage(data.desktop) || !validImage(data.mobile) || !Number.isFinite(data.lightness) || data.lightness < 0 || data.lightness > .65 || !Number.isFinite(data.blur) || data.blur < 0 || data.blur > 6)
        return json(res,400,{ error:'Invalid theme settings' });
      const clean = { desktop:data.desktop,mobile:data.mobile,lightness:data.lightness,blur:data.blur };
      const operation = writes.then(async () => {
        await writeFile(themeFile + '.tmp',JSON.stringify(clean),{ mode:0o600 });
        await rename(themeFile + '.tmp',themeFile); theme = clean;
      });
      writes = operation.catch(() => {});
      await operation;
      return json(res,200,{ saved:true });
    }
    if (pathname.startsWith('/api/content/') && req.method === 'PUT') {
      const token = (req.headers.authorization || '').replace(/^Bearer /, '');
      if ((tokens.get(token) || 0) < Date.now()) return json(res,401,{ error:'Authentication required' });
      const id = decodeURIComponent(pathname.slice('/api/content/'.length));
      const content = await body(req);
      if (!/^[a-zA-Z0-9_-]{1,100}$/.test(id) ||
          !validUrl(content.coverImage) || !validUrl(content.mapImage) ||
          !Array.isArray(content.hotspots) || !content.hotspots.length || content.hotspots.length > 30 ||
          !content.hotspots.every(h => typeof h.id === 'string' && typeof h.titleVi === 'string' && typeof h.narrationVi === 'string' && typeof h.keyFactVi === 'string' && validUrl(h.image)) ||
          !Array.isArray(content.resources) || content.resources.length > 50 ||
          !content.resources.every(r => typeof r.id === 'string' && typeof r.title === 'string' && r.title.trim() && validUrl(r.url) && r.url && ['document','video','audio','image'].includes(r.kind)))
        return json(res,400,{ error:'Invalid station content' });
      const clean = { coverImage:content.coverImage,mapImage:content.mapImage,hotspots:content.hotspots,resources:content.resources };
      const operation = writes.then(async () => {
        const next = { ...stations,[id]:clean };
        await writeFile(dataFile + '.tmp',JSON.stringify(next),{ mode:0o600 });
        await rename(dataFile + '.tmp',dataFile);
        stations = next;
      });
      writes = operation.catch(() => {});
      await operation;
      return json(res,200,{ saved:true });
    }
    if (pathname.startsWith('/api/')) return json(res,404,{ error:'Not found' });
    if (!['GET','HEAD'].includes(req.method)) return json(res,405,{ error:'Method not allowed' });
    const root = path.resolve('dist');
    const filename = path.resolve(root, '.' + decodeURIComponent(pathname));
    if (filename !== root && !filename.startsWith(root + path.sep)) return json(res,403,{ error:'Forbidden' });
    let data, served = filename;
    try { data = await readFile(filename); }
    catch {
      if (path.extname(pathname)) return json(res,404,{ error:'Not found' });
      served = path.join(root,'index.html'); data = await readFile(served);
    }
    res.writeHead(200,{ 'Content-Type':types[path.extname(served)] || 'application/octet-stream', 'X-Content-Type-Options':'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch (error) {
    console.error('Content server error:',error.message);
    json(res,error.status || 500,{ error:'Could not process request' });
  }
});
server.listen(Number(process.env.PORT || 3000),'0.0.0.0',() => console.log('CHAM DA NANG content server started'));
