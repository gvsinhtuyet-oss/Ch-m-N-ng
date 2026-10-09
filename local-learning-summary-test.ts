import {test} from 'node:test';
import assert from 'node:assert/strict';
import {summarizeLocalProgress} from './src/features/admin/localLearningSummary';
test('counts participation without guests, demo users, empty records or duplicate stations',()=>{
  const started={studentId:'s1',stationId:'g2-1',startedAt:'2026-10-09T10:00:00Z',stationCompleted:false};
  const done={...started,stationId:'g2-2',stationCompleted:true,stampReceived:true,checkInResponse:{emotionId:'happy'}};
  const report=summarizeLocalProgress({a:started,b:done,c:done,guest:{...done,studentId:'guest'},demo:{...done,studentId:'teacher-demo'},empty:{studentId:'s2',stationId:'g2-1',lastVisitedAt:'2026-10-09T10:00:00Z'},bad:null},{id:'s1',name:'Học sinh A'});
  assert.equal(report.students.length,1);assert.equal(report.started,2);assert.equal(report.completed,1);assert.equal(report.rate,50);
  assert.equal(report.students[0].name,'Học sinh A');assert.equal(report.students[0].stamps,1);assert.equal(report.students[0].checkIns,1);
});
test('missing and malformed storage input does not invent metrics',()=>{
  for(const raw of [null,[],{},'bad'])assert.deepEqual(summarizeLocalProgress(raw),{students:[],started:0,completed:0,rate:0,error:''});
});
