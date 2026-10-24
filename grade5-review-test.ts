import {REAL_PHOTOS} from './src/data/realPhotos';
import {GRADE5_PREVIOUS_POINTS} from './src/data/grade5PreviousContent';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {getStationsForGrade,ALL_25_STATIONS} from './src/data/allStations';
import {GRADE5_CONTENT_REVISION} from './src/data/grade45Stations';
import {GRADE5_TEXTBOOK_PREVIOUS_CONTENT} from './src/data/grade5TextbookPreviousContent';
import {GRADE45_TOPIC_DECKS} from './src/data/teacher/grade45TopicDecks';
import {GRADE45_MEDIA} from './src/data/grade45Media';
import {GRADE5_MEDIA} from './src/data/grade5Media';
import {DEMO_STATION_IDS} from './src/data/demoStations';
import {currentGrade45Content} from './src/services/Grade45ContentPolicy';
import {currentNarrationContent} from './src/services/NarrationReviewPolicy';
const stations=getStationsForGrade(5);
const text=(id:string)=>stations.find(s=>s.id===id)!.hotspots.map(h=>h.narrationVi).join(' ');
const mapping:Record<string,number[]>={'g5-station-3':[0,-1,3,1,-1,2],'g5-station-4':[0,1,2,-1,-1,3],'g5-station-5':[0,1,-1,3,2,-1]};
function saved(s:typeof stations[number]){
 const b=GRADE5_TEXTBOOK_PREVIOUS_CONTENT.find(l=>l.id===s.id)!;
 return {contentRevision:'3.1.0-grade5-reviewed-media',coverImage:`/learning/grade45/${s.id}-cover.svg`,mapImage:`/learning/grade45/${s.id}-map.svg`,resources:[{id:'school',title:'Tư liệu riêng',kind:'document' as const,url:'https://school.example/doc'}],hotspots:b.points.map((p,i)=>({...s.hotspots[0],id:p.id,titleVi:`${i+1}. ${p.title}`,image:`/learning/grade45/${s.id}-point-${i+1}.svg`,narrationVi:p.narration,keyFactVi:p.fact,interaction:{...s.hotspots[0].interaction!,questionVi:p.q,options:p.answers.map((textVi,i)=>({id:'opt-'+i,textVi,isCorrect:i===0}))}}))};
}
test('five grade5 topics follow supplied review order; unrelated replacements have new identities',()=>{
 assert.equal(ALL_25_STATIONS.length,25);assert.deepEqual(stations.map(s=>s.id),['g5-ky-anh-me-nhu','g5-station-3','g5-station-4','g5-lua-ma-chau','g5-station-5']);assert.deepEqual(stations.map(s=>s.number),[1,2,3,4,5]);
 assert.ok(stations.every(s=>DEMO_STATION_IDS.has(s.id)&&s.totalPeriods===0));assert.ok(!stations.some(s=>['g5-station-1','g5-station-2'].includes(s.id)));assert.equal(stations.reduce((n,s)=>n+s.hotspots.length,0),29);
});
test('29 exploration points retain characteristic knowledge from all five textbooks',()=>{
 const terms:Record<string,string[]>={
 'g5-ky-anh-me-nhu':['Bàn Thạch','1965','1967','lỗ thông hơi','Đình Thạch Tân','Lê Thị Dảnh','26 tháng 12 năm 1968','746','Phạm Văn Hạng'],
 'g5-station-3':['1 487','1919','đào chuông','1826','Thiên hạ đệ nhất hùng quan','2017','2021'],
 'g5-station-4':['Dương Hỏa Sơn','Âm Hỏa Sơn','Huyền Không','78','chữ Hán và chữ Nôm','2022','Huỳnh Bá Quát','2014','2018'],
 'g5-lua-ma-chau':['Nam Phước','2004','lá dâu','kén','ươm tơ','dệt','nhuộm','Satin','lụa thao'],
 'g5-station-5':['Panax vietnamensis','Ngũ gia bì','1 500','2 100','Đà Nẵng và Quảng Ngãi','1973','Đào Kim Long','saponin','Xơ Đăng','Lễ hội']};
 for(const [id,list] of Object.entries(terms))for(const term of list)assert.ok(text(id).includes(term),`${id}: ${term}`);
 assert.doesNotMatch(text('g5-ky-anh-me-nhu'),/Nguyễn Thị Thứ/);assert.match(text('g5-station-5'),/người dân bản địa|Người dân bản địa/);
});
test('stage1 questions, 25 applied challenges and all summaries stay aligned and locally available',()=>{
 const seen=new Set<string>();for(const s of stations){assert.equal(s.version.version,GRADE5_CONTENT_REVISION);assert.equal(s.challenge.questions!.length,5);assert.equal(s.journeyMap!.summaryNodes.length,s.hotspots.length);assert.equal(s.checkIn.actionOptions.length,3);
 for(const h of s.hotspots){assert.ok(h.narrationVi.length>180);assert.ok(h.interaction!.explanationVi);assert.equal(h.interaction!.options.filter(o=>o.isCorrect).length,1);assert.ok(existsSync('public'+h.image));assert.ok(!seen.has(h.interaction!.questionVi));seen.add(h.interaction!.questionVi);assert.equal(s.journeyMap!.summaryNodes.find(n=>n.id==='map-'+h.id)?.textVi,h.keyFactVi);}
 for(const q of s.challenge.questions!){assert.ok(!seen.has(q.questionVi));seen.add(q.questionVi);assert.equal(q.options.length,3);assert.equal(new Set(q.options.map(o=>o.textVi)).size,3);assert.equal(q.options.filter(o=>o.isCorrect).length,1);assert.ok(q.hintVi);}
 const deck=GRADE45_TOPIC_DECKS.find(d=>d.title===s.titleVi)!;assert.equal(deck.slides.length,s.hotspots.length+7);for(const [i,h]of s.hotspots.entries())assert.ok(deck.slides[i+1].points.includes(h.narrationVi));
 for(const path of [s.coverImage,s.journeyMap!.image!]){assert.ok(existsSync('public'+path));assert.match(readFileSync('public'+path,'utf8'),/không phải ảnh tư liệu/);}
 }assert.equal(seen.size,54);
});
test('photos are correctly scoped and never confuse Mother Nhu with Mother Thu or ginseng provinces',()=>{
 assert.ok(stations[0].hotspots.every(h=>REAL_PHOTOS.some(p=>p.src===h.image)));assert.ok(stations[0].hotspots[3].image.endsWith('me-nhu-tuong.webp'));assert.ok(stations[1].hotspots[3].image.endsWith('hai-van-2024.webp'));
 for(const s of stations)for(const h of s.hotspots.filter(h=>h.image.endsWith('.webp'))){const m=[...GRADE45_MEDIA,...GRADE5_MEDIA,...REAL_PHOTOS].find(m=>m.src===h.image);assert.ok(m);assert.ok(h.mediaCredit?.includes(m.author));assert.ok(m.sourceUrl);assert.ok(m.license);}
 assert.match(stations[4].hotspots[0].mediaCredit!,/Măng Ri.*ngoài Đà Nẵng/);assert.ok(stations[3].hotspots[0].image.endsWith('ma-chau-xuong.webp'));
});
test('legacy default content upgrades purely to all new textbook points, with fresh covers and maps',()=>{
 for(const s of stations.filter(s=>mapping[s.id])){const old=saved(s),snapshot=JSON.stringify(old),out=currentNarrationContent(currentGrade45Content(s,old));assert.equal(JSON.stringify(old),snapshot);assert.equal(out.resources,old.resources);assert.equal(out.contentRevision,GRADE5_CONTENT_REVISION);assert.equal(out.coverImage,s.coverImage);assert.equal(out.mapImage,s.journeyMap!.image);assert.deepEqual(out.hotspots,s.hotspots);assert.equal(currentGrade45Content(s,out),out);}
});
test('semantic migration preserves teacher wording, question, image and resource edits at the matching topic',()=>{
 for(const s of stations.filter(s=>mapping[s.id])){const old=saved(s);old.coverImage='https://school.example/cover';old.mapImage='https://school.example/map';for(const h of old.hotspots){h.narrationVi='Lời riêng '+h.id;h.titleVi='Tên riêng '+h.id;h.keyFactVi='Ghi nhớ riêng '+h.id;h.image='https://school.example/'+h.id;h.interaction!.questionVi='Câu hỏi riêng '+h.id;}
 const snapshot=JSON.stringify(old),out=currentGrade45Content(s,old);assert.equal(JSON.stringify(old),snapshot);assert.equal(out.coverImage,old.coverImage);assert.equal(out.mapImage,old.mapImage);assert.equal(out.resources,old.resources);
 for(const [i,oldIndex] of mapping[s.id].entries()){if(oldIndex<0){assert.deepEqual(out.hotspots[i],s.hotspots[i]);continue;}assert.equal(out.hotspots[i].narrationVi,old.hotspots[oldIndex].narrationVi);assert.equal(out.hotspots[i].titleVi,old.hotspots[oldIndex].titleVi);assert.equal(out.hotspots[i].interaction,old.hotspots[oldIndex].interaction);assert.equal(out.hotspots[i].image,old.hotspots[oldIndex].image);}
 }
});
test('medical claims and unsafe demonstrations are not endorsed by answer keys or student actions',()=>{
 const s=stations[4];const correct=[...s.hotspots.map(h=>h.interaction!.options.find(o=>o.isCorrect)!.textVi),...s.challenge.questions!.map(q=>q.options.find(o=>o.isCorrect)!.textVi),...s.checkIn.actionOptions.map(o=>o.textVi)].join(' ');
 assert.doesNotMatch(correct,/chữa khỏi|chữa được mọi bệnh|ngâm rượu|dùng thử|tăng tuổi thọ/);assert.match(text(s.id),/không tự dùng/);assert.match(text(s.id),/không tự hái hay nếm/);assert.match(text(s.id),/truy xuất nguồn gốc/);
 assert.doesNotMatch(text('g5-lua-ma-chau'),/kháng khuẩn|kháng mùi/);
});

test('original 3.0 shipped wording, facts and answers also migrate without stale defaults',()=>{
 for(const s of stations.filter(s=>mapping[s.id])){const old=saved(s);old.contentRevision='3.0.0-grade45-source';for(const h of old.hotspots){const b=GRADE5_PREVIOUS_POINTS[h.id];Object.assign(h,{narrationVi:b.narrationVi,keyFactVi:b.keyFactVi,image:b.image});h.interaction={...h.interaction!,questionVi:b.questionVi,options:b.answers.map((textVi,i)=>({id:'opt-'+i,textVi,isCorrect:i===0}))};}
 const out=currentGrade45Content(s,old);for(const [i,h]of out.hotspots.entries()){assert.equal(h.narrationVi,s.hotspots[i].narrationVi);assert.equal(h.keyFactVi,s.hotspots[i].keyFactVi);assert.deepEqual(h.interaction,s.hotspots[i].interaction);}
 }
});
