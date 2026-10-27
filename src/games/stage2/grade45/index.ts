import type {GameConfig,Question} from '../types';
import {GRADE45_CONTENT} from '../../../data/grade45Content';
import {OFFICIAL_25_CATALOG} from '../../../data/curriculumCatalog';
import themes from './themes.json';
const distractors=['/images/real-photos/phuoc-kieu-khuon.webp','/images/real-photos/ma-chau-ken.webp','/learning/grade3/photos/my-khe.webp','/learning/grade45/photos/bana.webp'];
/** Review-only configurations; never selected by the production station router. */
export const grade45SharedConfigs:Record<string,GameConfig>=Object.fromEntries(themes.map((theme,i)=>{
 const lesson=GRADE45_CONTENT.find(l=>l.id===theme.id)!;
 const catalog=OFFICIAL_25_CATALOG.find(s=>s.id===theme.id)!;
 const original=(index:number,id:string,level:string):Question=>{
  const q=lesson.questions[index];const right=(i+index)%3;
  const options=q.answers.map((_,j)=>({text:q.answers[(j-right+3)%3]}));
  return {id,kind:'choice',level,prompt:q.text,hint:q.hint,answer:right,options};
 };
 const photoAnswer=i%3;
 const photos=[theme.photo,...distractors.filter(p=>p!==theme.photo).slice(0,2)];
 const choiceAnswer=(i+1)%3;
 const order=[1,2,0];
 const questions:Question[]=[
  {id:'q1',kind:'image',level:'Nhận biết',prompt:theme.ask,hint:theme.photoHint,answer:photoAnswer,options:photos.map((_,j)=>({text:'Hình '+String.fromCharCode(65+j),image:photos[(j-photoAnswer+3)%3]}))},
  {id:'q2',kind:'choice',level:'Nhận biết',prompt:theme.q2,hint:theme.hint,answer:choiceAnswer,options:theme.a.map((_,j)=>({text:theme.a[(j-choiceAnswer+3)%3]}))},
  original(theme.source,'q3','Thông hiểu'),
  {id:'q4',kind:'match',level:'Thông hiểu',prompt:'Nối mỗi nội dung với ý phù hợp.',hint:'Nhớ các đặc điểm và mối liên hệ được giới thiệu trong bài.',left:theme.pairs.map(p=>p[0]),right:order.map(n=>theme.pairs[n][1]),solution:theme.pairs.map((_,j)=>order.indexOf(j))},
  original(4,'q5','Vận dụng'),
 ];
 const base='/games/shared/v1/grade45/'+theme.key;
 return [theme.id,{stationId:theme.id,stationName:catalog.titleVi,title:theme.title,layout:'safe-v1',background:base+'-play.webp',victoryBackground:base+'-victory.webp',collectible:{icon:theme.icon,image:base+'-item.svg',name:theme.item},intro:{heading:theme.title,story:lesson.opening,call:'Quan sát thật tinh, hoàn thành năm thử thách và trân trọng quê hương nhé!',readyLabel:'Khám phá quê hương'},victory:{praise:'🌟 NHÀ KHÁM PHÁ QUÊ HƯƠNG!',achievement:'Em đã chinh phục 5 thử thách!',reward:'Em đã sưu tầm đủ 5 '+theme.item+'!'},questions} satisfies GameConfig];
}));
export const grade45Batches=[themes.filter(t=>t.grade===4).map(t=>t.id),themes.filter(t=>t.grade===5).map(t=>t.id)];
