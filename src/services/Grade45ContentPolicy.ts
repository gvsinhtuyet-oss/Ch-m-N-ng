import type {Station} from '../types';
import type {StationContent} from './ContentService';
import {GRADE4_PREVIOUS_POINTS} from '../data/grade4PreviousContent';
import {GRADE5_PREVIOUS_POINTS} from '../data/grade5PreviousContent';
import {GRADE4_CONTENT_REVISION,GRADE5_CONTENT_REVISION} from '../data/grade45Stations';
export const GRADE45_REVISION='3.0.0-grade45-source';
// Revision compatibility only, in memory. Stored payloads are never modified.
export function currentGrade45Content(station:Station,content:StationContent):StationContent{
 const revision=station.grade===4?GRADE4_CONTENT_REVISION:GRADE5_CONTENT_REVISION;
 if((station.grade!==4&&station.grade!==5)||station.version.version!==revision||content.contentRevision===revision)return content;
 if(station.grade===5&&content.contentRevision===GRADE45_REVISION)return {
  ...content,contentRevision:revision,
  hotspots:content.hotspots.map(h=>{
   const previous=GRADE5_PREVIOUS_POINTS[h.id],reviewed=station.hotspots.find(p=>p.id===h.id);
   if(!previous||!reviewed)return h;
   const sameInteraction=h.interaction?.questionVi===previous.questionVi&&h.interaction.options.length===previous.answers.length&&h.interaction.options.every(o=>previous.answers.includes(o.textVi)&&o.isCorrect===(o.textVi===previous.answers[0]));
   return {...h,
    ...(h.image===previous.image?{image:reviewed.image,mediaRights:reviewed.mediaRights,mediaCredit:reviewed.mediaCredit}:{}),
    ...(h.narrationVi===previous.narrationVi?{narrationVi:reviewed.narrationVi}:{}),
    ...(h.keyFactVi===previous.keyFactVi?{keyFactVi:reviewed.keyFactVi}:{}),
    ...(sameInteraction?{interaction:reviewed.interaction}:{}),
    sources:[...new Set([...(h.sources||[]),...(reviewed.sources||[])])]
   };
  })
 };
 if(station.grade===4&&content.contentRevision===GRADE45_REVISION)return {
  ...content,contentRevision:revision,
  hotspots:content.hotspots.map(h=>{
   const previous=GRADE4_PREVIOUS_POINTS[h.id],reviewed=station.hotspots.find(p=>p.id===h.id);
   if(!previous||!reviewed)return h;
   const sameInteraction=h.interaction?.questionVi===previous.questionVi&&h.interaction.options.length===previous.answers.length&&h.interaction.options.every(o=>previous.answers.includes(o.textVi)&&o.isCorrect===(o.textVi===previous.answers[0]));
   return {...h,
    ...(h.image===previous.image?{image:reviewed.image,mediaRights:reviewed.mediaRights,mediaCredit:reviewed.mediaCredit}:{}),
    ...(h.narrationVi===previous.narrationVi?{narrationVi:reviewed.narrationVi}:{}),
    ...(sameInteraction?{interaction:reviewed.interaction}:{}),
    sources:[...new Set([...(h.sources||[]),...(reviewed.sources||[])])]
   };
  })
 };
 return {contentRevision:revision,coverImage:station.coverImage,mapImage:station.journeyMap?.image||'',hotspots:station.hotspots,resources:content.resources};
}
