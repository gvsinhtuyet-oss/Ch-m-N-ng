import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {GRADE_1_STATIONS,GRADE1_CONTENT_REVISION} from './src/data/grade1Stations';
import {getStationsForGrade} from './src/data/allStations';
import {DEMO_STATION_IDS} from './src/data/demoStations';
import {currentGrade1Content} from './src/services/Grade1ContentPolicy';
import {contentService} from './src/services/ContentService';
import {createLessonPlan} from './src/services/LessonPlanService';
import {GRADE1_MEDIA,grade1MediaBySrc} from './src/data/grade1Media';

test('grade 1 opens all five source topics in book order, retaining stable station identities',()=>{
 const s=getStationsForGrade(1);assert.deepEqual(s.map(x=>x.id),['g1-station-1','g1-station-4','g1-station-2','g1-station-3','g1-station-5']);assert.deepEqual(s.map(x=>x.number),[1,2,3,4,5]);for(const x of s){assert.ok(DEMO_STATION_IDS.has(x.id));assert.equal(x.grade,1);assert.equal(x.version.status,'IN_REVIEW');assert.equal(x.version.version,GRADE1_CONTENT_REVISION);assert.match(x.officialCurriculumReference,/TLĐP 1/);}
});
test('every station has four complete observation points and five different applied challenges',()=>{
 for(const s of GRADE_1_STATIONS){assert.equal(s.hotspots.length,4);assert.equal(s.challenge.questions?.length,5);assert.equal(s.challenge.passingScore,5);assert.equal(s.challenge.completionMode,'AUTO');const seen=new Set<string>();
 for(const h of s.hotspots){assert.equal(h.stationId,s.id);assert.ok(h.narrationVi.length>100);assert.ok(h.keyFactVi);assert.ok(h.interaction);seen.add(h.interaction.questionVi);assert.equal(h.interaction.options.filter(o=>o.isCorrect).length,1);assert.ok(h.sources?.length);assert.doesNotMatch(h.narrationVi,/đang cập nhật|Ban biên soạn cập nhật|23 phường|70 xã|ba mét|hơn năm mét/i);}
 const correctPositions=new Set<number>();for(const q of s.challenge.questions!){assert.ok(!seen.has(q.questionVi),'no repeated stage-1 question');seen.add(q.questionVi);assert.ok(q.hintVi);assert.equal(q.options.length,3);assert.equal(q.options.filter(o=>o.isCorrect).length,1);correctPositions.add(q.options.findIndex(o=>o.isCorrect));assert.doesNotMatch(q.questionVi,/bao nhiêu tiết|thuộc chủ đề trọng tâm/);}assert.equal(correctPositions.size,3);
 assert.equal(seen.size,9);assert.equal(s.checkIn.rememberPromptVi,'Sau hành trình, em thấy thế nào?');assert.equal(s.checkIn.actionOptions.length,3);assert.equal(s.journeyMap?.summaryNodes.length,4);assert.ok(s.stamp.nameVi);assert.equal(s.rewards.length,3);
 }
});
test('source-specific facts, two Suoi Mo sites, no invented fieldtrip/photo claims',()=>{
 const byId=(id:string)=>GRADE_1_STATIONS.find(s=>s.id===id)!;
 const stream=byId('g1-station-3').hotspots.map(h=>h.narrationVi).join(' ');assert.match(stream,/Hà Nha/);assert.match(stream,/Bà Nà/);assert.match(stream,/Quế Sơn Trung/);assert.match(stream,/rừng cây xanh/);assert.match(stream,/thác.*hồ/);assert.match(stream,/không có nghĩa.*an toàn/);
 const citadel=byId('g1-station-4').hotspots.map(h=>h.narrationVi).join(' ');for(const fact of ['2017','cửa phía nam','cửa phía đông','Pháp','Tây Ban Nha','Nguyễn Tri Phương'])assert.ok(citadel.includes(fact));
 const food=byId('g1-station-5').hotspots.map(h=>h.narrationVi).join(' ');for(const fact of ['mì Quảng','cao lầu','bê thui','bánh đập','cơm gà','nem nướng','đậu phụng','bánh tráng'])assert.ok(food.includes(fact));
});
test('all 20 learning points use packaged photo or illustration assets with honest credits',()=>{
 assert.equal(GRADE1_MEDIA.length,18);assert.equal(GRADE1_MEDIA.filter(m=>m.kind==='photo').length,6);assert.equal(GRADE1_MEDIA.filter(m=>m.kind==='illustration').length,12);
 for(const s of GRADE_1_STATIONS){assert.ok(grade1MediaBySrc(s.coverImage));for(const h of s.hotspots){assert.match(h.image,/^\/learning\/grade1\/media\/[a-z0-9-]+\.webp$/);assert.ok(existsSync('public'+h.image),h.id);const m=grade1MediaBySrc(h.image)!;assert.ok(m);assert.ok(h.mediaCredit);assert.ok(h.sources?.length);if(m.kind==='photo'){assert.match(m.sourceUrl,/^https:\/\/commons.wikimedia.org\/wiki\/File:/);assert.match(m.licenseUrl,/creativecommons.org/);assert.ok(m.author);}else{assert.match(m.author,/AI/);assert.match(m.changes,/không phải ảnh chụp/);}}const map=readFileSync('public'+s.journeyMap!.image,'utf8');assert.match(map,/không phải ảnh tư liệu/);}
 const streams=GRADE_1_STATIONS.find(s=>s.id==='g1-station-3')!;for(const h of streams.hotspots)assert.equal(grade1MediaBySrc(h.image)!.kind,'illustration');assert.match(streams.hotspots[2].narrationVi,/không phải ảnh tư liệu/);
});

