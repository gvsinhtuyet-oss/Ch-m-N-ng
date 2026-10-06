
import { createServer } from 'node:http';
import { createAuth, firestoreStore } from './auth-server.mjs';
import { contentStorage } from './content-storage.mjs';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { randomBytes, createHash } from 'node:crypto';
import path from 'node:path';

const dataDir = path.resolve(process.env.CONTENT_DATA_DIR || './content-data');
const dataFile = path.join(dataDir, 'stations.json');
const LEGACY_FIRESTORE_DATABASE = 'ai-studio-chmnnghnhtrnhskh-71b45c71-26f3-4479-9372-306c6b35245a';
const DEFAULT_FIRESTORE_DATABASE = 'ai-studio-71b45c71-26f3-4479-9372-306c6b35245a';
const configuredFirestoreDatabase = process.env.AUTH_FIRESTORE_DATABASE || DEFAULT_FIRESTORE_DATABASE;
const firestoreDatabase = configuredFirestoreDatabase === LEGACY_FIRESTORE_DATABASE
  ? DEFAULT_FIRESTORE_DATABASE
  : configuredFirestoreDatabase;
const cloudStore = process.env.AUTH_FIRESTORE_PROJECT
  ? firestoreStore(process.env.AUTH_FIRESTORE_PROJECT, firestoreDatabase)
  : null;
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
const studentSyncKey = code => createHash('sha256').update(String(code || '').trim().toUpperCase()).digest('hex');
const cleanSyncCode = value => String(value || '').toUpperCase().replace(/[^A-Z0-9]/g,'');
const newSyncCode = () => {
  const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes=randomBytes(12);
  let raw='';
  for(let i=0;i<12;i++) raw+=alphabet[bytes[i]%alphabet.length];
  return raw.match(/.{1,4}/g).join('-');
};
const validStudentProfile = profile => !!profile &&
  typeof profile.id === 'string' && /^[a-zA-Z0-9_-]{6,120}$/.test(profile.id) &&
  typeof profile.name === 'string' && profile.name.trim().length >= 1 && profile.name.trim().length <= 100 &&
  typeof profile.className === 'string' && /^[1-5]\/[1-9][0-9]{0,2}$/.test(profile.className) &&
  Number.isInteger(profile.grade) && profile.grade >= 1 && profile.grade <= 5 &&
  Number(profile.className.split('/')[0]) === profile.grade;
