// Test-only entry: Vite dev serves this file; production index.html never imports it.
import React,{useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import '../src/index.css';
import {ALL_25_STATIONS} from '../src/data/allStations';
import {AppProvider,useApp} from '../src/contexts/AppContext';
import {StationView} from '../src/features/stations/StationView';
import {progressService} from '../src/services/ProgressService';
import {realPointGallery} from '../src/data/realPhotos';
const params=new URLSearchParams(location.search);
const station=ALL_25_STATIONS.find(s=>s.id===params.get('station'))||ALL_25_STATIONS[0];
// Unlock review mode only in this test entry, with disposable guest/local progress.
progressService.completeStage1('qa-photo-test',station.id);
const data=ALL_25_STATIONS.map(s=>({id:s.id,title:s.titleVi,cover:s.coverImage,points:s.hotspots.map((h,i)=>({id:h.id,title:h.titleVi,image:h.image,question:h.interaction?.questionVi,answer:h.interaction?.options.find(o=>o.isCorrect)?.textVi,wrong:h.interaction?.options.find(o=>!o.isCorrect)?.textVi,gallery:realPointGallery(s.id,i).map(p=>p.src)}))}));
function Preview(){const {currentUser,loginAsStudent}=useApp();useEffect(()=>{loginAsStudent({id:'qa-photo-test',role:'student',name:'QA',displayName:'QA',studentCode:'QA',classId:'qa',className:'QA',grade:station.grade,status:'active'});},[]);if(!currentUser)return <p>Đang mở bản kiểm thử</p>;return <><script id="qa-stations" type="application/json">{JSON.stringify(data)}</script><StationView station={station} onBack={()=>{location.href='/qa/media.html'}}/></>;}
createRoot(document.getElementById('root')!).render(<AppProvider><Preview/></AppProvider>);