test('media revision discards bundled schematic overrides without mutating storage or losing custom photo credit',()=>{
 const s=structuredClone(GRADE_1_STATIONS[0]);const stored={contentRevision:'3.0.0-grade1-source',coverImage:'/learning/grade1/g1-station-1-cover.svg',mapImage:'',hotspots:s.hotspots.map((h,i)=>({...h,image:`/learning/grade1/g1-station-1-point-${i+1}.svg`})),resources:[]};const before=JSON.stringify(stored);const updated=currentGrade1Content(s,stored);assert.equal(updated.hotspots[0].image,s.hotspots[0].image);assert.equal(updated.coverImage,s.coverImage);assert.equal(JSON.stringify(stored),before);
 const custom={...stored,hotspots:[{...stored.hotspots[0],image:'https://school.example/photo.jpg',mediaCredit:'Ảnh giáo viên tự chụp'},...stored.hotspots.slice(1)]};const kept=currentGrade1Content(s,custom);assert.equal(kept.hotspots[0].image,'https://school.example/photo.jpg');assert.equal(kept.hotspots[0].mediaCredit,'Ảnh giáo viên tự chụp');
});
test('legacy scaffold cannot replace new knowledge; pure policy preserves stored payload and current edits',()=>{
 const s=structuredClone(GRADE_1_STATIONS[0]);const old={coverImage:'https://images.unsplash.com/old',mapImage:'',hotspots:[{...s.hotspots[0],titleVi:'1. Giới thiệu bài học: Quê hương em',narrationVi:'Ban biên soạn cập nhật'}],resources:[]};const before=JSON.stringify(old);const current=currentGrade1Content(s,old);assert.equal(current.hotspots.length,4);assert.equal(current.hotspots[0].narrationVi,s.hotspots[0].narrationVi);assert.equal(JSON.stringify(old),before);const edited={...current,hotspots:[{...current.hotspots[0],narrationVi:'Giáo viên đã chỉnh'},...current.hotspots.slice(1)]};assert.equal(currentGrade1Content(s,edited),edited);
 const g2={...s,grade:2};assert.equal(currentGrade1Content(g2,old),old);
});
test('reading built-in content and building a lesson plan makes zero network or Firestore calls',()=>{
 const original=globalThis.fetch;let requests=0;globalThis.fetch=(()=>{requests++;throw Error('network must not be used')}) as typeof fetch;
 try{for(const s of GRADE_1_STATIONS){const c=contentService.get(s);assert.equal(c.hotspots.length,4);contentService.apply(s);const plan=createLessonPlan({id:'g1-test',grade:1,subject:'HĐTN',week:'',lesson:s.titleVi,integrationType:'Liên hệ',activity:'Khám phá',content:s.hotspots[0].keyFactVi});assert.equal(plan.grade,1);}assert.equal(requests,0);}finally{globalThis.fetch=original;}
});

test('existing citadel rewards, stamp and map identities remain readable for past learners',()=>{const s=GRADE_1_STATIONS.find(x=>x.id==='g1-station-4')!;assert.deepEqual(s.rewards.map(r=>r.id),['rw-tdh-1','rw-tdh-2','rw-tdh-3']);assert.equal(s.stamp.id,'stamp-thanh-dien-hai');assert.equal(s.journeyMap?.id,'map-g1-thanh-dien-hai');});