const cleanProgressRecord = (record, studentId, stationId) => {
  if (!record || typeof record !== 'object') return null;
  const arr = value => Array.isArray(value) ? [...new Set(value.filter(v => typeof v === 'string').slice(0,100))] : [];
  const iso = value => typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? value : undefined;
  const stage1Completed = !!record.stage1Completed;
  const stage2Completed = !!record.stage2Completed;
  const stage3Completed = !!record.stage3Completed;
  const baseCompleted = stage1Completed && stage2Completed && stage3Completed;
  const journeyMapReceived = baseCompleted && !!record.journeyMapReceived;
  const keyFragmentReceived = baseCompleted && !!record.keyFragmentReceived;
  const finalCompleted = journeyMapReceived && keyFragmentReceived && !!record.stage4Completed;
  const clean = {
    studentId,
    stationId,
    stage1Completed,
    stage2Completed,
    stage3Completed,
    stage4Completed: finalCompleted,
    stationCompleted: finalCompleted && !!record.stationCompleted,
    exploredHotspotIds: arr(record.exploredHotspotIds),
    rewardsCollected: arr(record.rewardsCollected),
    stampReceived: finalCompleted && !!record.stampReceived,
    journeyMapReceived,
    keyFragmentReceived,
    lastVisitedAt: iso(record.lastVisitedAt) || new Date().toISOString(),
    syncStatus: 'synced',
  };
  for (const key of ['journeyMapReceivedAt','keyFragmentReceivedAt','startedAt','completedAt']) {
    const value=iso(record[key]); if(value) clean[key]=value;
  }
  if (record.checkInResponse && typeof record.checkInResponse === 'object') {
    const submittedAt=iso(record.checkInResponse.submittedAt);
    if (submittedAt) clean.checkInResponse={
      emotionId: typeof record.checkInResponse.emotionId === 'string' ? record.checkInResponse.emotionId.slice(0,100) : '',
      rememberOptionIds: arr(record.checkInResponse.rememberOptionIds),
      actionOptionIds: arr(record.checkInResponse.actionOptionIds),
      submittedAt,
    };
  }
  return clean;
};
const mergeProgressRecord = (older, newer) => {
  if (!older) return newer;
  const union=(a,b)=>[...new Set([...(Array.isArray(a)?a:[]),...(Array.isArray(b)?b:[])])];
  const earliest=(a,b)=>!a?b:!b?a:(Date.parse(a)<=Date.parse(b)?a:b);
  const latest=(a,b)=>!a?b:!b?a:(Date.parse(a)>=Date.parse(b)?a:b);
  const checkIn = !older.checkInResponse ? newer.checkInResponse :
    !newer.checkInResponse ? older.checkInResponse :
    Date.parse(newer.checkInResponse.submittedAt) >= Date.parse(older.checkInResponse.submittedAt) ? newer.checkInResponse : older.checkInResponse;
  return {
    ...older,
    ...newer,
    stage1Completed: !!(older.stage1Completed || newer.stage1Completed),
    stage2Completed: !!(older.stage2Completed || newer.stage2Completed),
    stage3Completed: !!(older.stage3Completed || newer.stage3Completed),
    stage4Completed: !!(older.stage4Completed || newer.stage4Completed),
    stationCompleted: !!(older.stationCompleted || newer.stationCompleted),
    stampReceived: !!(older.stampReceived || newer.stampReceived),
    journeyMapReceived: !!(older.journeyMapReceived || newer.journeyMapReceived),
    keyFragmentReceived: !!(older.keyFragmentReceived || newer.keyFragmentReceived),
    exploredHotspotIds: union(older.exploredHotspotIds,newer.exploredHotspotIds),
    rewardsCollected: union(older.rewardsCollected,newer.rewardsCollected),
    startedAt: earliest(older.startedAt,newer.startedAt),
    journeyMapReceivedAt: earliest(older.journeyMapReceivedAt,newer.journeyMapReceivedAt),
    keyFragmentReceivedAt: earliest(older.keyFragmentReceivedAt,newer.keyFragmentReceivedAt),
    completedAt: earliest(older.completedAt,newer.completedAt),
    lastVisitedAt: latest(older.lastVisitedAt,newer.lastVisitedAt) || new Date().toISOString(),
    checkInResponse: checkIn,
    syncStatus: 'synced',
  };
};
const json = (res,status,data) => {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
};
async function body(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > (req.url.startsWith('/api/auth/') || req.url === '/api/admin/users' || req.url === '/api/teacher/classes' ? 32768 : 32 * 1024 * 1024)) throw Object.assign(new Error('Too large'), { status: 413 });
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw Object.assign(new Error('Invalid JSON'), { status: 400 }); }
}
const types = { '.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png', '.svg':'image/svg+xml', '.webmanifest':'application/manifest+json', '.jpg':'image/jpeg', '.webp':'image/webp', '.woff2':'font/woff2' };
const server = createServer(async (req,res) => {
  try {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (pathname === '/api/health' && req.method === 'GET') {
      let firestoreStatus = 'unknown';
      let adminAccountExists = false;
      const adminEmail = typeof process.env.AUTH_ADMIN_EMAIL === 'string'
        ? process.env.AUTH_ADMIN_EMAIL.trim().toLowerCase()
        : '';
      if (cloudStore) {
        try {
          await cloudStore.get('cham_users', 'health-check');
          firestoreStatus = 'connected';
          if (adminEmail) {
            const adminId = createHash('sha256').update(adminEmail).digest('hex');
            const adminUser = await cloudStore.get('cham_users', adminId);
            adminAccountExists = !!(adminUser && adminUser.role === 'admin' && adminUser.active);
          }
        } catch (err) {
          firestoreStatus = `error: ${err.message}`;
        }
      } else {
        firestoreStatus = 'unconfigured';
      }
      const bootstrapSecretConfigured =
        typeof process.env.AUTH_ADMIN_PASSWORD === 'string' &&
        process.env.AUTH_ADMIN_PASSWORD.length >= 12 &&
        process.env.AUTH_ADMIN_PASSWORD.length <= 128;
      return json(res, 200, {
        status: 'ok',
        project: process.env.AUTH_FIRESTORE_PROJECT || null,
        database: firestoreDatabase,
        firestore: firestoreStatus,
        auth: {
          adminEmailConfigured: !!adminEmail,
          adminAccountExists,
          bootstrapSecretConfigured,
          ready: firestoreStatus === 'connected' && !!adminEmail && (adminAccountExists || bootstrapSecretConfigured),
        },
        contentStorage: durableContent ? 'firestore' : 'local',
      });
    }
    if (pathname === '/api/content' && req.method === 'GET') {
      const current = durableContent ? await durableContent.load() : {stations,theme};
      return json(res,200,{ schemaVersion:1,...current });
    }
    if (pathname === '/api/student/sync/register' && req.method === 'POST') {
      if (!cloudStore) return json(res,503,{error:'Đồng bộ học sinh chưa được cấu hình trên máy chủ.'});
      auth.sameOrigin(req);
      const data=await body(req);
      if (!validStudentProfile(data.profile)) return json(res,400,{error:'Thông tin học sinh chưa hợp lệ.'});
      let code, key;
      for(let attempt=0;attempt<6;attempt++){
        code=newSyncCode(); key=studentSyncKey(code);
        if (!(await cloudStore.get('cham_student_sync',key))) break;
        code=undefined;
      }
      if(!code || !key) return json(res,503,{error:'Chưa tạo được mã đồng bộ. Vui lòng thử lại.'});
      const profile={id:data.profile.id,name:data.profile.name.trim(),className:data.profile.className,grade:data.profile.grade};
      await cloudStore.put('cham_student_sync',key,{profile,progress:{},createdAt:Date.now(),updatedAt:Date.now()},true);
      return json(res,200,{syncCode:code,profile,progress:{}});
    }
    if (pathname === '/api/student/sync/restore' && req.method === 'POST') {
      if (!cloudStore) return json(res,503,{error:'Đồng bộ học sinh chưa được cấu hình trên máy chủ.'});
      auth.sameOrigin(req);
      const data=await body(req), code=cleanSyncCode(data.syncCode);
      if(code.length!==12) return json(res,400,{error:'Mã đồng bộ chưa đúng.'});
      const saved=await cloudStore.get('cham_student_sync',studentSyncKey(code));
      if(!saved?.profile) return json(res,404,{error:'Không tìm thấy mã đồng bộ.'});
      return json(res,200,{profile:saved.profile,progress:saved.progress || {}});
    }
    if (pathname === '/api/student/sync/progress' && req.method === 'PUT') {
      if (!cloudStore) return json(res,503,{error:'Đồng bộ học sinh chưa được cấu hình trên máy chủ.'});
      auth.sameOrigin(req);
      const data=await body(req), code=cleanSyncCode(data.syncCode);
      if(code.length!==12 || !data.progress || typeof data.progress!=='object' || Array.isArray(data.progress))
        return json(res,400,{error:'Dữ liệu đồng bộ chưa hợp lệ.'});
      const key=studentSyncKey(code), saved=await cloudStore.get('cham_student_sync',key);
      if(!saved?.profile || !validStudentProfile(saved.profile)) return json(res,404,{error:'Không tìm thấy mã đồng bộ.'});
      const incomingEntries=Object.entries(data.progress);
      if(incomingEntries.length>30) return json(res,400,{error:'Có quá nhiều bản ghi tiến độ.'});
      const merged={...(saved.progress || {})};
      for(const [stationId,record] of incomingEntries){
        if(!/^[a-zA-Z0-9_-]{1,100}$/.test(stationId)) return json(res,400,{error:'Mã trạm chưa hợp lệ.'});
        const clean=cleanProgressRecord(record,saved.profile.id,stationId);
        if(!clean) return json(res,400,{error:'Bản ghi tiến độ chưa hợp lệ.'});
        merged[stationId]=mergeProgressRecord(merged[stationId],clean);
      }
      await cloudStore.put('cham_student_sync',key,{...saved,progress:merged,updatedAt:Date.now()});
      return json(res,200,{saved:true,progress:merged});
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
