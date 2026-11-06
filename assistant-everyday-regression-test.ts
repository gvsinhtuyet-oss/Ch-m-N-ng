import test from 'node:test';
import assert from 'node:assert/strict';
import {retrieveDanangAssistantAnswer as ask} from './src/services/DanangAssistantRetrievalService';
import {ALL_25_STATIONS} from './src/data/allStations';

test('basic geography answers are independent of station selection',()=>{
 for(const context of [{},...ALL_25_STATIONS.map(station=>({station,hotspot:station.hotspots[0],stations:ALL_25_STATIONS}))]){
  for(const question of ['Đà Nẵng có biển không?','Da Nang co bien ko?']){
   const result=ask(question,context);
   assert.equal(result.found,true,question);
   assert.match(result.answer,/ven biển/);
   assert.doesNotMatch(result.answer,/trò chơi dân gian|kéo co/i);
  }
  const dragon=ask('Cầu Rồng ở đâu?',context);
  assert.equal(dragon.found,true);
  assert.match(dragon.answer,/sông Hàn/);
 }
});

test('unrelated locations and uncertain facts are not falsely answered',()=>{
 assert.doesNotMatch(ask('Huế có biển không?').answer,/Đà Nẵng là thành phố ven biển/);
 assert.doesNotMatch(ask('Cầu Rồng hôm nay phun lửa lúc mấy giờ?').answer,/Cầu Rồng bắc qua sông Hàn/);
});
