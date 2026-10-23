import {GRADE5_TEXTBOOK_PREVIOUS_CONTENT} from '../data/grade5TextbookPreviousContent';
import {GRADE4_TEXTBOOK_PREVIOUS_CONTENT} from '../data/grade4TextbookPreviousContent';
import {NARRATION_REVIEW} from '../data/narrationReview';
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
 if(station.grade===4||station.grade===5){
  const baseline=(station.grade===4?GRADE4_TEXTBOOK_PREVIOUS_CONTENT:GRADE5_TEXTBOOK_PREVIOUS_CONTENT).find(s=>s.id===station.id);
  const hotspots=station.hotspots.map((fresh,index)=>{
   const oldIndex=station.grade===4?index:({'g5-station-3':[0,-1,3,1,-1,2],'g5-station-4':[0,1,2,-1,-1,3],'g5-station-5':[0,1,-1,3,2,-1]} as Record<string,number[]>)[station.id]?.[index]??-1;
   const old=baseline?.points[oldIndex];
   const saved=content.hotspots.find(h=>h.id===fresh.id)||content.hotspots.find(h=>h.id===old?.id);
   if(!saved)return fresh;
   const legacy=old?(station.grade===4?GRADE4_PREVIOUS_POINTS:GRADE5_PREVIOUS_POINTS)[old.id]:undefined;
   const review=old?NARRATION_REVIEW[old.id as keyof typeof NARRATION_REVIEW]:undefined;
   const shippedNarration=[old?.narration,legacy?.narrationVi,review?.before,review?.after].filter(Boolean).includes(saved.narrationVi);
   const expectedAnswers=saved.interaction?.questionVi===old?.q?old?.answers:saved.interaction?.questionVi===legacy?.questionVi?legacy?.answers:undefined;
   const shippedQuestion=!!expectedAnswers&&!!saved.interaction&&saved.interaction.options.length===expectedAnswers.length&&saved.interaction.options.every(o=>expectedAnswers.includes(o.textVi)&&o.isCorrect===(o.textVi===expectedAnswers[0]));
   return {...fresh,
    ...(!shippedNarration?{narrationVi:saved.narrationVi}:{}),
    ...(saved.titleVi!==`${oldIndex+1}. ${old?.title}`&&saved.titleVi!==fresh.titleVi?{titleVi:saved.titleVi}:{}),
    ...(saved.keyFactVi!==old?.fact&&saved.keyFactVi!==(station.grade===5&&old?GRADE5_PREVIOUS_POINTS[old.id]?.keyFactVi:undefined)&&saved.keyFactVi!==fresh.keyFactVi?{keyFactVi:saved.keyFactVi}:{}),
    ...(saved.interaction&&!shippedQuestion?{interaction:saved.interaction}:{}),
    ...(!saved.image.startsWith('/learning/')?{image:saved.image,mediaCredit:saved.mediaCredit,mediaRights:saved.mediaRights}:{}),
    sources:[...new Set([...(saved.sources||[]),...(fresh.sources||[])])]
   };
  });
  return {...content,contentRevision:revision,
   coverImage:content.coverImage.startsWith('/learning/')?station.coverImage:content.coverImage,
   mapImage:content.mapImage.startsWith('/learning/')||!content.mapImage?station.journeyMap?.image||'':content.mapImage,
   hotspots};
 }
 return {contentRevision:revision,coverImage:station.coverImage,mapImage:station.journeyMap?.image||'',hotspots:station.hotspots,resources:content.resources};
}
