import test from 'node:test';
import assert from 'node:assert/strict';
import {bundledGddpCatalog} from './src/services/GddpBundledCatalog';
import {ALL_25_STATIONS} from './src/data/allStations';
import {matchGddpResources,CURATED_TOPIC_STATIONS} from './src/services/GddpResourceMatcher';

const eligible=(h:{titleVi:string;image:string;narrationVi:string})=>Boolean(h.titleVi?.trim()&&h.image?.trim()&&h.narrationVi?.trim()&&!/đang được hoàn thiện|đang cập nhật|giới thiệu bài học/i.test(h.narrationVi));
test('all integration addresses have a same-grade Chặng 1 browsing route',()=>{
 for(const record of bundledGddpCatalog.records){
  const sameGrade=ALL_25_STATIONS.filter(s=>s.grade===record.grade);
  assert.ok(sameGrade.length>0,'Missing grade '+record.grade);
  const manual=sameGrade.flatMap(s=>s.hotspots.filter(eligible));
  assert.ok(manual.length>0,'No complete Chặng 1 content for '+record.id);
 }
});
test('topic recommendations never cross grades and use complete hotspots',()=>{
 for(const record of bundledGddpCatalog.records){
  for(const match of matchGddpResources(record,ALL_25_STATIONS)){
   assert.equal(match.station.grade,record.grade,record.id);
   assert.ok(eligible(match.hotspot),record.id);
  }
 }
});
test('curated references point to existing same-grade stations',()=>{
 for(const [id,stationId] of Object.entries(CURATED_TOPIC_STATIONS)){
  const record=bundledGddpCatalog.records.find(r=>r.id===id);
  assert.ok(record,'Missing catalog row '+id);
  const station=ALL_25_STATIONS.find(s=>s.id===stationId);
  assert.ok(station,'Missing station '+stationId);
  assert.equal(station.grade,record.grade,id);
 }
});
