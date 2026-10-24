import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {GRADE_45_STATIONS,GRADE4_CONTENT_REVISION} from './src/data/grade45Stations';
import {GRADE4_TEXTBOOK_PREVIOUS_CONTENT} from './src/data/grade4TextbookPreviousContent';
import {GRADE4_MA_CHAU_EXTENSION} from './src/data/grade4ExtensionContent';
import {OFFICIAL_25_CATALOG} from './src/data/curriculumCatalog';
import {getStationsForGrade,ALL_25_STATIONS} from './src/data/allStations';
import {DEMO_STATION_IDS} from './src/data/demoStations';
import {currentGrade45Content} from './src/services/Grade45ContentPolicy';
import {currentNarrationContent} from './src/services/NarrationReviewPolicy';
const stations=getStationsForGrade(4);
const text=(id:string)=>stations.find(s=>s.id===id)!.hotspots.map(h=>h.narrationVi).join(' ');
test('grade4 follows five corrected themes with fresh river identity and retained silk extension',()=>{
 assert.equal(ALL_25_STATIONS.length,25);assert.equal(OFFICIAL_25_CATALOG.length,25);
 assert.deepEqual(stations.map(s=>s.id),['g4-station-1','g4-station-3','g4-station-2','g4-thu-bon-hon-kem','g4-station-4']);
 assert.deepEqual(stations.map(s=>s.number),[1,2,3,4,5]);assert.ok(stations.every(s=>DEMO_STATION_IDS.has(s.id)));
 assert.match(stations[2].titleVi,/Mỹ Sơn.*Bảo tàng Điêu khắc Chăm/);assert.equal(GRADE4_MA_CHAU_EXTENSION.id,'g4-station-5');
 assert.equal(GRADE4_MA_CHAU_EXTENSION.points.length,4);assert.equal(GRADE4_MA_CHAU_EXTENSION.questions.length,5);assert.ok(!stations.some(s=>s.id===GRADE4_MA_CHAU_EXTENSION.id));
});
test('27 points retain textbook-specific knowledge across nature, economy, heritage, river and craft',()=>{
 assert.equal(stations.reduce((n,s)=>n+s.hotspots.length,0),27);
 const expected:Record<string,string[]>={
 'g4-station-1':['Huế','Quảng Ngãi','Lào','đồi núi','mùa mưa','Sông Hàn','voọc chà vá chân nâu','cần cù'],
 'g4-station-3':['Chu Lai','Trà Quế','Tiên Sa','thủy canh','Non Nước'],
 'g4-station-2':['xã Thu Bồn','thế kỉ IV','1999','điêu khắc','1915','1919','nhãn'],
 'g4-thu-bon-hon-kem':['Ngọc Linh','Cửa Đại','giao thương','đua thuyền','vách núi','Chăm-pa','Nguyễn Duy Hiệu'],
 'g4-station-4':['Thanh Chiêm 1','phường Điện Bàn','400 năm','tạo mẫu','làm khuôn','nấu đồng','rót đồng','làm nguội','thẩm âm','đồ lưu niệm']};
 for(const [id,terms] of Object.entries(expected))for(const term of terms)assert.ok(text(id).toLowerCase().includes(term.toLowerCase()),id+': '+term);
});
test('questions, reflection, passport summaries and assets agree with the revised topics',()=>{
 for(const s of stations){assert.equal(s.version.version,GRADE4_CONTENT_REVISION);assert.equal(s.challenge.questions!.length,5);assert.equal(s.journeyMap?.summaryNodes.length,s.hotspots.length);assert.equal(s.checkIn.actionOptions.length,3);
 const questions=new Set(s.hotspots.map(h=>h.interaction!.questionVi));for(const q of s.challenge.questions!){assert.ok(!questions.has(q.questionVi));assert.equal(q.options.filter(o=>o.isCorrect).length,1);}
 for(const h of s.hotspots){assert.ok(h.narrationVi.length>150);assert.equal(h.interaction!.options.filter(o=>o.isCorrect).length,1);assert.ok(existsSync('public'+h.image));assert.ok(s.journeyMap?.summaryNodes.some(n=>n.titleVi===h.titleVi&&n.textVi===h.keyFactVi));assert.doesNotMatch(h.narrationVi,/chưa gắn|đề cương dự thảo|không yêu cầu học thuộc/);}
 for(const src of [s.coverImage,s.journeyMap!.image!]){assert.ok(existsSync('public'+src));if(src.endsWith('.svg'))assert.match(readFileSync('public'+src,'utf8'),/không phải ảnh tư liệu/);else assert.equal(readFileSync('public'+src).toString('ascii',8,12),'WEBP');}
 }
});
test('old shipped grade4 content upgrades to all new points without mutating resources or input',()=>{
 for(const s of stations){const previous=GRADE4_TEXTBOOK_PREVIOUS_CONTENT.find(l=>l.id===s.id);if(!previous)continue;
 const old={contentRevision:'3.1.0-grade4-reviewed-media',coverImage:`/learning/grade45/${s.id}-cover.svg`,mapImage:`/learning/grade45/${s.id}-map.svg`,resources:[{id:'teacher',kind:'document' as const,title:'Tài liệu riêng',url:'https://school.example/doc'}],hotspots:previous.points.map((p,i)=>({...s.hotspots[i],id:p.id,titleVi:`${i+1}. ${p.title}`,narrationVi:p.narration,keyFactVi:p.fact,image:`/learning/grade45/${s.id}-point-${i+1}.svg`,interaction:{...s.hotspots[i].interaction!,questionVi:p.q,options:p.answers.map((textVi,i)=>({id:'opt-'+i,textVi,isCorrect:i===0}))}}))};
 const snapshot=JSON.stringify(old),updated=currentNarrationContent(currentGrade45Content(s,old));assert.equal(JSON.stringify(old),snapshot);assert.equal(updated.contentRevision,GRADE4_CONTENT_REVISION);assert.equal(updated.resources,old.resources);
 assert.deepEqual(updated.hotspots.map(h=>[h.id,h.titleVi,h.narrationVi,h.keyFactVi,h.image,h.interaction?.questionVi]),s.hotspots.map(h=>[h.id,h.titleVi,h.narrationVi,h.keyFactVi,h.image,h.interaction?.questionVi]));assert.equal(currentGrade45Content(s,updated),updated);
 }
});
test('teacher edits to wording, answers, images and resources survive while missing textbook points are added',()=>{
 const s=stations[0],previous=GRADE4_TEXTBOOK_PREVIOUS_CONTENT.find(l=>l.id===s.id)!;
 const custom={contentRevision:'3.1.0-grade4-reviewed-media',coverImage:'https://school.example/cover',mapImage:'https://school.example/map',resources:[],hotspots:previous.points.map((p,i)=>({...s.hotspots[i],id:p.id,titleVi:'Tiêu đề riêng',narrationVi:'Lời dẫn riêng',keyFactVi:'Kiến thức giáo viên biên tập',image:'https://school.example/photo',interaction:{...s.hotspots[i].interaction!,questionVi:p.q,options:[{id:'teacher-answer',textVi:'Đáp án riêng',isCorrect:true}]}}))};
 const snapshot=JSON.stringify(custom),out=currentGrade45Content(s,custom);assert.equal(out.hotspots.length,s.hotspots.length);assert.equal(out.coverImage,custom.coverImage);assert.equal(out.mapImage,custom.mapImage);assert.equal(JSON.stringify(custom),snapshot);
 for(let i=0;i<4;i++){assert.equal(out.hotspots[i].titleVi,'Tiêu đề riêng');assert.equal(out.hotspots[i].narrationVi,'Lời dẫn riêng');assert.equal(out.hotspots[i].image,custom.hotspots[i].image);assert.equal(out.hotspots[i].interaction,custom.hotspots[i].interaction);}
});
test('river cannot inherit silk completion and uncertain quantities are not quiz answers',()=>{
 const river=stations.find(s=>s.id==='g4-thu-bon-hon-kem')!;assert.notEqual(river.id,GRADE4_MA_CHAU_EXTENSION.id);assert.ok(!river.hotspots.some(h=>GRADE4_MA_CHAU_EXTENSION.points.some(p=>p.id===h.id)));
 const economy=stations.find(s=>s.id==='g4-station-3')!;assert.doesNotMatch(JSON.stringify(economy.hotspots)+JSON.stringify(economy.challenge),/5,9%|37%|200 000|70%/);
 assert.ok(stations.every(s=>s.totalPeriods===0));
});
