import { randomBytes, createHash, createHmac, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(scryptCallback);
const hash = value => createHash('sha256').update(value).digest('hex');
const emailOf = value => typeof value === 'string' ? value.trim().toLowerCase() : '';
const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
const fail = (status, message, extra = {}) => Object.assign(new Error(message), { status, ...extra });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const safeUser = user => ({ id:user.id, email:user.email, name:user.name, role:user.role,
  ...(user.role === 'teacher' ? { assignedClasses:[], schoolName:'Trường Tiểu học Trần Đại Nghĩa' } : { permissions:['manage-content','manage-users'] }) });
export async function passwordHash(password) {
  if (typeof password !== 'string' || password.length < 12 || password.length > 128)
    throw fail(400, 'Mật khẩu cần từ 12 đến 128 ký tự.');
  const salt = randomBytes(16).toString('hex');
  return salt + ':' + (await scrypt(password, salt, 64)).toString('hex');
}
async function matches(password, encoded) {
  if (typeof password !== 'string' || typeof encoded !== 'string') return false;
  const [salt, key] = encoded.split(':');
  if (!salt || !/^[a-f0-9]{128}$/i.test(key || '')) return false;
  const actual = await scrypt(password, salt, 64);
  const expected = Buffer.from(key, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
// IAM credentials stay on the server. No service-account key is sent to the app.
export function firestoreStore(project, database = '(default)', fetchRequest = fetch) {
  const root = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(project)}/databases/${encodeURIComponent(database)}/documents`;
  let cachedToken, expires = 0;
  async function request(route, method='GET', data, query='') {
    let lastError;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (!cachedToken || expires < Date.now()) {
          const tokenResponse = await fetchRequest(
            'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token',
            { headers:{ 'Metadata-Flavor':'Google' }, signal:AbortSignal.timeout(5000) }
          );
          if (!tokenResponse.ok) {
            throw fail(503, 'Chưa kết nối được danh tính máy chủ.', {
              storageStatus: tokenResponse.status,
              storageCode: 'METADATA_TOKEN_ERROR',
            });
          }
          const token = await tokenResponse.json();
          cachedToken = token.access_token;
          expires = Date.now() + Math.max(30, Number(token.expires_in || 300) - 60) * 1000;
        }

        const response = await fetchRequest(root + '/' + route + query, {
          method,
          headers:{ Authorization:'Bearer ' + cachedToken, 'Content-Type':'application/json' },
          ...(data ? {
            body:JSON.stringify({
              fields:{
                payload:{ stringValue:JSON.stringify(data) },
                ...(Number.isFinite(data.expiresAt)
                  ? {expireAt:{timestampValue:new Date(data.expiresAt).toISOString()}}
                  : {})
              }
            })
          } : {}),
          signal:AbortSignal.timeout(10000)
        });

        if (response.status === 401 && attempt < 2) {
          cachedToken = undefined;
          expires = 0;
          await sleep(150 * (attempt + 1));
          continue;
        }

        if (response.status === 404) {
          const detail = await response.json().catch(() => ({}));
          const message = detail.error?.message || 'Not found';
          // Firestore's document paths contain "/databases/"; that path is not evidence
          // that the database itself is missing. A missing document is normal
          // before the first admin account has been created.
          const missingDocument = /^Document\s+["'`]?projects\/.*\/documents\//i.test(message) ||
            /^Document\s+(?:not found|does not exist)/i.test(message);
          const missingDatabase = !missingDocument &&
            /^(?:NOT_FOUND:\s*)?(?:The\s+)?database\b[^\n]*(?:does not exist|not found)/i.test(message);
          if (!missingDatabase && ((method === 'GET' && route.includes('/')) || method === 'DELETE')) return null;
          console.error('Firestore 404', message);
          throw fail(503, missingDatabase
            ? 'Không tìm thấy cơ sở dữ liệu Firestore đã cấu hình.'
            : 'Không thể ghi dữ liệu vào Firestore. Hãy kiểm tra cơ sở dữ liệu và quyền của Cloud Run.', {
            storageStatus: 404,
            storageCode: detail.error?.status || 'NOT_FOUND',
            storageDetail: message,
          });
        }

        if (response.status === 409 || response.status === 412)
          throw fail(409, 'Tài khoản đã tồn tại hoặc vừa được thay đổi.', {
            storageStatus: response.status,
            storageCode: response.status === 409 ? 'ALREADY_EXISTS' : 'FAILED_PRECONDITION',
          });

        if (!response.ok) {
          const detail = await response.json().catch(() => ({}));
          const message = detail.error?.message || response.statusText || 'Firestore request failed';
          const code = detail.error?.status || 'HTTP_' + response.status;
          console.error('Auth storage HTTP', response.status, code, message);

          if ([429,500,502,503,504].includes(response.status) && attempt < 2) {
            lastError = fail(503, 'Kho tài khoản đang bận. Vui lòng thử lại.', {
              storageStatus: response.status,
              storageCode: code,
              storageDetail: message,
            });
            await sleep(250 * (attempt + 1));
            continue;
          }

          throw fail(503, 'Chưa kết nối được kho tài khoản. Hãy kiểm tra cấu hình Firestore.', {
            storageStatus: response.status,
            storageCode: code,
            storageDetail: message,
          });
        }

        if (method === 'DELETE') return null;
        return response.json();
      } catch (error) {
        if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
          lastError = fail(503, 'Kết nối Firestore bị quá thời gian.', {
            storageCode: 'TIMEOUT',
            storageDetail: error.message,
          });
          if (attempt < 2) {
            await sleep(250 * (attempt + 1));
            continue;
          }
          throw lastError;
        }
        throw error;
      }
    }
    throw lastError || fail(503, 'Chưa kết nối được kho tài khoản.');
  }
  const unpack = doc => doc ? JSON.parse(doc.fields.payload.stringValue) : null;
  return {
    async get(collection,id) { return unpack(await request(collection+'/'+id)); },
    async put(collection,id,data,create=false) {
      // Firestore createDocument is more reliable than PATCH + currentDocument.exists=false
      // for the very first document in a named database.
      if (create) {
        await request(collection,'POST',data,'?documentId='+encodeURIComponent(id));
        return;
      }
      await request(collection+'/'+id,'PATCH',data);
    },
    async remove(collection,id) { await request(collection+'/'+id,'DELETE'); },
    async list(collection) {
      const all=[]; let page='';
      do { const result=await request(collection,'GET',undefined,'?pageSize=100'+(page ? '&pageToken='+encodeURIComponent(page) : ''));
        all.push(...(result?.documents || []).map(unpack)); page=result?.nextPageToken || ''; } while(page);
      return all;
    },
  };
}

