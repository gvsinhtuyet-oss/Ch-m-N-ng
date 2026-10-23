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
 if(station.grade===4){
  const baseline=GRADE4_TEXTBOOK_PREVIOUS_CONTENT.find(s=>s.id===station.id);
  const hotspots=station.hotspots.map((fresh,index)=>{
   const old=baseline?.points[index];
   const saved=content.hotspots.find(h=>h.id===fresh.id)||content.hotspots.find(h=>h.id===old?.id);
   if(!saved)return fresh;
   const legacy=old?GRADE4_PREVIOUS_POINTS[old.id]:undefined;
   const review=old?NARRATION_REVIEW[old.id as keyof typeof NARRATION_REVIEW]:undefined;
   const shippedNarration=[old?.narration,legacy?.narrationVi,review?.before,review?.after].filter(Boolean).includes(saved.narrationVi);
   const expectedAnswers=saved.interaction?.questionVi===old?.q?old?.answers:saved.interaction?.questionVi===legacy?.questionVi?legacy?.answers:undefined;
   const shippedQuestion=!!expectedAnswers&&!!saved.interaction&&saved.interaction.options.length===expectedAnswers.length&&saved.interaction.options.every(o=>expectedAnswers.includes(o.textVi)&&o.isCorrect===(o.textVi===expectedAnswers[0]));
   return {...fresh,
    ...(!shippedNarration?{narrationVi:saved.narrationVi}:{}),
    ...(saved.titleVi!==`${index+1}. ${old?.title}`&&saved.titleVi!==fresh.titleVi?{titleVi:saved.titleVi}:{}),
    ...(saved.keyFactVi!==old?.fact&&saved.keyFactVi!==fresh.keyFactVi?{keyFactVi:saved.keyFactVi}:{}),
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

 return {contentRevision:revision,coverImage:station.coverImage,mapImage:station.journeyMap?.image||'',hotspots:station.hotspots,resources:content.resources};
}
