
import { createServer } from 'node:http';
import { createAuth, firestoreStore } from './auth-server.mjs';
import { contentStorage } from './content-storage.mjs';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';

const dataDir = path.resolve(process.env.CONTENT_DATA_DIR || './content-data');
const dataFile = path.join(dataDir, 'stations.json');
const cloudStore = process.env.AUTH_FIRESTORE_PROJECT ? firestoreStore(process.env.AUTH_FIRESTORE_PROJECT, process.env.AUTH_FIRESTORE_DATABASE || '(default)') : null;
const durableContent = cloudStore ? contentStorage(cloudStore) : null;
const auth = createAuth({
  store: cloudStore,
  adminEmail: process.env.AUTH_ADMIN_EMAIL, adminPassword: process.env.AUTH_ADMIN_PASSWORD,
  secureCookie: process.env.AUTH_LOCAL_HTTP !== 'true' || !!process.env.K_SERVICE,
});
await mkdir(dataDir, { recursive: true });
let stations = {};
try { stations = JSON.parse(await readFile(dataFile, 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const themeFile = path.join(dataDir, 'theme.json');
let theme = { desktop:'',mobile:'',lightness:.12,blur:0 };
try { theme = JSON.parse(await readFile(themeFile,'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
let writes = Promise.resolve();
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
    if (size > (req.url.startsWith('/api/auth/') || req.url === '/api/admin/users' ? 16384 : 32 * 1024 * 1024)) throw Object.assign(new Error('Too large'), { status: 413 });
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw Object.assign(new Error('Invalid JSON'), { status: 400 }); }
}
const types = { '.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png', '.svg':'image/svg+xml', '.webmanifest':'application/manifest+json', '.jpg':'image/jpeg', '.webp':'image/webp', '.woff2':'font/woff2' };
const server = createServer(async (req,res) => {
  try {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (pathname === '/api/content' && req.method === 'GET') {
      const current = durableContent ? await durableContent.load() : {stations,theme};
      return json(res,200,{ schemaVersion:1,...current });
    }
    if (await auth.handle(req,res,pathname,body,json)) return;
    if (pathname === '/api/content/login') return json(res,410,{ error:'Hãy đăng nhập bằng tài khoản quản trị.' });
    if (pathname === '/api/theme' && req.method === 'PUT') {
      auth.sameOrigin(req); await auth.requireAdmin(req);
      const data = await body(req);
      const validImage = value => value === '' || (typeof value === 'string' && (/^https:\/\//i.test(value) || /^data:image\/(png|jpeg|webp|gif);base64,/i.test(value)));
      if (!validImage(data.desktop) || !validImage(data.mobile) || !Number.isFinite(data.lightness) || data.lightness < 0 || data.lightness > .65 || !Number.isFinite(data.blur) || data.blur < 0 || data.blur > 6)
        return json(res,400,{ error:'Invalid theme settings' });
      const clean = { desktop:data.desktop,mobile:data.mobile,lightness:data.lightness,blur:data.blur };
      const operation = writes.then(async () => {
        if (durableContent) { await durableContent.saveTheme(clean); return; }
        if (process.env.K_SERVICE) throw Object.assign(new Error('Chưa cấu hình kho học liệu lâu dài.'),{status:503});
        await writeFile(themeFile + '.tmp',JSON.stringify(clean),{ mode:0o600 });
        await rename(themeFile + '.tmp',themeFile); theme = clean;
      });
      writes = operation.catch(() => {});
      await operation;
      return json(res,200,{ saved:true });
    }
    if (pathname.startsWith('/api/content/') && req.method === 'PUT') {
      auth.sameOrigin(req); await auth.requireAdmin(req);
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
        if (durableContent) { await durableContent.saveStation(id,clean); return; }
        if (process.env.K_SERVICE) throw Object.assign(new Error('Chưa cấu hình kho học liệu lâu dài.'),{status:503});
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
    json(res,error.status || 500,{ error:error.status ? error.message : 'Could not process request' });
  }
});
server.listen(Number(process.env.PORT || 3000),'0.0.0.0',() => console.log('CHAM DA NANG content server started'));
