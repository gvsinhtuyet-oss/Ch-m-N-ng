import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {GRADE_1_STATIONS,GRADE1_CONTENT_REVISION} from './src/data/grade1Stations';
import {getStationsForGrade} from './src/data/allStations';
import {DEMO_STATION_IDS} from './src/data/demoStations';
import {currentGrade1Content} from './src/services/Grade1ContentPolicy';
import {contentService} from './src/services/ContentService';
import {createLessonPlan} from './src/services/LessonPlanService';

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
test('all local illustrations and maps exist and contain explicit schematic credit; no remote asset dependency',()=>{
 const assets=new Set<string>();for(const s of GRADE_1_STATIONS){for(const path of [s.coverImage,s.journeyMap!.image!,...s.hotspots.map(h=>h.image)]){assert.match(path,/^\/learning\/grade1\/[a-z0-9-]+\.svg$/);assert.ok(existsSync('public'+path),path);const svg=readFileSync('public'+path,'utf8');assert.match(svg,/không phải ảnh tư liệu/);assert.doesNotMatch(svg,/<script|https?:\/\/[^w]/);assert.ok(!assets.has(path));assets.add(path);}}assert.equal(assets.size,30);
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
