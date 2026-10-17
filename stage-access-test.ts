import {test} from 'node:test';
import assert from 'node:assert/strict';
import {unlockedStage} from './src/features/stations/stageAccess';

test('review keeps earned stages open without unlocking unfinished challenges',()=>{
 const p={stationCompleted:false,stampReceived:false,stage1Completed:false,stage2Completed:false,stage3Completed:false};
 assert.equal(unlockedStage(p),1);
 assert.equal(unlockedStage({...p,stage1Completed:true}),2);
 assert.equal(unlockedStage({...p,stage1Completed:true,stage2Completed:true}),3);
 assert.equal(unlockedStage({...p,stage1Completed:true,stage2Completed:true,stage3Completed:true}),4);
 assert.equal(unlockedStage({...p,stampReceived:true}),4);
 assert.equal(unlockedStage({...p,stage2Completed:true}),1);
});
