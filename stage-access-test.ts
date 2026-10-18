import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ALL_25_STATIONS} from './src/data/allStations';
import {allHotspotsAnswered,visibleStage,unlockedStage} from './src/features/stations/stageAccess';

test('review keeps earned stages open without unlocking unfinished challenges',()=>{
 const p={stationCompleted:false,stampReceived:false,stage1Completed:false,stage2Completed:false,stage3Completed:false};
 assert.equal(unlockedStage(p),1);
 assert.equal(unlockedStage({...p,stage1Completed:true}),2);
 assert.equal(unlockedStage({...p,stage1Completed:true,stage2Completed:true}),3);
 assert.equal(unlockedStage({...p,stage1Completed:true,stage2Completed:true,stage3Completed:true}),4);
 assert.equal(unlockedStage({...p,stampReceived:true}),4);
 assert.equal(unlockedStage({...p,stage2Completed:true}),1);
});

test('requested stage is never completion evidence, while earned reviews remain open',()=>{
 const fresh={stationCompleted:false,stampReceived:false,stage1Completed:false,stage2Completed:false,stage3Completed:false};
 for(const request of [1,2,3,4])assert.equal(visibleStage(request,fresh),1);
 assert.equal(visibleStage(4,fresh,2),2);
 assert.equal(visibleStage(4,{...fresh,stage1Completed:true}),2);
 for(const request of [1,2,3,4])assert.equal(visibleStage(request,{...fresh,stationCompleted:true,stampReceived:true}),request);
});
test('each of all 105 questions is required before first completion; last-point clicks and duplicate IDs cannot pass',()=>{
 for(const s of ALL_25_STATIONS){const ids=s.hotspots.map(h=>h.id);assert.ok(allHotspotsAnswered(s.hotspots,ids));assert.ok(!allHotspotsAnswered(s.hotspots,[]));assert.ok(!allHotspotsAnswered(s.hotspots,[ids.at(-1)!]));for(const missing of ids)assert.ok(!allHotspotsAnswered(s.hotspots,ids.filter(id=>id!==missing)),s.id+missing);assert.ok(!allHotspotsAnswered(s.hotspots,Array(ids.length).fill(ids[0])));}
 assert.equal(allHotspotsAnswered([],[]),false);
});
