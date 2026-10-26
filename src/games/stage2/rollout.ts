import {OFFICIAL_25_CATALOG} from '../../data/curriculumCatalog';
import {GRADE_1_STATIONS} from '../../data/grade1Stations';
import {GRADE_2_STATIONS} from '../../data/grade2Stations';
import {GRADE_3_STATIONS} from '../../data/grade3Stations';
import {GRADE_45_STATIONS} from '../../data/grade45Stations';
/** Migration inventory only. Drafts cannot be selected by the shared engine. */
const stations=[...GRADE_1_STATIONS,...GRADE_2_STATIONS,...GRADE_3_STATIONS,...GRADE_45_STATIONS];
const remaining=OFFICIAL_25_CATALOG.filter(s=>s.id!=='g3-station-2').sort((a,b)=>a.grade-b.grade||a.lessonNumber-b.lessonNumber);
export const rolloutDrafts=remaining.map((entry,i)=>{
  const station=stations.find(s=>s.id===entry.id);
  return {stationId:entry.id,stationName:entry.titleVi,grade:entry.grade,batch:Math.floor(i/5)+1,
    status:'needs-content-and-visual-review' as const,enabled:false as const,
    sourceQuestions:station?.challenge.questions||[],
    // Source questions are retained verbatim; not falsely labelled approved five-question configurations.
    targetKinds:['image','choice','choice','match','choice'] as const,
    questions:null,background:null,victoryBackground:null,collectible:null,
    checklist:{fiveQuestions:false,localImages:false,twoBackgrounds:false,audio:false,devices:false,teacherApproved:false},
  };
});
export const rolloutBatches=Array.from({length:5},(_,i)=>rolloutDrafts.filter(s=>s.batch===i+1));
