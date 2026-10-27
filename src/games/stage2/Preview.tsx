import React,{useState} from 'react';
import {AppProvider} from '../../contexts/AppContext';
import {ALL_25_STATIONS} from '../../data/allStations';
import {Stage3CheckIn} from '../../components/station/Stage3CheckIn';
import {SharedStage2} from './SharedStage2';
import {sharedPreviewConfigs} from './registry';
const selectedId=new URLSearchParams(window.location.search).get('stage2-preview')??'g3-station-2';
const config=sharedPreviewConfigs[selectedId];
const station=ALL_25_STATIONS.find(s=>s.id===selectedId)!;
export default function Preview() {
  const [stage,setStage]=useState(2);
  if(!config||!station)return <main style={{padding:24,fontFamily:'system-ui'}}><h1>Chọn bản chơi thử Chặng 2</h1>{ALL_25_STATIONS.filter(s=>sharedPreviewConfigs[s.id]).map(s=><p key={s.id}><a href={'/?stage2-preview='+s.id}>Khối {s.grade} · Trạm {s.number}: {s.titleVi}</a></p>)}</main>;
  return <AppProvider>{stage===2?<SharedStage2 station={station} studentId="guest" isReadOnly config={config} onCompleteStage={()=>setStage(3)}/>:<div style={{maxWidth:1000,margin:'auto',padding:16}}><button onClick={()=>setStage(2)} style={{padding:12,fontWeight:700}}>↩ Chơi lại bản thử Trạm {station.grade===3?selectedId.split('-').at(-1):station.number}</button><p>Bản chơi thử · Chặng 3 của {station.titleVi} · Không lưu kết quả học sinh</p><Stage3CheckIn readOnly station={station} onCompleteStage={()=>setStage(2)}/></div>}</AppProvider>;
}
