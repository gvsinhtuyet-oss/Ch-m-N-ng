import {GRADE3_TEXTBOOK_PREVIOUS_CONTENT} from '../data/grade3TextbookPreviousContent';
import {NARRATION_REVIEW} from '../data/narrationReview';
import type {Station} from '../types';
import type {StationContent} from './ContentService';
import {GRADE3_MEDIA_PREVIOUS_NARRATIONS} from '../data/grade3MediaPreviousNarrations';
import {GRADE3_PREVIOUS_NARRATIONS} from '../data/grade3PreviousNarrations';
export const GRADE3_REVISION='3.2.0-grade3-textbook';
// Compatibility is in memory only; no storage writes, downloads, or database migrations.
const oldBuiltin=(src:string)=>/^\/learning\/grade3\/g3-station-[1-5]-(?:cover|point-[1-4])\.svg$/.test(src);
export function currentGrade3Content(station:Station,content:StationContent):StationContent{
 if(station.grade!==3||station.version.version!==GRADE3_REVISION||content.contentRevision===GRADE3_REVISION)return content;
 // Upgrade shipped fields independently; preserve teacher-authored text, media and resources.
 const previous=GRADE3_TEXTBOOK_PREVIOUS_CONTENT.find(s=>s.id===station.id);
 const upgraded={...content,contentRevision:GRADE3_REVISION,hotspots:content.hotspots.map(h=>{
  const old=previous?.points.find(p=>p.id===h.id);
  const fresh=station.hotspots.find(p=>p.id===h.id);
  if(!old||!fresh)return h;
  const review=NARRATION_REVIEW[h.id as keyof typeof NARRATION_REVIEW];
  const isShipped=[old.narration,review?.before,review?.after,GRADE3_PREVIOUS_NARRATIONS[h.id],GRADE3_MEDIA_PREVIOUS_NARRATIONS[h.id]].filter(Boolean).includes(h.narrationVi);
  if(!isShipped)return h;
  const builtinImage=h.image.startsWith('/learning/grade3/');
  const oldQuestion=h.interaction?.questionVi===old.q || ('question' in (review||{}) && h.interaction?.questionVi===(review as any).question?.before?.questionVi);
  return {...h,
   titleVi:h.titleVi===`${previous!.points.indexOf(old)+1}. ${old.title}`?fresh.titleVi:h.titleVi,
   narrationVi:fresh.narrationVi,
   keyFactVi:h.keyFactVi===old.fact?fresh.keyFactVi:h.keyFactVi,
   ...(oldQuestion?{interaction:fresh.interaction}:{}),
   ...(builtinImage?{image:fresh.image,mediaCredit:fresh.mediaCredit,mediaRights:fresh.mediaRights}:{}),
   sources:[...new Set([...(h.sources||[]),...(fresh.sources||[])])]
  };
 })};
 if(content.coverImage.startsWith('/learning/grade3/'))upgraded.coverImage=station.coverImage;
 return upgraded;
}
