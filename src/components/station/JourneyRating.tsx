import React,{useEffect,useRef,useState} from 'react';
import {Star} from 'lucide-react';
import {learningFeedbackService} from '../../services/LearningFeedbackService';
export function JourneyRating({stationId,userId,requireStudent=false,compact=false,readOnly=false}:{stationId:string;userId?:string;requireStudent?:boolean;compact?:boolean;readOnly?:boolean}) {
  const [stars,setStars]=useState(0),[status,setStatus]=useState(''),[busy,setBusy]=useState(false);
  const [ready,setReady]=useState(false);
  const saving=useRef(false);
  useEffect(()=>{let active=true;setStars(0);setStatus('');setReady(false);
    // Local rating is a fallback only; server values remain authoritative when available.
    let localStars=0;
    try { const saved=JSON.parse(localStorage.getItem(`cham_danang_journey_rating_v2:${userId||'guest'}:${stationId}`)||'null'); if(Number.isInteger(saved?.stars)&&saved.stars>=1&&saved.stars<=5)localStars=saved.stars; } catch {}
    if(localStars)setStars(localStars);
    learningFeedbackService.rating(stationId,userId,requireStudent).then(value=>{if(active)setStars(Number.isInteger(value)&&value>=1&&value<=5?value:localStars);}).catch(()=>{if(active)setStatus(localStars?'':'Không tải được đánh giá từ máy chủ');}).finally(()=>{if(active)setReady(true);});
    return()=>{active=false;};
  },[stationId,userId,requireStudent,readOnly]);
  async function save(value:number){
    if(readOnly||saving.current)return;saving.current=true;setBusy(true);setStatus('Đang lưu…');
    try{const saved=await learningFeedbackService.saveRating(stationId,value,userId,requireStudent);setStars(saved);setStatus('Đã lưu ✓');
      try{localStorage.setItem(`cham_danang_journey_rating_v2:${userId||'guest'}:${stationId}`,JSON.stringify({stars:saved}));}catch{/* Server confirmation remains authoritative. */}
    }catch(e){setStatus((e as Error).message);}finally{saving.current=false;setBusy(false);}
  }
  return <div className={compact?"flex shrink-0 flex-wrap items-center gap-x-1 text-amber-950":"flex flex-col items-center gap-1 text-amber-950"}>
    {!readOnly && <span className={compact?"sr-only":"text-[11px] font-semibold"}>Em thích hành trình này chứ?</span>}
    <div role={readOnly?"img":"group"} aria-label={readOnly?(ready?(stars?`Đã đánh giá ${stars} trên 5 sao`:"Chưa đánh giá"):"Đang tải đánh giá"):"Mức độ yêu thích hành trình"} className="flex gap-1">
      {[1,2,3,4,5].map(value=>readOnly?<Star key={value} aria-hidden="true" className={`h-4 w-4 sm:h-5 sm:w-5 ${value<=stars?"fill-amber-400 text-amber-600":"text-amber-300"}`}/>:<button key={value} type="button" disabled={busy||!ready} aria-label={`${value} sao`} aria-pressed={stars===value} onClick={()=>void save(value)} className="rounded p-1 focus-visible:outline-2 focus-visible:outline-amber-700 disabled:opacity-60"><Star className={`${compact?'h-4 w-4 sm:h-5 sm:w-5':'h-6 w-6'} ${value<=stars?'fill-amber-400 text-amber-600':'text-amber-600'}`}/></button>)}
    </div>

    {status&&<span role="status" className={compact?"basis-full max-w-56 text-[10px] font-semibold":"max-w-56 text-center text-[10px] font-semibold"}>{status}</span>}
  </div>;
}
