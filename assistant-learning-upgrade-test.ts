import test from 'node:test';
import assert from 'node:assert/strict';
import knowledge from './src/data/assistantKnowledge.json';
import {detectLearningTask,handleLearningRequest,learningProfiles,learningAssessmentBank,presentAssessmentQuestion,adaptLearningResult} from './src/services/AssistantLearningEngine';
import {isEffectivenessMeasure,readEffectiveness,saveEffectiveness,summarizeEffectiveness,effectivenessCSV,type LearningMeasure,type TeacherMeasure} from './src/services/AssistantEffectivenessService';

test('recognizes knowledge, comparison, question creation, timed activity, rewrite and practice',()=>{
 const cases=[['San hô là gì?','knowledge'],['San hô là thực vật đúng không?','knowledge'],['So sánh thời tiết và khí hậu','comparison'],['Tạo 3 câu hỏi kèm đáp án về Hội An','questions'],['Cho em 3 câu hỏi để ôn bài làng nghề','questions'],['Thiết kế hoạt động 5 phút về bảo vệ san hô cho lớp 2','activity'],['Soạn hoạt động về truyền nghề','activity'],['Viết lại ngắn hơn bằng 2 câu cho học sinh lớp 1','rewrite'],['Hỏi em một câu để kiểm tra','practice']];
 for(const [query,expected]of cases)assert.equal(detectLearningTask(query),expected,query);
});
test('all 51 sourced concepts have age-appropriate explanations and concrete application rubrics',()=>{
 assert.equal(learningProfiles.length,knowledge.length);
 assert.equal(new Set(learningProfiles.map(p=>p.id)).size,learningProfiles.length);
 for(const profile of learningProfiles){
  const card=knowledge.find(c=>c.id===profile.id);assert.ok(card,profile.id);assert.ok(card.source.url.startsWith('https://'));
  assert.ok(profile.young.split(/(?<=[.!?])\s+/).length<=3,profile.id);
  for(const field of [profile.example,profile.applicationQuestion,profile.applicationAnswer])assert.ok(field.length>15,profile.id);
  const simple=adaptLearningResult({found:true,answer:card.answer,matchedEntryId:'expanded-'+card.id},card.term,{grade:1});
  assert.equal(simple.answer,profile.young);
  const advanced=adaptLearningResult({found:true,answer:card.answer,matchedEntryId:'expanded-'+card.id},card.term,{grade:5});
  assert.equal(advanced.answer,card.answer);
 }
});
test('false and true coral premises are answered directly with source; unsupported properties stay outside the correction rule',()=>{
 for(const query of ['San hô là thực vật đúng không?','san ho co phai la thuc vat khong','San hô không phải động vật đúng không?']){
  const result=handleLearningRequest(query,{audience:'student',grade:1});assert.ok(result);assert.match(result.answer,/động vật/);assert.match(result.answer,/sửa/);assert.ok(result.sources?.[0].url?.includes('noaa.gov'));
 }
 for(const query of ['San hô là động vật đúng không?','San hô không phải thực vật đúng không?'])assert.match(handleLearningRequest(query,{grade:2})!.answer,/Đúng rồi/);
 assert.equal(handleLearningRequest('San hô là động vật sống trên cạn đúng không?',{grade:3}),null);
 const older=handleLearningRequest('San hô là thực vật đúng không?',{grade:5})!;assert.match(older.answer,/polyp/);
});
test('requested tasks preserve intent, duration, count, source and current-topic follow-ups',()=>{
 const questions=handleLearningRequest('Tạo 3 câu hỏi về Hội An kèm đáp án',{audience:'teacher',grade:2})!;
 assert.equal((questions.answer.match(/\*\*Câu \d/g)||[]).length,3);assert.match(questions.answer,/1999/);assert.match(questions.answer,/Gợi ý đáp án/);assert.ok(questions.sources?.[0].url?.includes('unesco.org'));
 const activity=handleLearningRequest('Thiết kế hoạt động 5 phút về bảo vệ san hô cho lớp 2',{audience:'teacher'})!;
 assert.match(activity.answer,/1 phút — Khởi động/);assert.match(activity.answer,/2 phút — Khám phá/);assert.match(activity.answer,/1 phút — Vận dụng/);assert.match(activity.answer,/1 phút — Kiểm tra/);assert.match(activity.answer,/Không bẻ/);
 const rewrite=handleLearningRequest('Viết lại ngắn hơn bằng 2 câu cho học sinh lớp 1',{previousTopic:'san hô',previousQuery:'San hô là gì?'})!;
 assert.equal(rewrite.answer.split(/(?<=[.!?])\s+/).length,2);assert.doesNotMatch(rewrite.answer,/Cho học sinh|Dùng sơ đồ|polyp/);
 for(const query of ['So sánh thời tiết và khí hậu','Khí hậu khác thời tiết thế nào?','Thời tiết khác khí hậu thế nào?']){const compare=handleLearningRequest(query,{grade:5})!;assert.match(compare.answer,/lúc cụ thể/);assert.match(compare.answer,/thời gian dài/);assert.match(compare.answer,/nhiều năm/);}
});
test('topic clarification is actionable and an unfamiliar new subject does not inherit an old one',()=>{
 const first=handleLearningRequest('Hỏi em một câu để kiểm tra',{grade:2})!;assert.equal(first.pendingTask,'practice');assert.equal(first.practice,undefined);
 const second=handleLearningRequest('San hô',{grade:2,pendingTask:first.pendingTask,previousQuery:'Hỏi em một câu để kiểm tra'})!;assert.ok(second.practice);assert.equal(second.topic,'san hô');
 const unknown=handleLearningRequest('Tạo 3 câu hỏi về Sao Hỏa',{previousTopic:'Hội An'})!;assert.equal(unknown.confidence,'low');assert.doesNotMatch(unknown.answer,/1999/);assert.equal(unknown.sources?.length||0,0);
});
test('51 topics can generate grounded open questions; quiz keys exist only in response metadata until the learner answers',()=>{
 for(const card of knowledge){
  const questions=handleLearningRequest('Tạo 3 câu hỏi kèm đáp án',{audience:'teacher',previousTopic:card.term,grade:4})!;
  assert.equal((questions.answer.match(/\*\*Câu \d/g)||[]).length,3,card.id);
  assert.ok(questions.sources?.length,card.id);
  const practice=handleLearningRequest('Hỏi em một câu để kiểm tra',{previousTopic:card.term,grade:2})!;
  assert.ok(practice.practice,card.id);assert.doesNotMatch(practice.answer,/Đáp án:|Gợi ý đáp án:/);
 }
});
test('13 topic pairs test understanding and application with separate before/after questions and stable shuffled keys',()=>{
 const topics=[...new Set(learningAssessmentBank.map(q=>q.topicId))];assert.equal(topics.length,13);
 for(const topic of topics){
  const rows=learningAssessmentBank.filter(q=>q.topicId===topic);assert.equal(rows.length,4);
  for(const form of ['pre','post'])for(const domain of ['understanding','application'])assert.equal(rows.filter(q=>q.form===form&&q.domain===domain).length,1);
  for(const row of rows){assert.equal(new Set(row.options).size,3);assert.ok(row.correctIndex>=0&&row.correctIndex<row.options.length);const shuffled=presentAssessmentQuestion(row,'test-'+row.id);assert.equal(shuffled.options[shuffled.correctIndex],row.options[row.correctIndex]);assert.deepEqual(shuffled,presentAssessmentQuestion(row,'test-'+row.id));}
 }
});
test('stage two protection precedes learning tasks',()=>{
 for(const query of ['Hỏi em một câu để kiểm tra','Tạo 3 câu hỏi về Hội An kèm đáp án','San hô là thực vật đúng không?'])assert.equal(handleLearningRequest(query,{stage:2,audience:'student'}),null);
});
test('effectiveness records are actual completed observations, scoped per account and deduplicated',()=>{
 const map=new Map<string,string>();const storage={getItem:(key:string)=>map.get(key)||null,setItem:(key:string,value:string)=>{map.set(key,value);}};
 const student:LearningMeasure={version:1,id:'pair-1',kind:'student',at:'2026-11-01T02:00:00Z',grade:2,topicId:'san-ho',preUnderstanding:0,preApplication:1,postUnderstanding:1,postApplication:1};
 assert.equal(summarizeEffectiveness([]).medianSeconds,null);assert.deepEqual(readEffectiveness(storage,'student:B'),[]);
 saveEffectiveness(storage,'student:A',student);saveEffectiveness(storage,'student:A',student);
 assert.equal(readEffectiveness(storage,'student:A').length,1);assert.equal(readEffectiveness(storage,'student:B').length,0);
 assert.equal(isEffectivenessMeasure({...student,postUnderstanding:2}),false);
 assert.throws(()=>saveEffectiveness(storage,'student:A',{...student,grade:6}),/hợp lệ/);
 const teacher:TeacherMeasure={version:1,id:'timer-1',kind:'teacher',at:student.at,grade:2,topicId:'san-ho',elapsedSeconds:90,baselineMinutes:5,edits:'light'};
 saveEffectiveness(storage,'teacher:A',teacher);const stats=summarizeEffectiveness(readEffectiveness(storage,'teacher:A'));
 assert.equal(stats.teacherSessions,1);assert.equal(stats.medianSeconds,90);assert.equal(stats.editCounts.light,1);assert.equal(stats.studentSessions,0);
 const paired=summarizeEffectiveness([student]);assert.equal(paired.preUnderstanding,0);assert.equal(paired.postUnderstanding,1);assert.equal(paired.preApplication,1);
 const csv=effectivenessCSV([student,teacher]);assert.doesNotMatch(csv,/student:A|teacher:A|ho ten|cau tra loi/i);assert.match(csv,/90/);
 const rejected={getItem:()=>null,setItem:()=>{throw Error('quota');}};assert.throws(()=>saveEffectiveness(rejected,'A',student),/quota/);
});

