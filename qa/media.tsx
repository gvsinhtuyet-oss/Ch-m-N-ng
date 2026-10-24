// Test-only entry: Vite dev serves this file; production index.html never imports it.
import React from 'react';
import {createRoot} from 'react-dom/client';
import '../src/index.css';
import {ALL_25_STATIONS} from '../src/data/allStations';
import {AppProvider} from '../src/contexts/AppContext';
import {StationView} from '../src/features/stations/StationView';
import {progressService} from '../src/services/ProgressService';
import {realPointGallery} from '../src/data/realPhotos';
const params=new URLSearchParams(location.search);
const station=ALL_25_STATIONS.find(s=>s.id===params.get('station'))||ALL_25_STATIONS[0];
// Unlock review mode only in this test entry, with disposable guest/local progress.
progressService.completeStage1('guest',station.id);
const data=ALL_25_STATIONS.map(s=>({id:s.id,title:s.titleVi,cover:s.coverImage,points:s.hotspots.map((h,i)=>({id:h.id,title:h.titleVi,image:h.image,question:h.interaction?.questionVi,answer:h.interaction?.options.find(o=>o.isCorrect)?.textVi,wrong:h.interaction?.options.find(o=>!o.isCorrect)?.textVi,gallery:realPointGallery(s.id,i).map(p=>p.src)}))}));
createRoot(document.getElementById('root')!).render(<AppProvider><script id="qa-stations" type="application/json">{JSON.stringify(data)}</script><StationView station={station} onBack={()=>{location.href='/qa/media.html'}}/></AppProvider>);
