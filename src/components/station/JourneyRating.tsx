import React,{useEffect,useRef,useState} from 'react';
import {Star} from 'lucide-react';
import {learningFeedbackService} from '../../services/LearningFeedbackService';

const deviceStatus = 'Đã lưu trên thiết bị này. Chạm lại số sao để thử đồng bộ.';

export function JourneyRating({stationId,userId,requireStudent=false,compact=false,readOnly=false}:{stationId:string;userId?:string;requireStudent?:boolean;compact?:boolean;readOnly?:boolean}) {
  const [stars,setStars]=useState(0),[status,setStatus]=useState(''),[busy,setBusy]=useState(false);
  const [ready,setReady]=useState(false);
  const saving=useRef(false);
  const revision=useRef(0);
  const storageKey=`cham_danang_journey_rating_v2:${userId||'guest'}:${stationId}`;
  useEffect(()=>{
    const version=++revision.current;
    let localStars=0;
    let pending=false;
    try {
      const saved=JSON.parse(localStorage.getItem(storageKey)||'null');
      if(Number.isInteger(saved?.stars)&&saved.stars>=1&&saved.stars<=5) {
        localStars=saved.stars;
        pending=saved.storage==='device';
      }
    } catch {/* The server can still provide the rating. */}
    setStars(localStars);
    setStatus(pending&&!readOnly?deviceStatus:'');
    setReady(!readOnly||localStars>0);
    setBusy(false);
    saving.current=false;
    // An older server rating must not replace a newer choice saved on this device.
    if(!pending) {
      learningFeedbackService.rating(stationId,userId,requireStudent).then(value=>{
        if(revision.current===version&&Number.isInteger(value)&&value>=1&&value<=5)setStars(value);
      }).catch(()=>{/* Rating stays available on this device. */}).finally(()=>{
        if(revision.current===version)setReady(true);
      });
    }
    return()=>{revision.current++;};
  },[stationId,userId,requireStudent,readOnly,storageKey]);
  async function save(value:number){
    if(readOnly||saving.current)return;
    const version=++revision.current;
    saving.current=true;
    setBusy(true);
    setStars(value);
    setStatus('Đang đồng bộ…');
    let savedLocally=false;
    try {
      localStorage.setItem(storageKey,JSON.stringify({stars:value,storage:'device'}));
      savedLocally=true;
    } catch {/* Try the server even if device storage is unavailable. */}
    try {
      const saved=await learningFeedbackService.saveRating(stationId,value,userId,requireStudent);
      if(revision.current!==version)return;
      try {localStorage.setItem(storageKey,JSON.stringify({stars:saved}));}catch{/* The server confirmed the save. */}
      setStars(saved);
      setStatus('Đã đồng bộ ✓');
    } catch {
      if(revision.current!==version)return;
      if(!savedLocally)setStars(stars);
      setStatus(savedLocally?deviceStatus:'Chưa lưu được đánh giá. Em hãy thử lại.');
    } finally {
      if(revision.current===version){
        saving.current=false;
        setBusy(false);
      }
    }
  }
  return <div className={compact?"flex shrink-0 flex-wrap items-center gap-x-1 text-amber-950":"flex flex-col items-center gap-1 text-amber-950"}>
    {!readOnly && <span className={compact?"sr-only":"text-[11px] font-semibold"}>Em thích hành trình này chứ?</span>}
    <div role={readOnly?"img":"group"} aria-label={readOnly?(ready?(stars?`Đã đánh giá ${stars} trên 5 sao`:"Chưa đánh giá"):"Đang tải đánh giá"):"Mức độ yêu thích hành trình"} className="flex gap-1">
      {[1,2,3,4,5].map(value=>readOnly?<Star key={value} aria-hidden="true" className={`h-4 w-4 sm:h-5 sm:w-5 ${value<=stars?"fill-amber-400 text-amber-600":"text-amber-300"}`}/>:<button key={value} type="button" disabled={busy||!ready} aria-label={`${value} sao`} aria-pressed={stars===value} onClick={()=>void save(value)} className="rounded p-1 focus-visible:outline-2 focus-visible:outline-amber-700 disabled:opacity-60"><Star className={`${compact?'h-4 w-4 sm:h-5 sm:w-5':'h-6 w-6'} ${value<=stars?'fill-amber-400 text-amber-600':'text-amber-600'}`}/></button>)}
    </div>

    {status&&<span role="status" className={compact?"basis-full max-w-56 text-[10px] font-semibold":"max-w-56 text-center text-[10px] font-semibold"}>{status}</span>}
  </div>;
}
