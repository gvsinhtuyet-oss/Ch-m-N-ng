import {GRADE3_CONTENT} from './src/data/grade3Content';
import {GRADE45_CONTENT} from './src/data/grade45Content';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ALL_25_STATIONS} from './src/data/allStations';
import {NARRATION_REVIEW} from './src/data/narrationReview';
import {currentNarrationContent,narrationTeacherNote} from './src/services/NarrationReviewPolicy';
import {GRADE3_TOPIC_DECKS} from './src/data/teacher/grade3TopicDecks';
import {GRADE45_TOPIC_DECKS} from './src/data/teacher/grade45TopicDecks';
const entries=Object.entries(NARRATION_REVIEW);
test('105 reviewed spoken lessons use canonical revised wording and retain source context outside speech',()=>{
 assert.equal(entries.length,105);assert.equal(ALL_25_STATIONS.length,25);let edited=0;const current=new Map([...GRADE3_CONTENT,...GRADE45_CONTENT].flatMap(l=>l.points.map(p=>[p.id,p.narration] as const)));
 for(const s of ALL_25_STATIONS)for(const h of s.hotspots){const r=NARRATION_REVIEW[h.id as keyof typeof NARRATION_REVIEW];assert.equal(h.narrationVi,current.get(h.id)||r?.after,h.id);assert.ok(h.narrationVi.length>100);if(s.grade!==3)assert.doesNotMatch(h.narrationVi,/Theo tài liệu|Tài liệu giới thiệu|Ảnh trong bài|Ảnh trước mặt|Sơ đồ tổng kết trong app|chưa chọn một tên tổ nghề/);if(r&&r.before!==r.after){edited++;assert.ok(narrationTeacherNote(h.id).includes(r.before));}}
 assert.ok(edited>0);
});
test('current saved defaults update purely and idempotently; custom teaching content survives',()=>{
 for(const s of ALL_25_STATIONS.filter(s=>s.grade!==3&&s.grade!==4&&s.grade!==5)){const content={contentRevision:s.version.version,coverImage:s.coverImage,mapImage:s.journeyMap?.image||'',resources:[],hotspots:s.hotspots.map(h=>{const r=NARRATION_REVIEW[h.id as keyof typeof NARRATION_REVIEW];return {...h,narrationVi:r.before,...('fact'in r?{keyFactVi:r.fact.before}:{}),...('question'in r?{interaction:r.question.before}:{} )};})} as any;
 const snapshot=JSON.stringify(content),updated=currentNarrationContent(content);assert.equal(JSON.stringify(content),snapshot);assert.equal(updated.resources,content.resources);assert.equal(updated.contentRevision,content.contentRevision);assert.deepEqual(updated.hotspots.map(h=>h.narrationVi),s.hotspots.map(h=>h.narrationVi));
 for(const h of updated.hotspots){const canonical=s.hotspots.find(p=>p.id===h.id)!;assert.equal(h.interaction?.questionVi,canonical.interaction?.questionVi);assert.equal(h.interaction?.options.find(o=>o.isCorrect)?.textVi,canonical.interaction?.options.find(o=>o.isCorrect)?.textVi);}
 assert.equal(currentNarrationContent(updated),updated);
 const reorder=(v:any):any=>Array.isArray(v)?v.map(reorder):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).reverse().map(([k,x])=>[k,reorder(x)])):v;
 assert.deepEqual(currentNarrationContent(reorder(content)),updated);
 const custom=structuredClone(content);custom.hotspots.forEach((h:any)=>{h.narrationVi='Lời giảng riêng của giáo viên';h.interaction.questionVi='Câu hỏi riêng';h.image='https://example.org/teacher.webp';h.keyFactVi='Ý chính riêng của giáo viên';});assert.equal(currentNarrationContent(custom),custom);
 }
});
test('all 60 grade3–5 lesson slides show reviewed speech and keep previous editorial context teacher-only',()=>{
 for(const d of [...GRADE3_TOPIC_DECKS,...GRADE45_TOPIC_DECKS]){const s=ALL_25_STATIONS.find(s=>s.grade===d.sourceRecord.grade&&s.titleVi===d.title) || ALL_25_STATIONS.find(s=>d.slides[1]?.points.includes(s.hotspots[0].narrationVi));assert.ok(s);for(const [i,h]of s.hotspots.entries()){const slide=d.slides[i+1];assert.ok(slide.points.includes(h.narrationVi));assert.equal(slide.answer,h.interaction?.options.find(o=>o.isCorrect)?.textVi);}}
});

test('biosphere designation uses the complete UNESCO name and supported year',()=>{const h=ALL_25_STATIONS.find(s=>s.id==='g2-station-2')!.hotspots.find(h=>h.id==='g2s2-cu-lao')!;assert.match(h.narrationVi,/2009.*Cù Lao Chàm – Hội An/);assert.match(h.keyFactVi,/2009.*Cù Lao Chàm – Hội An/);assert.doesNotMatch(h.keyFactVi,/29 tháng 5/);});
test('spoken history, documentary heritage and local ecology retain their essential facts',()=>{
 const text=(id:string)=>ALL_25_STATIONS.find(s=>s.id===id)!.hotspots.map(h=>h.narrationVi).join(' ');
 assert.match(text('g5-ky-anh-me-nhu'),/26 tháng 12 năm 1968/);assert.match(text('g5-ky-anh-me-nhu'),/Lê Thị Dảnh/);assert.match(text('g5-ky-anh-me-nhu'),/Đình Thạch Tân/);
 assert.match(text('g5-station-4'),/chữ Hán và chữ Nôm/);assert.match(text('g5-station-4'),/Năm 2022/);assert.match(text('g5-station-4'),/châu Á – Thái Bình Dương/);assert.match(text('g5-station-4'),/di sản tư liệu văn khắc trên đá/);
 assert.match(text('g5-station-5'),/Trà Linh/);assert.match(text('g5-station-5'),/dưới tán rừng|Dưới tán rừng/);assert.match(text('g4-station-4'),/thẩm âm/);assert.doesNotMatch(text('g4-station-4'),/tổ nghề là/);
});
