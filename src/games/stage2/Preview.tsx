import React,{useState} from 'react';
import {AppProvider} from '../../contexts/AppContext';
import {GRADE_3_STATIONS} from '../../data/grade3Stations';
import {Stage3CheckIn} from '../../components/station/Stage3CheckIn';
import {SharedStage2} from './SharedStage2';
import {hoangDieuConfig} from './hoangDieu';
const station=GRADE_3_STATIONS.find(s=>s.id==='g3-station-2')!;
export default function Preview() {
  const [stage,setStage]=useState(2);
  return <AppProvider>{stage===2?<SharedStage2 station={station} studentId="guest" isReadOnly config={hoangDieuConfig} onCompleteStage={()=>setStage(3)}/>:<div style={{maxWidth:1000,margin:'auto',padding:16}}><button onClick={()=>setStage(2)} style={{padding:12,fontWeight:700}}>↩ Chơi lại bản thử Trạm 2</button><p>Bản chơi thử · Chặng 3 của {station.titleVi} · Không lưu kết quả học sinh</p><Stage3CheckIn station={station} onCompleteStage={()=>setStage(2)}/></div>}</AppProvider>;
}
