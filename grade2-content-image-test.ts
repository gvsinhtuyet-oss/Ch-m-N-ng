import test from 'node:test';
import assert from 'node:assert/strict';
import { GRADE_2_STATIONS } from './src/data/grade2Stations';

test('grade 2 has five current-book stations', () => {
  assert.equal(GRADE_2_STATIONS.length, 5);
});

test('every grade 2 hotspot has a distinct non-empty image within its station', () => {
  for (const station of GRADE_2_STATIONS) {
    assert.ok(station.coverImage);
    const images = station.hotspots.map(h => h.image?.trim());
    assert.ok(images.every(Boolean), station.titleVi);
    assert.equal(new Set(images).size, images.length, station.titleVi);
  }
});

test('Hoi An keeps six learning points', () => {
  const station = GRADE_2_STATIONS.find(s => s.id === 'g2-station-4');
  assert.ok(station);
  assert.equal(station.hotspots.length, 6);
});

test('all grade 2 stations cite the current teaching material', () => {
  for (const station of GRADE_2_STATIONS) {
    assert.match(station.officialCurriculumReference || '', /lop 2 dang su dung|lớp 2 đang sử dụng/i);
  }
});


test('all five grade 2 stations are unlocked for competition demo', async () => {
  const { DEMO_STATION_IDS } = await import('./src/data/demoStations');
  for (const station of GRADE_2_STATIONS) {
    assert.equal(DEMO_STATION_IDS.has(station.id), true, station.titleVi);
  }
});


test('Cu Lao Cham station follows current-book checkpoints', () => {
  const station = GRADE_2_STATIONS.find(s => s.id === 'g2-station-2');
  assert.ok(station);
  assert.equal(station.hotspots.length, 5);
  assert.match(station.hotspots[0].titleVi, /Hòn Lao/i);
  assert.match(station.hotspots[1].keyFactVi || '', /2009/i);
  assert.match(station.hotspots[2].narrationVi, /lặn ngắm san hô/i);
  assert.match(station.hotspots[3].narrationVi, /Voọc chà vá chân nâu/i);
  assert.match(station.hotspots[4].narrationVi, /bỏ rác đúng nơi/i);
  assert.equal(new Set(station.hotspots.map(h => h.image)).size, 5);
});

test('all 25 grade-2 points and 25 challenges have exactly one correct answer and stable identities',()=>{
 for(const s of GRADE_2_STATIONS){
  assert.equal(new Set(s.hotspots.map(h=>h.id)).size,s.hotspots.length);
  for(const h of s.hotspots){assert.equal(h.stationId,s.id);assert.ok(h.narrationVi&&h.keyFactVi);assert.ok(h.interaction);assert.equal(h.interaction.options.filter(o=>o.isCorrect).length,1);assert.equal(new Set(h.interaction.options.map(o=>o.id)).size,h.interaction.options.length);}
  assert.equal(s.challenge.questions?.length,5);assert.equal(s.challenge.passingScore,5);
  for(const q of s.challenge.questions!){assert.equal(q.options.filter(o=>o.isCorrect).length,1);assert.equal(new Set(q.options.map(o=>o.id)).size,q.options.length);}
  assert.ok(s.checkIn.emotions.length&&s.checkIn.rememberOptions.length&&s.checkIn.actionOptions.length);
  assert.ok(s.journeyMap?.summaryNodes.length);assert.deepEqual(s.rewards.map(r=>r.stage),[1,2,3]);
 }
 assert.equal(GRADE_2_STATIONS.reduce((n,s)=>n+s.hotspots.length,0),25);
});

test('recognizable old grade-2 topics cannot override current lessons; matching teacher edits survive without IO',async()=>{
 const {currentGrade2Content}=await import('./src/services/Grade2ContentPolicy');
 const original=globalThis.fetch;globalThis.fetch=(()=>{throw Error('network forbidden')}) as typeof fetch;
 try{for(const s of GRADE_2_STATIONS){
  const old={coverImage:'https://old.example/cover.jpg',mapImage:'',hotspots:[{...s.hotspots[0],id:'old-topic-point'}],resources:[]};
  const snapshot=JSON.stringify(old);const updated=currentGrade2Content(s,old);
  assert.equal(updated.hotspots,s.hotspots);assert.equal(updated.coverImage,s.coverImage);assert.equal(JSON.stringify(old),snapshot);
  const edited={...old,hotspots:s.hotspots.map((h,i)=>i===0?{...h,narrationVi:'Lời thuyết minh giáo viên đã chỉnh',image:'https://school.example/photo.jpg'}:h)};
  assert.equal(currentGrade2Content(s,edited).hotspots[0].narrationVi,edited.hotspots[0].narrationVi);assert.equal(currentGrade2Content(s,edited).hotspots[0].image,edited.hotspots[0].image);
  const custom={...edited,contentRevision:s.version.version,hotspots:[...edited.hotspots,{...edited.hotspots[0],id:"teacher-added-point"}]};assert.equal(currentGrade2Content(s,custom),custom);
  assert.equal(currentGrade2Content({...s,grade:1},old),old);
 }}finally{globalThis.fetch=original;}
});

test('all grade-2 images and five maps are packaged, traceable to supplied sources and load without external image links',async()=>{
 const {existsSync,readFileSync}=await import('node:fs');const {createHash}=await import('node:crypto');const {GRADE2_MEDIA,GRADE2_MEDIA_REVISION}=await import('./src/data/grade2Media');const {getStationsForGrade}=await import('./src/data/allStations');
 assert.equal(GRADE2_MEDIA.length,25);assert.equal(new Set(GRADE2_MEDIA.map(m=>m.src)).size,25);
 for(const s of getStationsForGrade(2)){
  assert.equal(s.version.version,GRADE2_MEDIA_REVISION);assert.match(s.coverImage,/^\/learning\/grade2\/media\//);
  assert.match(s.journeyMap!.image!,/^\/images\/maps\/.*\.webp$/);assert.ok(existsSync('public'+s.journeyMap!.image));assert.equal(readFileSync('public'+s.journeyMap!.image).toString('ascii',8,12),'WEBP');
  for(const h of s.hotspots){const m=GRADE2_MEDIA.find(m=>m.id===h.id)!;assert.ok(m);assert.equal(h.image,m.src);const bytes=readFileSync('public'+h.image);assert.equal(createHash('sha256').update(bytes).digest('hex'),m.assetSha256);assert.ok(m.figure&&m.document&&m.sourceSha256);assert.equal(h.mediaRights,'UNKNOWN');assert.ok(h.mediaCredit);}
 }
});

test('previous built-in links upgrade in memory while retaining teacher media and original payload',async()=>{
 const {currentGrade2Content}=await import('./src/services/Grade2ContentPolicy');const {LEGACY_GRADE2_MEDIA_URLS}=await import('./src/data/grade2Media');
 const s=GRADE_2_STATIONS[0];const old={contentRevision:'3.0.0-current-book',coverImage:LEGACY_GRADE2_MEDIA_URLS.find(Boolean)!,mapImage:'',resources:[],hotspots:s.hotspots.map(h=>({...h,image:LEGACY_GRADE2_MEDIA_URLS.find(Boolean)!}))};const before=JSON.stringify(old);const upgraded=currentGrade2Content(s,old);assert.equal(upgraded.hotspots[0].image,s.hotspots[0].image);assert.equal(upgraded.mapImage,s.journeyMap?.image);assert.equal(JSON.stringify(old),before);
});
