import test from 'node:test';
import assert from 'node:assert/strict';
import {ALL_25_STATIONS} from './src/data/allStations';
const normalize=(s:string)=>s.toLocaleLowerCase('vi').normalize('NFC').replace(/[^\p{L}\p{N}]+/gu,' ').trim();

test('all 25 stations have five complete stage-2 tasks with no repeated stage-1 question or correct answer',()=>{
 assert.equal(ALL_25_STATIONS.length,25);
 const globalQuestions=new Set<string>();
 for(const s of ALL_25_STATIONS){
  const stage1Questions=new Set(s.hotspots.map(h=>normalize(h.interaction!.questionVi)));
  const stage1Answers=new Set(s.hotspots.flatMap(h=>h.interaction!.options.filter(o=>o.isCorrect).map(o=>normalize(o.textVi))));
  assert.equal(s.challenge.questions!.length,5,s.id);
  assert.equal(s.challenge.passingScore,5,s.id);
  const positions=new Set<number>();
  for(const q of s.challenge.questions!){
   assert(!stage1Questions.has(normalize(q.questionVi)),s.id+': repeated question');
   assert(!stage1Answers.has(normalize(q.options.find(o=>o.isCorrect)!.textVi)),s.id+': repeated correct answer');
   assert(!globalQuestions.has(normalize(q.questionVi)),s.id+': repeated question in bank');
   globalQuestions.add(normalize(q.questionVi));
   assert.equal(q.options.length,3);assert.equal(q.options.filter(o=>o.isCorrect).length,1);
   assert.equal(new Set(q.options.map(o=>normalize(o.textVi))).size,3);assert.ok(q.hintVi);
   positions.add(q.options.findIndex(o=>o.isCorrect));
  }
  assert.equal(positions.size,3);
 }
 assert.equal(globalQuestions.size,125);
});

// Semantic review is editorial. These regressions guard the concrete factual
// recall objectives that previously reappeared with different wording.
const repeatedRecall:Record<string,RegExp>={
 'g2-station-3':/tước hiệu nào|còn được gọi là gì|xếp hạng.*năm nào|người như thế nào/i,
 'g2-station-4':/UNESCO.*năm nào|công trình nào thuộc|hoạt động văn hóa nào|hai làng nghề nào/i,
 'g2-station-2':/đảo chính|công nhận.*năm nào|loài quý hiếm nào|hoạt động nào được giới thiệu/i,
 'g2-station-1':/nguyên liệu chính.*là gì|dụng cụ nào.*dệt chiếu|không nên làm gì/i,
 'g4-station-4':/âm chưa phù hợp|hai nguồn.*truyền nghề/i,
 'g5-lua-ma-chau':/ảnh vải bất kì|máy cải tiến/i,
 'g5-ky-anh-me-nhu':/năm 1945|chú thích.*Mẹ Nhu|tượng bán thân chụp/i,
 'g5-station-3':/tên của toàn bộ con đèo|bốn mùa khí hậu|ngoài lối cho phép/i,
 'g5-station-4':/toàn bộ.*Di sản thế giới|khắc tên lớp/i,
 'g5-station-5':/chặt cây rừng|ảnh cây sâm chụp|ảnh giống bài học/i,
};
test('reviewed paraphrases of stage-1 recall tasks stay retired',()=>{
 for(const [id,pattern]of Object.entries(repeatedRecall)){
  const s=ALL_25_STATIONS.find(s=>s.id===id)!;
  for(const q of s.challenge.questions!)assert.doesNotMatch(q.questionVi,pattern,id);
 }
});
