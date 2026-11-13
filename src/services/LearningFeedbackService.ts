import {isExperienceMode} from './ExperienceMode';
import {freeExplorerIdentity} from './FreeExplorerIdentity';
import {effectivenessService} from './EffectivenessService';
import {fetchWithTimeout} from './NetworkService';
export const FEEDBACK_CATEGORIES=['Kiến thức','Hình ảnh/âm thanh','Câu hỏi/trò chơi','Đề xuất khác'] as const;
export type FeedbackCategory=typeof FEEDBACK_CATEGORIES[number];
function studentCredential(userId?:string,requireStudent=false) {
  if(!requireStudent)return {};
  let p;
  try {p=JSON.parse(localStorage.getItem('cham_danang_student_profile_v1')||'null');}catch{/* handled below */}
  if(p?.id===userId&&p?.syncCode)return {syncCode:p.syncCode};
  // Staff are authenticated by their HttpOnly session; learners must never
  // silently submit as guests while their account sync is unavailable.
  throw new Error('Tài khoản học sinh chưa đồng bộ. Em vẫn nhận đủ phần thưởng; hãy thử đánh giá lại sau.');
}

async function request(path:string,data:object) {
  if(isExperienceMode()){
    const key='cham-experience-feedback:'+path+':'+String((data as any).stationId||'');
    if(path==='rating'){const d=data as any;if(d.action==='read'){try{return {saved:true,stars:JSON.parse(localStorage.getItem(key)||'0')};}catch{return {saved:true,stars:0};}}
      localStorage.setItem(key,JSON.stringify(d.stars));return {saved:true,stars:d.stars};}
    const rows=JSON.parse(localStorage.getItem(key)||'[]');rows.push({...data,createdAt:new Date().toISOString()});localStorage.setItem(key,JSON.stringify(rows));return {saved:true};
  }
  const response=await fetchWithTimeout('/api/learning/'+path,{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  if(!response.headers.get('content-type')?.includes('application/json'))throw new Error('Máy chủ phản hồi chưa sẵn sàng.');
  const result=await response.json();
  if(!response.ok)throw Object.assign(new Error(response.status===404?'Máy chủ chưa hỗ trợ tính năng này.':result.error||'Chưa lưu được. Vui lòng thử lại.'),{status:response.status});
  return result;
}
export const learningFeedbackService={
  async rating(stationId:string,userId?:string,requireStudent=false):Promise<number>{if(!isExperienceMode()&&!requireStudent&&freeExplorerIdentity.current())return effectivenessService.guestRating(stationId);return (await request('rating',{stationId,action:'read',...studentCredential(userId,requireStudent)})).stars;},
  async saveRating(stationId:string,stars:number,userId?:string,requireStudent=false):Promise<number>{
    if(!isExperienceMode()&&!requireStudent&&freeExplorerIdentity.current())return effectivenessService.guestRating(stationId,stars);
    const result=await request('rating',{stationId,stars,...studentCredential(userId,requireStudent)});
    if(result.saved!==true)throw new Error('Máy chủ chưa xác nhận lưu.');
    return result.stars;
  },
  async propose(data:{stationId:string;category:FeedbackCategory;text:string;source:string},userId?:string,requireStudent=false){
    const result=await request('proposals',{...data,...studentCredential(userId,requireStudent)});
    if(result.saved!==true)throw new Error('Máy chủ chưa xác nhận lưu.');
  },
};
