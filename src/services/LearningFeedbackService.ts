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
  const response=await fetchWithTimeout('/api/learning/'+path,{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  if(!response.headers.get('content-type')?.includes('application/json'))throw new Error('Máy chủ phản hồi chưa sẵn sàng.');
  const result=await response.json();
  if(!response.ok)throw Object.assign(new Error(response.status===404?'Máy chủ chưa hỗ trợ tính năng này.':result.error||'Chưa lưu được. Vui lòng thử lại.'),{status:response.status});
  return result;
}
export const learningFeedbackService={
  async rating(stationId:string,userId?:string,requireStudent=false):Promise<number>{return (await request('rating',{stationId,action:'read',...studentCredential(userId,requireStudent)})).stars;},
  async saveRating(stationId:string,stars:number,userId?:string,requireStudent=false):Promise<number>{
    const result=await request('rating',{stationId,stars,...studentCredential(userId,requireStudent)});
    if(result.saved!==true)throw new Error('Máy chủ chưa xác nhận lưu.');
    return result.stars;
  },
  async propose(data:{stationId:string;category:FeedbackCategory;text:string;source:string},userId?:string,requireStudent=false){
    const result=await request('proposals',{...data,...studentCredential(userId,requireStudent)});
    if(result.saved!==true)throw new Error('Máy chủ chưa xác nhận lưu.');
  },
};
