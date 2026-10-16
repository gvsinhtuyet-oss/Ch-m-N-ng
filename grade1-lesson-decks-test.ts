import {test} from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';
import {existsSync,readFileSync} from 'node:fs';
import {GRADE1_LESSON_DECKS} from './src/data/teacher/grade1LessonDecks';
import {getGddpLessonDeck,getGddpTeachingRecord} from './src/services/GddpLessonDeckService';
import {bundledGddpCatalog} from './src/services/GddpBundledCatalog';
import {GRADE_1_STATIONS} from './src/data/grade1Stations';
import {matchGddpResources} from './src/services/GddpResourceMatcher';
import {createLessonPlan} from './src/services/LessonPlanService';
import {GddpPreparedPresentation} from './src/features/teacher/GddpPreparedPresentation';
const records=bundledGddpCatalog.records.filter(r=>r.grade===1);
test('all seven nonempty grade 1 source addresses have distinct five-slide illustrated drafts',()=>{
 assert.equal(records.length,7);assert.equal(GRADE1_LESSON_DECKS.length,7);
 for(const r of records){const d=getGddpLessonDeck(r);assert.ok(d,r.lesson);assert.equal(d.sourceRecord.grade,1);assert.equal(d.slides.length,5);assert.equal(d.status,'source-aligned-draft');assert.equal(d.mappingReview?.sourceYear,'2025-2026');assert.equal(d.mappingReview?.currentYearConfirmed,false);assert.ok(d.sources.length>=2);
 for(const s of d.slides){assert.ok(s.title&&s.points.length>=2&&s.question&&s.answer&&s.teacherNotes&&s.visual.length>=3);assert.ok(s.images?.length);for(const img of s.images!){assert.match(img.src,/^\/learning\/grade1\/[a-z0-9-]+\.svg$/);assert.ok(existsSync('public'+img.src));assert.ok(img.alt&&img.caption);assert.match(img.caption,/không phải/);}}
 }
});
test('exact snapshot isolation rejects changed grade, year-dependent week, subject, topic or activity',()=>{
 for(const r of records){for(const patch of [{grade:2},{id:r.id+'-new'},{week:'1 mới'},{subject:'Toán'},{lesson:'Bài mới'},{content:'Thay nội dung'},{activity:'Hoạt động khác'},{integrationType:'Toàn phần'}])assert.equal(getGddpLessonDeck({...r,...patch}),null);assert.ok(getGddpLessonDeck({...r,lesson:'  '+r.lesson+'  '}));}
 for(const id of ['04','05','06','07','08','09'])assert.equal(GRADE1_LESSON_DECKS.find(d=>d.recordId==='gddp-2026-1-'+id),undefined);
});
test('source-linked resources resolve only to the selected points of grade 1; outside-city lessons have no forced station',()=>{
 for(const r of records){const d=getGddpLessonDeck(r)!;if(['02','03'].some(n=>r.id.endsWith(n))){assert.deepEqual(d.resourceLinks,[]);continue;}
 const found=matchGddpResources({...r,resourceLinks:d.resourceLinks},GRADE_1_STATIONS);assert.equal(found.length,d.resourceLinks!.length);assert.ok(found.every(m=>m.station.grade===1&&d.resourceLinks!.some(l=>l.stationId===m.station.id&&l.hotspotId===m.hotspot.id)));assert.ok(found.every(m=>m.station.id!=='g1-station-3'),'no ungrounded waterfall link');
 }
});
test('place corrections distinguish old district/province from new wards and retain primary sources',()=>{
 const s=GRADE1_LESSON_DECKS.find(d=>d.recordId.endsWith('-02'))!,c=GRADE1_LESSON_DECKS.find(d=>d.recordId.endsWith('-03'))!;
 assert.match(s.teachingContent!,/không.*toàn bộ thị xã/i);assert.match(s.teachingContent!,/Hàm Rồng/);assert.ok(s.sources.some(x=>x.includes('1673')));
 assert.match(c.teachingContent!,/Không nói tỉnh Bình Thuận cũ đổi thành phường Mũi Né/);assert.ok(c.sources.some(x=>x.includes('1671')));assert.ok(c.sources.some(x=>x.includes('202/2025')));
});
test('each draft visibly renders grade 1, illustration and unconfirmed-year banner without exposing answer initially',()=>{
 for(const r of records){const d=getGddpLessonDeck(r)!;const html=renderToStaticMarkup(React.createElement(GddpPreparedPresentation,{record:r,deck:d,onExit:()=>{}}));assert.match(html,/KHỐI 1/);assert.doesNotMatch(html,/KHỐI 2/);assert.match(html,/Chưa xác nhận địa chỉ tích hợp năm học hiện hành/);assert.match(html,/<img/);assert.match(html,/Hiện gợi ý trả lời/);assert.ok(!html.includes(d.slides[0].answer));}
});
test('deck lookup and rendering never contact network or Firestore',()=>{
 const old=globalThis.fetch;let calls=0;globalThis.fetch=(()=>{calls++;throw Error('network forbidden')}) as typeof fetch;
 try{for(const r of records){const d=getGddpLessonDeck(r)!;renderToStaticMarkup(React.createElement(GddpPreparedPresentation,{record:r,deck:d,onExit:()=>{}}));}assert.equal(calls,0);}finally{globalThis.fetch=old;}
 const audit=readFileSync('docs/GRADE1_INTEGRATION_DECKS_AUDIT.md','utf8');assert.match(audit,/6 dòng thiếu nội dung/);assert.match(audit,/2025–2026/);assert.match(audit,/2026–2027/);
});

test('new lesson plans receive corrected text while old source rows remain unchanged',()=>{
 for(const id of ['gddp-2026-1-02','gddp-2026-1-03']){const source=records.find(r=>r.id===id)!;const before=JSON.stringify(source);const teaching=getGddpTeachingRecord(source);assert.notEqual(teaching,source);assert.equal(teaching.content,getGddpLessonDeck(source)!.teachingContent);assert.equal(JSON.stringify(source),before);const plan=createLessonPlan(teaching);assert.ok(plan.integration.includes(teaching.content));assert.ok(!plan.integration.includes(source.content));const changed={...source,content:'Nội dung mới do giáo viên nhập'};assert.equal(getGddpTeachingRecord(changed),changed);}
});