test('a new request cancels pending clarification without inheriting stale subjects',()=>{
 const pending={audience:'teacher' as const,grade:2,previousTopic:'Hội An',previousQuery:'So sánh thời tiết và khí hậu',pendingTask:'comparison' as const};
 for(const [query,task] of [['Tạo 3 câu hỏi về san hô','questions'],['Đố em một câu về san hô','practice'],['Hãy đặt 3 câu hỏi về san hô','questions'],['Viết lại san hô bằng 2 câu','rewrite'],['Thiết kế hoạt động 5 phút về san hô','activity']] as const){
   const answer=handleLearningRequest(query,pending)!;assert.equal(answer.task,task,query);assert.equal(answer.topic,'san hô',query);assert.doesNotMatch(answer.answer,/Hội An|Thời tiết/);
 }
 assert.match(handleLearningRequest('San hô không phải là thực vật đúng không?',pending)!.answer,/Đúng rồi/);
 const first=handleLearningRequest('Tạo 2 câu hỏi')!;
 const resumed=handleLearningRequest('san hô',{pendingTask:first.pendingTask,previousQuery:'Tạo 2 câu hỏi'})!;
 assert.equal((resumed.answer.match(/\*\*Câu \d/g)||[]).length,2);
});
test('question counts are exact or limitations are explicit, including Vietnamese counts',()=>{
 for(const token of ['1','2','3','4','5','hai','ba','bốn','năm']){
  const expected=({hai:2,ba:3,'bốn':4,'năm':5} as Record<string,number>)[token]||Number(token);
  for(const kind of ['câu hỏi','câu hỏi trắc nghiệm']){
   const answer=handleLearningRequest(`Tạo ${token} ${kind} về san hô`,{audience:'teacher'})!;
   assert.equal((answer.answer.match(/\*\*Câu \d/g)||[]).length,expected,token+kind);
  }
 }
 for(const n of [0,6,10,100]){const r=handleLearningRequest(`Tạo ${n} câu hỏi về san hô`)!;assert.equal(r.confidence,'low');assert.match(r.answer,/1 đến 5/);}
 for(const n of [1,2,21,60])assert.match(handleLearningRequest(`Thiết kế hoạt động ${n} phút về san hô`)!.answer,/3 đến 20/);
 const rewritten=handleLearningRequest('Viết lại san hô bằng 4 câu',{grade:1})!.answer;
 const sentences=rewritten.split(/(?<=[.!?])\s+/);assert.equal(new Set(sentences).size,sentences.length);
});
test('practice cycles through recall, example and application separately from measurement items',()=>{
 for(const card of knowledge){
  const seen=new Set<string>();
  for(let index=0;index<3;index++){
   const r=handleLearningRequest(`Đố em một câu về ${card.term}`,{grade:2,practiceIndex:index})!;
   assert.ok(r.practice?.hint,card.id);assert.equal(r.practice.sequence,index);seen.add(r.practice.question);
   assert.ok(!learningAssessmentBank.some(item=>item.question===r.practice!.question),card.id);
   assert.doesNotMatch(r.answer,/Đáp án/);
  }
  assert.equal(seen.size,3,card.id);
 }
 const first=handleLearningRequest('Hỏi em một câu về san hô',{practiceIndex:0})!;
 const fourth=handleLearningRequest('Hỏi em một câu về san hô',{practiceIndex:3})!;
 assert.equal(first.practice?.question,fourth.practice?.question);
});
