import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { bundledGddpCatalog } from './src/services/GddpBundledCatalog';
import { GRADE2_LESSON_DECKS } from './src/data/teacher/grade2LessonDecks';
import { getGddpLessonDeck } from './src/services/GddpLessonDeckService';
import { GddpPreparedPresentation } from './src/features/teacher/GddpPreparedPresentation';
const grade2 = bundledGddpCatalog.records.filter(record => record.grade === 2);
test('all eight imported grade-2 addresses have exactly one distinct complete five-page deck', () => {
  assert.equal(grade2.length, 8);
  assert.equal(new Set(GRADE2_LESSON_DECKS.map(deck=>deck.recordId)).size, 8);
  for (const record of grade2) {
    const deck=getGddpLessonDeck(record);
    assert.ok(deck,record.lesson);assert.equal(deck.recordId,record.id);assert.equal(deck.slides.length,5);
    assert.ok(deck.sources.length);assert.ok(deck.outcomes.length);
    for(const slide of deck.slides) {
      assert.ok(slide.title&&slide.points.length>=2&&slide.question&&slide.answer&&slide.teacherNotes&&slide.visual.length>=3);
    }
  }
});
test('no fuzzy fallback: altered grade, identity, subject, week, topic, lesson or activity cannot open a wrong deck',()=>{
 for(const row of grade2) {
   for(const field of ['id','subject','week','content','lesson','activity','integrationType'] as const)
     assert.equal(getGddpLessonDeck({...row,[field]:row[field]+' khác'}),null,field);
   assert.equal(getGddpLessonDeck({...row,grade:3}),null);
 }
 assert.equal(getGddpLessonDeck({...grade2[0],id:'new-grade-2-lesson'}),null);
});
test('harmless whitespace and composed Unicode do not break exact source links; teacher notes can be edited',()=>{
 const row=grade2[0];
 assert.ok(getGddpLessonDeck({...row,lesson:('  '+row.lesson+'  ').normalize('NFD'),outcomes:'Teacher edited',teachingSuggestion:'New note'}));
});
test('source gaps are disclosed instead of asserting approval or fabricated local details',()=>{
 for(const id of ['gddp-2026-2-03','gddp-2026-2-06','gddp-2026-2-08']){
  const deck=GRADE2_LESSON_DECKS.find(deck=>deck.recordId===id)!;
  assert.ok(deck.reviewNotes.length,id);assert.equal(deck.status,'source-aligned-draft');
 }
});
test('each quick presentation renders its opening content and navigation with discussion and answers initially hidden',()=>{
 for(const row of grade2){
  const deck=getGddpLessonDeck(row)!;
  const html=renderToStaticMarkup(React.createElement(GddpPreparedPresentation,{record:row,deck,onExit:()=>{}}));
  // Quick view starts Hoi An on the observation slide; other decks start at zero.
  const first=deck.slides[row.id==='gddp-2026-2-04'?1:0];
  assert.ok(html.includes(first.title));assert.ok(html.includes(first.points[0]));
  assert.ok(!html.includes('Cùng trao đổi'));assert.ok(!html.includes('Hiện gợi ý trả lời'));
  assert.ok(!html.includes(first.answer),'answer hidden');
  assert.match(html,/aria-modal="true"/);if(row.id==='gddp-2026-2-04')assert.match(html,/<img/);else assert.match(html,/Sơ đồ minh hoạ học tập/);assert.match(html,/Trang 1 \/ 3/);
 }
});

test('quick view opens Bop nat qua cam with three stages and five-minute timing',()=>{
 const row=grade2.find(r=>r.id==='gddp-2026-2-01')!;
 const html=renderToStaticMarkup(React.createElement(GddpPreparedPresentation,{record:row,deck:getGddpLessonDeck(row)!,onExit:()=>{}}));
 assert.match(html,/Tích hợp nhanh/);
 assert.match(html,/5 phút/);
 assert.match(html,/Trang 1 \/ 3/);
});
