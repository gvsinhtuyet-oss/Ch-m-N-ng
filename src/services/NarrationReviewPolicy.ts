import {NARRATION_REVIEW} from '../data/narrationReview';
import type {StationContent} from './ContentService';
// Firestore/JSON serializers may reorder object keys; array and field values must still match.
const stableJSON=(value:unknown)=>JSON.stringify(value,(_key,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v);
/** Pure upgrade of shipped wording; teacher edits and resources remain untouched. */
export function currentNarrationContent(content:StationContent):StationContent {
 let changed=false;
 const hotspots=content.hotspots.map(h=>{
  const r=NARRATION_REVIEW[h.id as keyof typeof NARRATION_REVIEW];
  if(!r)return h;
  const narrationVi=h.narrationVi===r.before?r.after:h.narrationVi;
  let interaction=h.interaction;
  let keyFactVi=h.keyFactVi;
  if('fact' in r && keyFactVi===r.fact.before)keyFactVi=r.fact.after;
  if('question' in r && interaction && stableJSON(interaction)===stableJSON(r.question.before)){
   const a=r.question.after;
   interaction={...interaction,questionVi:a.q,options:a.answers.map((textVi,i)=>({id:interaction!.options[i]?.id||`opt-${i}`,textVi,isCorrect:i===0})),explanationVi:a.answers[0]+'.'};
   if(keyFactVi===r.question.beforeFact)keyFactVi=a.answers[0]+'.';
  }
  if(narrationVi===h.narrationVi&&interaction===h.interaction&&keyFactVi===h.keyFactVi)return h;
  changed=true;return {...h,narrationVi,interaction,keyFactVi};
 });
 return changed?{...content,hotspots}:content;
}
export function narrationTeacherNote(id:string):string {
 const r=NARRATION_REVIEW[id as keyof typeof NARRATION_REVIEW];
 return r&&r.before!==r.after?' Ghi chú đối chiếu bản trước (chỉ dành cho giáo viên; không đọc thành lời thuyết minh): '+r.before:'';
}
