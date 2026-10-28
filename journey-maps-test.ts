import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import sharp from 'sharp';
import {ALL_25_STATIONS} from './src/data/allStations';
import {JOURNEY_MAP_ASSETS} from './src/data/journeyMapAssets';
import {stage1Options} from './src/features/stations/stage1Options';
import {contentService} from './src/services/ContentService';

test('25 unique supplied maps decode at original resolution, packaged under exact station IDs',async()=>{
 assert.equal(ALL_25_STATIONS.length,25);
 assert.equal(JOURNEY_MAP_ASSETS.length,25);
 assert.equal(new Set(JOURNEY_MAP_ASSETS.map(a=>a.image)).size,25);
 assert.equal(new Set(JOURNEY_MAP_ASSETS.map(a=>a.source)).size,25);
 for(const station of ALL_25_STATIONS){
  const asset=JOURNEY_MAP_ASSETS.find(a=>a.stationId===station.id)!;
  assert.ok(asset,station.id);assert.equal(station.journeyMap?.image,asset.image);
  const bytes=readFileSync('public'+asset.image);const meta=await sharp(bytes).metadata();
  assert.equal(meta.format,'webp');assert.equal(meta.width,asset.width);assert.equal(meta.height,asset.height);assert.equal(bytes.length,asset.bytes);
 }
 assert.ok(JOURNEY_MAP_ASSETS.reduce((sum,a)=>sum+a.bytes,0)<17_000_000);
});

test('all authored checkpoints select exactly one true and one false source option without mutation',()=>{
 let count=0;
 for(const station of ALL_25_STATIONS)for(const point of station.hotspots){
  count++;const before=JSON.stringify(point.interaction);const pair=stage1Options(point.interaction);
  assert.equal(pair.length,2,station.id+':'+point.id);assert.equal(pair.filter(o=>o.isCorrect).length,1);
  for(const option of pair)assert.ok(point.interaction!.options.includes(option));
  assert.equal(JSON.stringify(point.interaction),before);
 }
 assert.equal(count,121);
 const interaction=ALL_25_STATIONS[0].hotspots[0].interaction!;
 for(const options of [[],interaction.options.filter(o=>o.isCorrect),interaction.options.filter(o=>!o.isCorrect),[...interaction.options, {...interaction.options.find(o=>o.isCorrect)!,id:'duplicate-correct'}]])assert.deepEqual(stage1Options({...interaction,options}),[]);
});

function storage(){const data=new Map<string,string>();Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>data.set(key,value)}});Object.defineProperty(globalThis,'window',{configurable:true,value:{dispatchEvent:()=>true}});}

test('three-stage gate, atomic map/stamp/key, reload, account isolation and 5-key treasure for every grade',async()=>{
 storage();const {ProgressService}=await import('./src/services/ProgressService');let service=new ProgressService();
 for(let grade=1;grade<=5;grade++){
  const stations=ALL_25_STATIONS.filter(s=>s.grade===grade),ids=stations.map(s=>s.id);assert.equal(ids.length,5);
  for(const [index,station] of stations.entries()){
   assert.equal(service.finalizeJourneyAndStamp('qa-student',station.id).journeyMapReceived,false);
   service.completeStage1('qa-student',station.id);
   assert.equal(service.finalizeJourneyAndStamp('qa-student',station.id).stampReceived,false);
   service.completeStage2('qa-student',station.id);
   assert.equal(service.finalizeJourneyAndStamp('qa-student',station.id).keyFragmentReceived,false);
   service.completeStage3('qa-student',station.id,{stationId:station.id,submittedAt:new Date().toISOString()} as any);
   const earned=service.finalizeJourneyAndStamp('qa-student',station.id);
   assert.ok(earned.journeyMapReceived&&earned.keyFragmentReceived&&earned.stampReceived&&earned.stationCompleted&&earned.stage4Completed);
   assert.equal(service.finalizeJourneyAndStamp('qa-student',station.id).journeyMapReceivedAt,earned.journeyMapReceivedAt);
   service=new ProgressService(); // A fresh client loads the same account's persisted records.
   assert.equal(service.getStationProgress('qa-student',station.id).journeyMapReceived,true);
   assert.equal(service.getStationProgress('qa-other',station.id).journeyMapReceived,false);
   assert.equal(service.getStationProgress('guest',station.id).journeyMapReceived,false);
   if(index<4)assert.equal(service.openGradeTreasure('qa-student',grade,ids).chestOpened,false);
  }
  assert.equal(service.getGradeProgress('qa-student',ids,grade).totalKeyFragments,5);
  assert.equal(service.openGradeTreasure('qa-student',grade,ids).chestOpened,true);
  assert.equal(new ProgressService().getGradeTreasureProgress('qa-student',grade).chestOpened,true);
 }
});

test('old saved map URLs cannot override packaged maps on apply or editor read',()=>{
 storage();
 for(const station of ALL_25_STATIONS){
  const original=station.journeyMap!.image;
  contentService.saveLocal(station,{contentRevision:station.version.version,coverImage:station.coverImage,mapImage:'https://old.example/wrong.png',hotspots:station.hotspots,resources:[]});
  assert.equal(station.journeyMap!.image,original);assert.equal(contentService.get(station).mapImage,original);
 }
});
