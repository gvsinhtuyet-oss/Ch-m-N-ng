// Durable, create-only AI budgets. Each successful reservation consumes one
// slot, including provider failures; this deliberately fails closed.
// All instances MUST share one atomic store and one fixed Firestore database.
import {createHash} from 'node:crypto';
const fail=(status,message)=>Object.assign(new Error(message),{status});
const idHash=id=>createHash('sha256').update(id).digest('hex').slice(0,40);
async function takeSlot(store,collection,prefix,max,expiresAt,message){
 for(let i=0;i<max;i++){
  try{
   await store.put(collection,prefix+'-'+i,{reservedAt:new Date().toISOString(),expiresAt},true);
   return i+1;
  }catch(error){
   if(error?.status===409)continue;
   throw fail(503,'Không thể xác nhận hạn mức dùng chung trên máy chủ. AI chưa được gọi.');
  }
 }
 throw fail(429,message);
}
export async function reserveAssistantQuota({store,teacherId,now=Date.now,limits={}}={}){
 if(!store||typeof store.put!=='function'||typeof teacherId!=='string'||!teacherId.trim())
  throw fail(503,'Chưa có kho hạn mức bền vững và danh tính giáo viên.');
 const current=now();
 if(!Number.isFinite(current))throw fail(503,'Thời gian máy chủ không hợp lệ.');
 // UTC boundaries are explicit; never rely on a worker's locale or in-memory counters.
 const day=new Date(current).toISOString().slice(0,10);
 const minute=Math.floor(current/60000);
 const validLimit=(value,fallback,max)=>Number.isInteger(value)&&value>0?Math.min(value,max):fallback;
 const teacherDaily=validLimit(limits.teacherDaily,5,5);
 const sharedDaily=validLimit(limits.sharedDaily,10,10);
 const sharedMinute=validLimit(limits.sharedMinute,5,5);
 const teacherPrefix=day+'-'+idHash(teacherId);
 // Reservation order avoids one teacher repeatedly exhausting all shared slots.
 // We never refund slots on error: conservative accounting prevents retry bursts.
 await takeSlot(store,'cham_ai_teacher_day',teacherPrefix,teacherDaily,current+3*86400000,
   'Giáo viên đã đạt giới hạn 5 lượt AI trong ngày (UTC).');
 await takeSlot(store,'cham_ai_shared_minute',String(minute),sharedMinute,current+3*86400000,
   'Hệ thống đang giới hạn yêu cầu AI mỗi phút.');
 await takeSlot(store,'cham_ai_shared_day',day,sharedDaily,current+3*86400000,
   'Hệ thống đã đạt hạn mức AI dùng chung trong ngày.');
 return {day,teacherDailyLimit:teacherDaily,sharedDailyLimit:sharedDaily,sharedMinuteLimit:sharedMinute};
}