export function firestoreStoreWithFallback(project, databases, fetchRequest = fetch) {
  const candidates=[...new Set((databases || []).filter(Boolean))];
  if (!candidates.length) throw fail(503,'Chưa cấu hình cơ sở dữ liệu Firestore.');
  const stores=candidates.map(database=>({database,store:firestoreStore(project,database,fetchRequest)}));
  let activeIndex=0;
  const retryable = error =>
    error?.status === 503 &&
    ([404,403].includes(error?.storageStatus) ||
      ['NOT_FOUND','PERMISSION_DENIED','FAILED_PRECONDITION'].includes(error?.storageCode));
  async function run(method,args) {
    let firstError;
    const order=[activeIndex,...stores.map((_,i)=>i).filter(i=>i!==activeIndex)];
    for (const i of order) {
      try {
        const value=await stores[i].store[method](...args);
        activeIndex=i;
        return value;
      } catch (error) {
        if (!firstError) firstError=error;
        if (!retryable(error)) throw error;
      }
    }
    throw firstError || fail(503,'Chưa kết nối được kho tài khoản.');
  }
  return {
    get:(...args)=>run('get',args),
    put:(...args)=>run('put',args),
    remove:(...args)=>run('remove',args),
    list:(...args)=>run('list',args),
    activeDatabase:()=>stores[activeIndex]?.database || candidates[0],
    candidateDatabases:()=>[...candidates],
  };
}

