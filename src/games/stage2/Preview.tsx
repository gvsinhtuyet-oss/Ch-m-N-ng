import React,{useState} from 'react';
import {AppProvider} from '../../contexts/AppContext';
import {ALL_25_STATIONS} from '../../data/allStations';
import {Stage3CheckIn} from '../../components/station/Stage3CheckIn';
import {SharedStage2} from './SharedStage2';
import {Stage2Challenge} from '../../components/station/Stage2Challenge';
import {sharedPreviewConfigs} from './registry';
const search=new URLSearchParams(window.location.search);
const qaId=search.get('stage2-qa');
const isQA=qaId!==null;
const selectedId=qaId??search.get('stage2-preview')??'g3-station-2';
const config=sharedPreviewConfigs[selectedId];
const station=ALL_25_STATIONS.find(s=>s.id===selectedId)!;
export default function Preview() {
  const [stage,setStage]=useState(2);
  if(!station||(!isQA&&!config))return <main style={{padding:24,fontFamily:'system-ui'}}><h1>Chọn bản chơi thử Chặng 2</h1>{ALL_25_STATIONS.filter(s=>sharedPreviewConfigs[s.id]).map(s=><p key={s.id}><a href={'/?stage2-preview='+s.id}>Khối {s.grade} · Trạm {s.number}: {s.titleVi}</a></p>)}</main>;
  return <AppProvider>{stage===2?(isQA?<Stage2Challenge station={station} previewReadOnly onCompleteStage={()=>setStage(3)}/>:<SharedStage2 station={station} studentId="guest" isReadOnly config={config!} onCompleteStage={()=>setStage(3)}/>):<div style={{maxWidth:1000,margin:'auto',padding:16}}><button onClick={()=>setStage(2)} style={{padding:12,fontWeight:700}}>↩ Chơi lại bản thử Trạm {station.grade===3?selectedId.split('-').at(-1):station.number}</button><p>Bản chơi thử · Chặng 3 của {station.titleVi} · Không lưu kết quả học sinh</p><Stage3CheckIn readOnly station={station} onCompleteStage={()=>setStage(2)}/></div>}</AppProvider>;
}
