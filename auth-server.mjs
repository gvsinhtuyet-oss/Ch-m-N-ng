import { randomBytes, createHash, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(scryptCallback);
const hash = value => createHash('sha256').update(value).digest('hex');
const emailOf = value => typeof value === 'string' ? value.trim().toLowerCase() : '';
const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
const fail = (status, message) => Object.assign(new Error(message), { status });
const safeUser = user => ({ id:user.id, email:user.email, name:user.name, role:user.role,
  ...(user.role === 'teacher' ? { assignedClasses:[], schoolName:'Trường Tiểu học Trần Đại Nghĩa' } : { permissions:['manage-content','manage-users'] }) });
export async function passwordHash(password) {
  if (typeof password !== 'string' || password.length < 12 || password.length > 128)
    throw fail(400, 'Mật khẩu cần từ 12 đến 128 ký tự.');
  const salt = randomBytes(16).toString('hex');
  return salt + ':' + (await scrypt(password, salt, 64)).toString('hex');
}
async function matches(password, encoded) {
  const [salt, key] = encoded.split(':');
  const actual = await scrypt(password, salt, 64);
  return timingSafeEqual(actual, Buffer.from(key, 'hex'));
}
// IAM credentials stay on the server. No service-account key is sent to the app.
export function firestoreStore(project, database = '(default)') {
  const root = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(project)}/databases/${encodeURIComponent(database)}/documents`;
  let cachedToken, expires = 0;
  async function request(route, method='GET', data, query='') {
    if (!cachedToken || expires < Date.now()) {
      const response = await fetch('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token',
        { headers:{ 'Metadata-Flavor':'Google' }, signal:AbortSignal.timeout(5000) });
      if (!response.ok) throw fail(503, 'Chưa kết nối được danh tính máy chủ.');
      const token = await response.json(); cachedToken = token.access_token; expires = Date.now() + (token.expires_in - 60)*1000;
    }
    const response = await fetch(root + '/' + route + query, { method,
      headers:{ Authorization:'Bearer ' + cachedToken, 'Content-Type':'application/json' },
      ...(data ? { body:JSON.stringify({ fields:{ payload:{ stringValue:JSON.stringify(data) }, ...(Number.isFinite(data.expiresAt) ? {expireAt:{timestampValue:new Date(data.expiresAt).toISOString()}} : {}) } }) } : {}),
      signal:AbortSignal.timeout(10000) });
    if (response.status === 404) return null;
    if (response.status === 409 || response.status === 412) throw fail(409, 'Tài khoản đã tồn tại hoặc vừa được thay đổi.');
    if (!response.ok) { console.error('Auth storage HTTP',response.status); throw fail(503, 'Chưa kết nối được kho tài khoản. Hãy kiểm tra cấu hình Firestore.'); }
    if (method === 'DELETE') return null;
    return response.json();
  }
  const unpack = doc => doc ? JSON.parse(doc.fields.payload.stringValue) : null;
  return {
    async get(collection,id) { return unpack(await request(collection+'/'+id)); },
    async put(collection,id,data,create=false) {
      await request(collection+'/'+id,'PATCH',data,create ? '?currentDocument.exists=false' : '');
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
export function createAuth({ store, adminEmail, adminPassword, secureCookie=true }) {
  const owner = emailOf(adminEmail);
  let bootstrap;
  async function ready() {
    if (!store || !validEmail(owner)) throw fail(503,'Đăng nhập nhân sự chưa được cấu hình trên máy chủ.');
    if (!bootstrap) bootstrap=(async()=>{
      const id=hash(owner); if (await store.get('cham_users',id)) return;
      const user={ id,email:owner,name:'Quản trị nhà trường',role:'admin',active:true,version:1,passwordHash:await passwordHash(adminPassword) };
      try { await store.put('cham_users',id,user,true); } catch(error) { if(error.status !== 409) throw error; }
    })().catch(error=>{ bootstrap=undefined; throw error; });
    await bootstrap;
  }
  const cookie = (res,value,maxAge=28800) => res.setHeader('Set-Cookie',`cham_session=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secureCookie ? '; Secure' : ''}`);
  const sessionId = req => {
    const raw = /(?:^|;\s*)cham_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie || '')?.[1];
    return raw ? hash(raw) : '';
  };
  async function userFor(req) {
    await ready(); const id=sessionId(req); if(!id) return null;
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
    // Browser JSON writes require an exact origin; no CORS is enabled.
    const origin=req.headers.origin;
    const host=req.headers.host;
    if(!origin || !host || !['https://'+host, ...(!secureCookie ? ['http://'+host] : [])].includes(origin))
      throw fail(403,'Nguồn yêu cầu không hợp lệ.');
    if(!String(req.headers['content-type'] || '').startsWith('application/json')) throw fail(415,'Yêu cầu phải dùng JSON.');
  }
  async function handle(req,res,pathname,body,json) {
    if(!pathname.startsWith('/api/auth/') && pathname !== '/api/admin/users' && pathname !== '/api/teacher/classes') return false;
    if(!['GET','POST','PUT'].includes(req.method)) { json(res,405,{error:'Method not allowed'}); return true; }
    if(req.method !== 'GET') sameOrigin(req);
    await ready();
    if(pathname === '/api/auth/session' && req.method === 'GET') {
      const user=await userFor(req); json(res,200,{user:user ? safeUser(user) : null}); return true;
    }
    if(pathname === '/api/auth/login' && req.method === 'POST') {
      const data=await body(req), email=emailOf(data.email);
      if(!validEmail(email) || typeof data.password !== 'string' || data.password.length > 128) throw fail(401,'Email hoặc mật khẩu chưa đúng.');
      // Persistent per-account throttle also survives container restarts.
      const id=hash(email); let rate=await store.get('cham_auth_limits',id);
      if(rate?.until > Date.now()) throw fail(429,'Bạn đã thử nhiều lần. Vui lòng chờ 1 phút.');
      // Claim a short lease to prevent parallel attempts bypassing the throttle.
      try { await store.put('cham_auth_locks',id,{until:Date.now()+30000},true); }
      catch(error) {
        if(error.status !== 409) throw error;
        const lock=await store.get('cham_auth_locks',id);
        if(lock?.until > Date.now()) throw fail(429,'Vui lòng chờ rồi thử lại.');
        // Expired locks are cleared; retry the request rather than racing a login.
        await store.remove('cham_auth_locks',id); throw fail(429,'Vui lòng thử lại.');
      }
      try {
        rate=await store.get('cham_auth_limits',id);
        if(rate?.until > Date.now()) throw fail(429,'Bạn đã thử nhiều lần. Vui lòng chờ 1 phút.');
        let user=await store.get('cham_users',id);
        // The server-only owner secret can recover the owner account after a secret rotation.
        // Never grant this path to a teacher, inactive account, or another email.
        if (user?.active && user.role === 'admin' && email === owner &&
            typeof adminPassword === 'string' && adminPassword.length >= 12 && adminPassword.length <= 128 &&
            typeof data.password === 'string' &&
            timingSafeEqual(Buffer.from(hash(data.password)), Buffer.from(hash(adminPassword))) &&
            !(await matches(data.password,user.passwordHash))) {
          user={...user,passwordHash:await passwordHash(adminPassword),version:user.version+1};
          await store.put('cham_users',id,user);
        }
        if(!user?.active || !(await matches(data.password,user.passwordHash))) {
          const count=(rate?.updatedAt > Date.now()-600000 ? rate.count : 0)+1;
          await store.put('cham_auth_limits',id,{count,updatedAt:Date.now(),until:count>=5 ? Date.now()+60000 : 0});
          throw fail(401,'Email hoặc mật khẩu chưa đúng.');
        }
        await store.remove('cham_auth_limits',id);
        const token=randomBytes(32).toString('hex');
        await store.put('cham_sessions',hash(token),{userId:id,version:user.version,expiresAt:Date.now()+28800000});
        cookie(res,token); json(res,200,{user:safeUser(user)}); return true;
      } finally { await store.remove('cham_auth_locks',id); }
    }
    if(pathname === '/api/auth/logout' && req.method === 'POST') {
      const id=sessionId(req); if(id) await store.remove('cham_sessions',id);
      cookie(res,'',0); json(res,200,{ok:true}); return true;
    }
    if(pathname === '/api/auth/password' && req.method === 'POST') {
      const user=await userFor(req); if(!user) throw fail(401,'Vui lòng đăng nhập lại.');
      const data=await body(req);
      if(typeof data.currentPassword !== 'string' || data.currentPassword.length>128 || !(await matches(data.currentPassword,user.passwordHash))) throw fail(401,'Mật khẩu hiện tại chưa đúng.');
      await store.put('cham_users',user.id,{...user,passwordHash:await passwordHash(data.password),version:user.version+1});
      cookie(res,'',0); json(res,200,{ok:true}); return true;
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