export function createAuth({ store, adminEmail, adminPassword, secureCookie=true }) {
  const owner = emailOf(adminEmail);
  let bootstrap;
  async function ready() {
    if (!store || !validEmail(owner))
      throw fail(503,'Đăng nhập nhân sự chưa được cấu hình đầy đủ trên máy chủ.');
    if (!bootstrap) bootstrap=(async()=>{
      const id=hash(owner);
      const existing=await store.get('cham_users',id);
      if (existing) return;
      if (typeof adminPassword !== 'string' || adminPassword.length < 12 || adminPassword.length > 128)
        throw fail(503,'Chưa có tài khoản quản trị đầu tiên. Hãy cấu hình AUTH_ADMIN_PASSWORD từ 12 đến 128 ký tự rồi thử lại.');
      const user={ id,email:owner,name:'Quản trị nhà trường',role:'admin',active:true,version:1,passwordHash:await passwordHash(adminPassword) };
      try { await store.put('cham_users',id,user,true); } catch(error) { if(error.status !== 409) throw error; }
    })().catch(error=>{ bootstrap=undefined; throw error; });
    await bootstrap;
  }
  const cookie = (res,value,maxAge=28800) => res.setHeader('Set-Cookie',`cham_session=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secureCookie ? '; Secure' : ''}`);
  const rawSessionToken = req =>
    /(?:^|;\s*)cham_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie || '')?.[1] || '';
  const sessionId = req => {
    const raw = rawSessionToken(req);
    return raw ? hash(raw) : '';
  };
  const ownerUser = () => ({
    id: hash(owner), email: owner, name: 'Quản trị nhà trường',
    role: 'admin', active: true, version: 1
  });
  const ownerToken = () => {
    const expiresAt = Date.now() + 8 * 60 * 60 * 1000;
    const exp = expiresAt.toString(16).padStart(16,'0');
    const mac = createHmac('sha256', adminPassword).update(owner + ':' + exp).digest('hex').slice(0,48);
    return exp + mac;
  };
  const validOwnerToken = token => {
    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token) ||
        typeof adminPassword !== 'string' || adminPassword.length < 12 || !validEmail(owner)) return false;
    const exp = token.slice(0,16);
    const expiresAt = Number.parseInt(exp,16);
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false;
    const expected = createHmac('sha256', adminPassword).update(owner + ':' + exp).digest('hex').slice(0,48);
    const actual = token.slice(16);
    return expected.length === actual.length &&
      timingSafeEqual(Buffer.from(expected,'hex'), Buffer.from(actual,'hex'));
  };
  async function userFor(req) {
    const raw = rawSessionToken(req);
    if (validOwnerToken(raw)) return ownerUser();
    await ready();
    const id=sessionId(req); if(!id) return null;
    const session=await store.get('cham_sessions',id);
    if (!session || session.expiresAt <= Date.now()) return null;
    const user=await store.get('cham_users',session.userId);
    if(!user?.active || user.version !== session.version) return null;
    return user;
  }
  async function requireAdmin(req) {
    const user=await userFor(req);
    if(!user) throw fail(401,'Vui lòng đăng nhập lại.');
    if(user.role !== 'admin') throw fail(403,'Chức năng này dành cho quản trị.');
    return user;
  }
  function sameOrigin(req) {
    // Cloud Run / AI Studio may sit behind a reverse proxy. Accept only the
    // exact public host announced by Host or X-Forwarded-Host; CORS stays off.
    const origin=String(req.headers.origin || '');
    const directHost=String(req.headers.host || '').split(',')[0].trim();
    const forwardedHost=String(req.headers['x-forwarded-host'] || '').split(',')[0].trim();
    const forwardedProto=String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
    const hosts=[directHost,forwardedHost].filter(Boolean);
    const protocols=secureCookie ? ['https'] : ['https','http'];
    if (forwardedProto && !protocols.includes(forwardedProto)) protocols.push(forwardedProto);
    const allowed=new Set(hosts.flatMap(host=>protocols.map(proto=>proto+'://'+host)));
    if(!origin || !allowed.has(origin))
      throw fail(403,'Nguồn yêu cầu không hợp lệ.');
    if(!String(req.headers['content-type'] || '').startsWith('application/json'))
      throw fail(415,'Yêu cầu phải dùng JSON.');
  }
  async function handle(req,res,pathname,body,json) {
    if(!pathname.startsWith('/api/auth/') && pathname !== '/api/admin/users' && pathname !== '/api/teacher/classes' && pathname !== '/api/teacher/progress') return false;
    if(!['GET','POST','PUT'].includes(req.method)) { json(res,405,{error:'Method not allowed'}); return true; }
    if(req.method !== 'GET') sameOrigin(req);

    // Emergency owner path: the school administrator can still sign in when
    // Firestore's free AI quota is temporarily exhausted. The session is
    // signed server-side and never stores the password in the browser.
    if(pathname === '/api/auth/login' && req.method === 'POST') {
      const data=await body(req), email=emailOf(data.email);
      const ownerCredentialsMatch =
        email === owner &&
        typeof adminPassword === 'string' && adminPassword.length >= 12 && adminPassword.length <= 128 &&
        typeof data.password === 'string' &&
        timingSafeEqual(Buffer.from(hash(data.password)), Buffer.from(hash(adminPassword)));

      if (ownerCredentialsMatch) {
        cookie(res,ownerToken());
        json(res,200,{user:safeUser(ownerUser())});
        return true;
      }
      if (email === owner) throw fail(401,'Email hoặc mật khẩu chưa đúng.');

      try {
        await ready();
        if(!validEmail(email) || typeof data.password !== 'string' || data.password.length > 128)
          throw fail(401,'Email hoặc mật khẩu chưa đúng.');

        const id=hash(email); let rate=await store.get('cham_auth_limits',id);
        if(rate?.until > Date.now()) throw fail(429,'Bạn đã thử nhiều lần. Vui lòng chờ 1 phút.');

        try { await store.put('cham_auth_locks',id,{until:Date.now()+30000},true); }
        catch(error) {
          if(error.status !== 409) throw error;
          const lock=await store.get('cham_auth_locks',id);
          if(lock?.until > Date.now()) throw fail(429,'Vui lòng chờ rồi thử lại.');
          await store.remove('cham_auth_locks',id);
          throw fail(429,'Vui lòng thử lại.');
        }

        try {
          let user=await store.get('cham_users',id);
          if (user?.active && user.role === 'admin' && email === owner &&
              ownerCredentialsMatch &&
              !(await matches(data.password,user.passwordHash))) {
            user={...user,passwordHash:await passwordHash(adminPassword),version:user.version+1};
            await store.put('cham_users',id,user);
          }
          if(!user?.active || !(await matches(data.password,user.passwordHash))) {
            const count=(rate?.updatedAt > Date.now()-600000 ? rate.count : 0)+1;
            await store.put('cham_auth_limits',id,{count,updatedAt:Date.now(),until:count>=5 ? Date.now()+60000 : 0});
            throw fail(401,'Email hoặc mật khẩu chưa đúng.');
          }
          if (rate) await store.remove('cham_auth_limits',id);
          const token=randomBytes(32).toString('hex');
          await store.put('cham_sessions',hash(token),{userId:id,version:user.version,expiresAt:Date.now()+28800000});
          cookie(res,token);
          json(res,200,{user:safeUser(user)});
          return true;
        } finally {
          try { await store.remove('cham_auth_locks',id); }
          catch (cleanupError) { console.error('Auth lock cleanup failed', cleanupError.message); }
        }
      } catch (error) {
        throw error;
      }
    }
    if(pathname === '/api/auth/session' && req.method === 'GET') {
      const user=await userFor(req); json(res,200,{user:user ? safeUser(user) : null}); return true;
    }
    if(pathname === '/api/auth/logout' && req.method === 'POST') {
      const raw = rawSessionToken(req);
      if (validOwnerToken(raw)) {
        cookie(res,'',0); json(res,200,{ok:true}); return true;
      }
      await ready();
      const id=sessionId(req); if(id) await store.remove('cham_sessions',id);
      cookie(res,'',0); json(res,200,{ok:true}); return true;
    }
    await ready();
    if(pathname === '/api/auth/password' && req.method === 'POST') {
      const user=await userFor(req); if(!user) throw fail(401,'Vui lòng đăng nhập lại.');
      const data=await body(req);
      if(typeof data.currentPassword !== 'string' || data.currentPassword.length>128 || !(await matches(data.currentPassword,user.passwordHash))) throw fail(401,'Mật khẩu hiện tại chưa đúng.');
      await store.put('cham_users',user.id,{...user,passwordHash:await passwordHash(data.password),version:user.version+1});
      cookie(res,'',0); json(res,200,{ok:true}); return true;
    }
    if(pathname === '/api/teacher/progress') {
      const staff=await userFor(req);
      if(!staff) throw fail(401,'Vui lòng đăng nhập lại.');
      if(!['teacher','admin'].includes(staff.role)) throw fail(403,'Không có quyền xem kết quả học sinh.');
      const url=new URL(req.url,'http://localhost');
      const classId=req.method==='GET'?url.searchParams.get('classId'):undefined;
      const data=req.method==='POST'?(sameOrigin(req),await body(req)):null;
      const id=classId || data?.classId;
      if(typeof id!=='string' || !/^[a-f0-9]{64}$/.test(id)) throw fail(400,'Vui lòng chọn lớp hợp lệ.');
      const classroom=await store.get('cham_classes',id);
      if(!classroom) throw fail(404,'Không tìm thấy lớp.');
      if(staff.role!=='admin' && classroom.teacherId!==staff.id) throw fail(403,'Bạn chỉ được xem lớp mình phụ trách.');
      const norm=s=>String(s||'').trim().replace(/\s+/g,' ').normalize('NFC').toLocaleLowerCase('vi');
      if(req.method==='POST') {
        const code=String(data.syncCode||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
        if(!/^[A-Z0-9]{12}$/.test(code)) throw fail(400,'Mã đồng bộ chưa hợp lệ.');
        const key=hash(code);
        const saved=await store.get('cham_student_sync',key);
        if(!saved?.profile) throw fail(404,'Không tìm thấy mã học sinh.');
        const student=saved.profile;
        if(student.grade!==classroom.grade || norm(student.className)!==norm(classroom.name) ||
          !classroom.students.some(name=>norm(name)===norm(student.name)))
          throw fail(400,'Tên, khối và lớp của mã học sinh chưa khớp danh sách đã duyệt.');
        await store.put('cham_teacher_progress_links',hash(id+':'+key),
          {classId:id,syncKey:key,name:student.name,linkedAt:Date.now()});
        json(res,200,{ok:true,name:student.name});return true;
      }
      if(req.method!=='GET') throw fail(405,'Phương thức không hỗ trợ.');
      const links=(await store.list('cham_teacher_progress_links')).filter(link=>link.classId===id);
      const results=[];
      for(const link of links.slice(0,100)){
        if(!classroom.students.some(n=>norm(n)===norm(link.name))) continue;
        const saved=await store.get('cham_student_sync',link.syncKey);
        if(!saved?.profile || saved.profile.grade!==classroom.grade ||
          norm(saved.profile.className)!==norm(classroom.name) || norm(saved.profile.name)!==norm(link.name)) continue;
        const stations=Object.entries(saved.progress||{}).slice(0,30).map(([stationId,p])=>({
          stationId,completed:!!p.stationCompleted,stamp:!!p.stampReceived,
          completedStages:[p.stage1Completed,p.stage2Completed,p.stage3Completed,p.stage4Completed].filter(Boolean).length,
          lastVisitedAt:typeof p.lastVisitedAt==='string'?p.lastVisitedAt:null
        }));
        results.push({name:classroom.students.find(n=>norm(n)===norm(link.name)),stations,completedStations:stations.filter(x=>x.completed).length,
          totalStamps:stations.filter(x=>x.stamp).length});
      }
      return json(res,200,{className:classroom.name,academicYear:classroom.academicYear,
        rosterCount:classroom.students.length,linkedCount:results.length,students:results});
    }
    if(pathname === '/api/teacher/classes') {
      const staff=await userFor(req);
      if(!staff) throw fail(401,'Vui lòng đăng nhập lại.');
      if(staff.role !== 'teacher' && staff.role !== 'admin') throw fail(403,'Không có quyền quản lý lớp.');
      if(req.method === 'GET') {
        const classes=(await store.list('cham_classes')).filter(c=>staff.role === 'admin' || c.teacherId === staff.id);
        json(res,200,{classes}); return true;
      }
      const data=await body(req);
      if(!Number.isInteger(data.grade) || data.grade<1 || data.grade>5 ||
         typeof data.name !== 'string' || !new RegExp(`^${data.grade}/[1-9][0-9]{0,2}$`).test(data.name) ||
         typeof data.academicYear !== 'string' || !/^20[0-9]{2}-20[0-9]{2}$/.test(data.academicYear))
        throw fail(400,'Nhập đúng khối, tên lớp (ví dụ 2/24) và năm học (2026-2027).');
      const [startYear,endYear]=data.academicYear.split('-').map(Number);
      if(endYear !== startYear+1) throw fail(400,'Năm học phải gồm hai năm liên tiếp.');
      if(!Array.isArray(data.students) || data.students.length>100 || data.students.some(n=>typeof n !== 'string' || !n.trim() || n.length>100))
        throw fail(400,'Danh sách tối đa 100 học sinh; mỗi họ tên từ 1 đến 100 ký tự.');
      const id=hash(data.academicYear+':'+data.name);
      const existing=await store.get('cham_classes',id);
      if(existing && existing.teacherId !== staff.id && staff.role !== 'admin') throw fail(403,'Lớp này thuộc giáo viên khác.');
      if(req.method === 'POST' && existing) throw fail(409,'Lớp đã tồn tại. Chọn lớp để cập nhật danh sách.');
      if(req.method === 'PUT' && !existing) throw fail(404,'Không tìm thấy lớp.');
      const names=data.students.map(n=>n.trim());
      const classroom={id,name:data.name,grade:data.grade,academicYear:data.academicYear,
        teacherId:existing?.teacherId || staff.id,teacherName:existing?.teacherName || staff.name,
        students:names,totalStudents:names.length,updatedAt:Date.now()};
      await store.put('cham_classes',id,classroom,req.method === 'POST');
      json(res,200,{classroom}); return true;
    }
    if(pathname === '/api/admin/users') {
      await requireAdmin(req);
      if(req.method === 'GET') { json(res,200,{users:(await store.list('cham_users')).map(user=>({...safeUser(user),active:user.active}))}); return true; }
      const data=await body(req), email=emailOf(data.email), id=hash(email);
      if(!validEmail(email)) throw fail(400,'Email chưa hợp lệ.');
      if(req.method === 'POST') {
        if(typeof data.name !== 'string' || !data.name.trim() || data.name.length>100) throw fail(400,'Vui lòng nhập tên giáo viên.');
        await store.put('cham_users',id,{id,email,name:data.name.trim(),role:'teacher',active:true,version:1,passwordHash:await passwordHash(data.password)},true);
      } else {
        const user=await store.get('cham_users',id); if(!user || user.role !== 'teacher') throw fail(400,'Chỉ có thể chỉnh tài khoản giáo viên.');
        if(typeof data.active !== 'boolean') throw fail(400,'Trạng thái chưa hợp lệ.');
        await store.put('cham_users',id,{...user,active:data.active,version:user.version+1,...(data.password ? {passwordHash:await passwordHash(data.password)} : {})});
      }
      json(res,200,{ok:true}); return true;
    }
    json(res,404,{error:'Not found'}); return true;
  }
  return { handle, requireAdmin, sameOrigin };
}
