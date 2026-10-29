import {randomBytes,createHash} from 'node:crypto';
import {FEEDBACK_STATIONS} from './learning-feedback-catalog.mjs';
const hash=x=>createHash('sha256').update(x).digest('hex');
const fail=(status,message)=>Object.assign(new Error(message),{status});
const categories=['Kiến thức','Hình ảnh/âm thanh','Câu hỏi/trò chơi','Đề xuất khác'];
// Each slot is claimed with create-only writes, so concurrent instances cannot
// bypass the limit. Configure Firestore TTL on expireAt for this collection.
export function createLearningFeedback({store,auth,secureCookie=true}) {
  const ingress=new Map();
  function throttle(key,max) {
    const now=Date.now();
    for(const [k,v] of ingress)if(v.until<=now)ingress.delete(k);
    const current=ingress.get(key)||{count:0,until:now+60000};
    if(current.count>=max||ingress.size>10000)throw fail(429,'Bạn gửi hơi nhanh. Vui lòng chờ rồi thử lại.');
    current.count++;ingress.set(key,current);
  }
  async function quota(key,count,period) {
    const bucket=Math.floor(Date.now()/period);
    const start=randomBytes(4).readUInt32BE(0)%count;
    for(let offset=0;offset<count;offset++) {
      const slot=(start+offset)%count;
      try {await store.put('cham_feedback_limits',hash(`${key}:${bucket}:${slot}`),{expiresAt:(bucket+2)*period},true);return;}
      catch(e){if(e.status!==409)throw e;}
    }
    throw fail(429,'Bạn gửi hơi nhanh. Vui lòng chờ rồi thử lại.');
  }
  async function identity(req,res,data) {
    const staff=await auth.userFor(req);
    if(staff)return {id:staff.id,kind:staff.role,name:staff.name};
    if(data.syncCode) {
      const code=String(data.syncCode).toUpperCase().replace(/[^A-Z0-9]/g,'');
      if(code.length!==12)throw fail(401,'Mã đồng bộ học sinh chưa hợp lệ.');
      const key=hash(code),saved=await store.get('cham_student_sync',key);
      if(!saved?.profile)throw fail(401,'Không xác minh được tài khoản học sinh.');
      return {id:key,kind:'student'};
    }
    const token=/(?:^|;\s*)cham_feedback=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie||'')?.[1];
    if(token){const saved=await store.get('cham_feedback_guests',hash(token));if(saved?.expiresAt>Date.now())return {id:hash(token),kind:'guest'};}
    // Socket identity is deliberately used instead of trusting caller-supplied IP headers.
    await quota('new-guest:'+hash(req.socket.remoteAddress||'unknown'),300,3600000);
    const raw=randomBytes(32).toString('hex'),id=hash(raw);
    await store.put('cham_feedback_guests',id,{expiresAt:Date.now()+365*86400000},true);
    res.setHeader('Set-Cookie',`cham_feedback=${raw}; Path=/; HttpOnly; SameSite=Strict; Max-Age=31536000${secureCookie?'; Secure':''}`);
    return {id,kind:'guest'};
  }
  return async function handle(req,res,pathname,body,json) {
    if(!['/api/learning/rating','/api/learning/proposals'].includes(pathname))return false;
    if(req.method!=='POST')throw fail(405,'Phương thức không hỗ trợ.');
    auth.sameOrigin(req);
    if(!store)throw fail(503,'Máy chủ phản hồi chưa được cấu hình.');
    throttle('socket:'+(req.socket.remoteAddress||'unknown'),2000);
    throttle('cookie:'+hash(req.headers.cookie||req.socket.remoteAddress||'unknown'),60);
    const data=await body(req);
    const station=FEEDBACK_STATIONS.find(s=>s.id===data.stationId);
    if(!station)throw fail(400,'Trạm không hợp lệ.');
    const rating=pathname.endsWith('/rating');
    if(rating&&data.action!=='read'&&(!Number.isInteger(data.stars)||data.stars<1||data.stars>5))throw fail(400,'Chọn từ 1 đến 5 sao.');
    if(!rating) {
      if(!categories.includes(data.category)||typeof data.text!=='string'||data.text.trim().length<5||data.text.length>3000)throw fail(400,'Chọn loại góp ý và nhập nội dung từ 5 đến 3000 ký tự.');
      if(typeof (data.source??'')!=='string'||(data.source||'').length>1000)throw fail(400,'Nguồn minh chứng tối đa 1000 ký tự.');
      // Sources are references only: never fetched or executed by the server.
      if(/^[a-z][a-z\d+.-]*:/i.test(data.source||'')&&!/^https?:\/\//i.test(data.source))throw fail(400,'Đường dẫn cần bắt đầu bằng http hoặc https.');
    }
    const actor=await identity(req,res,data),actorKey=hash(actor.kind+':'+actor.id);
    const id=hash(actorKey+':'+station.id);
    if(rating) {
      const old=await store.get('cham_journey_ratings',id);
      if(data.action==='read'){json(res,200,{stars:old?.stars||0});return true;}
      if(old?.stars===data.stars){json(res,200,{saved:true,stars:old.stars});return true;}
      await quota('rating:'+actorKey,20,60000);
      await store.put('cham_journey_ratings',id,{id,actorId:actorKey,actorKind:actor.kind,stationId:station.id,stationName:station.titleVi,grade:station.grade,stars:data.stars,createdAt:old?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()});
      json(res,200,{saved:true,stars:data.stars});return true;
    }
    const text=data.text.trim(),source=(data.source||'').trim();
    const proposalId=hash(`${actorKey}:${station.id}:${data.category}:${text}:${source}`);
    const old=await store.get('cham_learning_proposals',proposalId);
    if(old){json(res,200,{saved:true});return true;}
    await quota('proposal-minute:'+actorKey,1,60000);
    await quota('proposal-day:'+actorKey,5,86400000);
    const record={id:proposalId,teacherId:actor.kind==='teacher'||actor.kind==='admin'?actor.id:'',teacherName:actor.kind==='guest'?'Khách ẩn danh':actor.name||'Học sinh',actorId:actorKey,actorKind:actor.kind,stationId:station.id,stationName:station.titleVi,grade:station.grade,category:data.category,text,source,status:'pending',createdAt:new Date().toISOString()};
    try{await store.put('cham_learning_proposals',proposalId,record,true);}catch(e){if(e.status!==409)throw e;}
    json(res,200,{saved:true});return true;
  };
}
