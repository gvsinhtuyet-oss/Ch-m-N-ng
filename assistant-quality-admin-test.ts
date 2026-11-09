import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ALL_25_STATIONS} from './src/data/allStations';
import {
  ASSISTANT_QUALITY_CASES, QUALITY_DIMENSIONS,
  calculateQualityScore, evaluateAssistantQualityCase,
  type QualityRating,
} from './src/features/admin/assistantQualityEngine';

test('covers all 25 stations and every real Stage 1 exploration point, with unique identifiers',()=>{
  assert.equal(ALL_25_STATIONS.length,25);
  assert.equal(new Set(ASSISTANT_QUALITY_CASES.map(row=>row.id)).size,ASSISTANT_QUALITY_CASES.length);
  const context=ASSISTANT_QUALITY_CASES.filter(row=>row.check==='context');
  assert.equal(context.length,121);
  for(const s of ALL_25_STATIONS){
    assert.equal(context.filter(row=>row.stationId===s.id).length,s.hotspots.length,s.id);
    assert.ok(ASSISTANT_QUALITY_CASES.some(row=>row.stationId===s.id&&row.dimension==='extension'),s.id);
    assert.ok(ASSISTANT_QUALITY_CASES.some(row=>row.stationId===s.id&&row.dimension==='teacher'),s.id);
    assert.ok(ASSISTANT_QUALITY_CASES.some(row=>row.stationId===s.id&&row.dimension==='language'),s.id);
  }
});

test('runs local dialect-context checks on all 121 real learning points',()=>{
  for(const item of ASSISTANT_QUALITY_CASES.filter(row=>row.check==='context')){
    const result=evaluateAssistantQualityCase(item);
    assert.equal(result.autoStatus,'pass',item.id+' '+result.diagnostic);
    assert.equal(result.relatedStationId,item.stationId,item.id);
  }
});

test('challenge leak protection and unsupported-fact guards work',()=>{
  for(const item of ASSISTANT_QUALITY_CASES.filter(row=>row.check==='guard')){
    const result=evaluateAssistantQualityCase(item);
    assert.equal(result.autoStatus,'pass',item.id+' '+result.answer);
  }
  for(const id of ['unknown-sao-hoa','unknown-nha-guol','unknown-san-ho-unesco']){
    const item=ASSISTANT_QUALITY_CASES.find(row=>row.id===id)!;
    assert.equal(evaluateAssistantQualityCase(item).autoStatus,'pass',id);
  }
});

test('automated fact matching never claims substantive approval without human review',()=>{
  const item=ASSISTANT_QUALITY_CASES.find(row=>row.id==='fact-san-ho')!;
  const result=evaluateAssistantQualityCase(item);
  assert.equal(result.autoStatus,'review');
  assert.ok(result.sources.some(s=>s.url?.startsWith('https://')));
});

test('rubric is mathematically complete and does not invent a score before human review',()=>{
  assert.equal(Object.values(QUALITY_DIMENSIONS).reduce((s,x)=>s+x.weight,0),100);
  const empty=calculateQualityScore(ASSISTANT_QUALITY_CASES,{});
  assert.equal(empty.score,null);
  assert.equal(empty.reviewed,0);
  const scores:Record<string,QualityRating>={};
  for(const dimension of empty.dimensions){
    const row=ASSISTANT_QUALITY_CASES.find(c=>c.dimension===dimension.id)!;
    scores[row.id]=2;
  }
  const after=calculateQualityScore(ASSISTANT_QUALITY_CASES,scores);
  assert.equal(after.reviewed,6);
  assert.equal(after.score,100);
  scores[ASSISTANT_QUALITY_CASES.find(x=>x.dimension==='accuracy')!.id]=0;
  assert.equal(calculateQualityScore(ASSISTANT_QUALITY_CASES,scores).score,70);
});

test('quality UI only mounts under real admin dashboard; demo does not expose it',()=>{
  const app=readFileSync('src/App.tsx','utf8');
  const real=readFileSync('src/features/admin/AdminDashboard.tsx','utf8');
  const demo=readFileSync('src/features/admin/AdminDemoDashboard.tsx','utf8');
  const panel=readFileSync('src/features/admin/AssistantQualityDashboard.tsx','utf8');
  assert.match(app,/role === 'admin'.*AdminDemoDashboard.*AdminDashboard/);
  assert.match(real,/Kiểm định chatbot/i);
  assert.doesNotMatch(demo,/AssistantQualityDashboard|assistant-qa/);
  assert.match(panel,/currentUser\?\.id!=='admin-demo'/);
  assert.doesNotMatch(panel,/\bfetch\s*\(|authService\./);
  assert.match(panel,/Kiểm tra toàn bộ 25 trạm/);
  assert.match(panel,/Biểu đồ chất lượng theo 5 khối/);
  assert.match(panel,/Danh sách câu trả lời cần sửa/);
  assert.match(panel,/Lịch sử kiểm định trên thiết bị này/);
  assert.match(panel,/localStorage\.setItem\(QA_HISTORY_KEY/);
});
test('mobile chatbot is not hidden by CSS and has a touch-safe visible launcher',()=>{
  const styles=readFileSync('src/index.css','utf8');
  const widget=readFileSync('src/components/common/DanangAssistantChat.tsx','utf8');
  assert.doesNotMatch(styles,/body:has\([^)]*\) \.discovery-assistant\{display:none\}/);
  assert.match(widget,/max\(18px, calc\(env\(safe-area-inset-bottom\)/);
  assert.match(widget,/Trợ lý<\/span>/);
  assert.match(widget,/mobile \|\| !event\.isPrimary/);
});


test('four formerly flagged knowledge cases have sourced, grade-appropriate responses',()=>{
  const expectations:ReadonlyArray<[string,RegExp,RegExp]>=[
    ['fact-hoian-1999',/1999/,/Di sản thế giới|Di sản văn hóa thế giới/],
    ['fact-culaoc-2009',/2009/,/dự trữ sinh quyển/],
    ['fact-dienhai-1813',/1813.*1823/s,/đất.*gạch/s],
    ['fact-vong-nuoc',/bốc hơi/,/ngưng tụ.*mưa/s],
  ];
  for(const [id,yearOrProcess,meaning] of expectations){
    const question=ASSISTANT_QUALITY_CASES.find(x=>x.id===id);
    assert.ok(question,'missing audit case '+id);
    const result=evaluateAssistantQualityCase(question);
    assert.equal(result.autoStatus,'review',id+': '+result.answer+' '+result.diagnostic);
    assert.match(result.answer,yearOrProcess,id);
    assert.match(result.answer,meaning,id);
    assert.ok(result.sources.some(source=>source.url?.startsWith('https://')),id+' missing cited source');
  }
  // Flagging is technical only; even fully sourced facts still require educator review.
});
