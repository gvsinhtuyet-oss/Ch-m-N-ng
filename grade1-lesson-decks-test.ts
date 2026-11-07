import {test} from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {existsSync} from 'node:fs';
import {GRADE1_LESSON_DECKS} from './src/data/teacher/grade1LessonDecks';
import {getGddpLessonDeck,getGddpTeachingRecord} from './src/services/GddpLessonDeckService';
import {bundledGddpCatalog} from './src/services/GddpBundledCatalog';
import {GRADE_1_STATIONS} from './src/data/grade1Stations';
import {matchGddpResources} from './src/services/GddpResourceMatcher';
import {createLessonPlan} from './src/services/LessonPlanService';
import {GddpPreparedPresentation} from './src/features/teacher/GddpPreparedPresentation';
import {publicGddpTextbookRecords} from './gddp-textbook-review.mjs';

const records=bundledGddpCatalog.records.filter(row=>row.grade===1);

test('seven Kết nối tri thức addresses use the July 2025 minutes, exact activities and local assets',()=>{
 assert.equal(records.length,7);
 assert.equal(GRADE1_LESSON_DECKS.length,7);
 for(const row of records){
  assert.equal(row.week,'','the minutes do not assign a school teaching week');
  assert.match(row.activity,/trang \d+/);
  const deck=getGddpLessonDeck(row)!;
  assert.ok(deck,row.lesson);
  assert.equal(deck.slides.length,5);
  assert.ok(deck.sources.some(source=>source.includes('31/7/2025')));
  assert.match(deck.reviewNotes.join(' '),/đề xuất/);
  for(const slide of deck.slides){
   assert.ok(slide.title&&slide.points.length>=2&&slide.question&&slide.answer&&slide.teacherNotes);
   assert.ok(slide.images?.length);
   for(const image of slide.images!){
    assert.ok(existsSync('public'+image.src),image.src);
    assert.ok(image.alt&&image.caption);
   }
  }
 }
});

test('all five GDĐP topics have precise same-grade links, including two distinct stream activities',()=>{
 const used=new Set<string>();
 for(const row of records){
  const matches=matchGddpResources(row,GRADE_1_STATIONS);
  assert.equal(matches.length,row.resourceLinks!.length,row.id);
  assert.ok(matches.every(match=>row.resourceLinks!.some(link=>link.stationId===match.station.id&&link.hotspotId===match.hotspot.id)));
  matches.forEach(match=>used.add(match.station.id));
 }
 assert.deepEqual([...used].sort(),GRADE_1_STATIONS.map(station=>station.id).sort());
 const streams=records.filter(row=>row.resourceLinks!.some(link=>link.stationId==='g1-station-3'));
 assert.equal(streams.length,2);
 assert.match(streams[0].lesson,/Thiên nhiên tươi đẹp/);
 assert.match(streams[1].lesson,/bảo vệ cảnh quan/);
});

test('source identity and old drafts cannot inherit an unrelated revised presentation',()=>{
 for(const row of records){
  for(const patch of [{grade:2},{id:row.id+'-new'},{week:'1 mới'},{subject:'Toán'},{lesson:'Bài mới'},{content:'Thay nội dung'},{activity:'Hoạt động khác'},{integrationType:'Toàn phần'}]){
   assert.equal(getGddpLessonDeck({...row,...patch}),null);
  }
  assert.ok(getGddpLessonDeck({...row,lesson:'  '+row.lesson+'  '}));
 }
 const legacy={...records[0],id:'gddp-2026-1-11',subject:'TNXH',lesson:'Chủ đề 3: Cộng đồng, địa phương',content:'Bản nháp riêng cũ'};
 const before=JSON.stringify(legacy);
 assert.equal(getGddpLessonDeck(legacy),null);
 assert.equal(getGddpTeachingRecord(legacy),legacy);
 const replacement=records.find(row=>row.id==='gddp-2026-1-14')!;
 assert.deepEqual(publicGddpTextbookRecords([legacy]),[replacement]);
 assert.deepEqual(publicGddpTextbookRecords([legacy,replacement]),[replacement]);
 assert.deepEqual(publicGddpTextbookRecords([replacement,legacy]),[replacement]);
 assert.deepEqual(publicGddpTextbookRecords([legacy]).map(row=>row.id),[replacement.id]);
 assert.equal(JSON.stringify(legacy),before);
 assert.deepEqual(publicGddpTextbookRecords([]),[]);
});

test('revised foods and duplicate stream names retain the distinctions in the minutes',()=>{
 const nature=records.find(row=>row.id==='gddp-2026-1-18')!;
 assert.match(nature.content,/Suối Mơ ở xã Hà Nha với Suối Mơ ở xã Bà Nà/);
 assert.match(nature.content,/thác Grăng ở xã Bến Giằng/);
 assert.match(nature.content,/thác Hòa Phú Thành ở xã Hòa Vang/);
 const food=records.find(row=>row.id==='gddp-2026-1-20')!;
 for(const name of ['mì Quảng','bánh tráng cuốn thịt heo','bánh sừng trâu','bánh thuẫn','bánh bèo','bánh xèo','bánh đập'])assert.ok(food.content.includes(name),name);
 assert.doesNotMatch(food.content,/Cá niên|Bánh tráng chập/i);
});

test('all revised presentations render grade one, source-appropriate images and a usable empty-week label',()=>{
 for(const row of records){
  const deck=getGddpLessonDeck(row)!;
  const html=renderToStaticMarkup(React.createElement(GddpPreparedPresentation,{record:row,deck,onExit:()=>{}}));
  assert.match(html,/KHỐI 1/);
  assert.match(html,/Tuần theo kế hoạch nhà trường/);
  assert.match(html,/<img/);
  assert.doesNotMatch(html,/Bản tham khảo từ bảng 2025/);
  assert.ok(!html.includes(deck.slides[0].answer));
 }
});

test('deck rendering and new lesson plans use revised content without network calls or source mutations',()=>{
 const nativeFetch=globalThis.fetch;
 let calls=0;
 globalThis.fetch=(()=>{calls++;throw Error('network forbidden')}) as typeof fetch;
 try{
  for(const row of records){
   const snapshot=JSON.stringify(row);
   const deck=getGddpLessonDeck(row)!;
   renderToStaticMarkup(React.createElement(GddpPreparedPresentation,{record:row,deck,onExit:()=>{}}));
   const plan=createLessonPlan(getGddpTeachingRecord(row));
   assert.ok(plan.integration.includes(row.content));
   assert.ok(plan.integration.includes(row.activity));
   assert.equal(plan.week,'');
   assert.equal(JSON.stringify(row),snapshot);
  }
  assert.equal(calls,0);
 }finally{globalThis.fetch=nativeFetch;}
});
