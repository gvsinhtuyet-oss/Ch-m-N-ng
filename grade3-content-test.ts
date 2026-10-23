import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {GRADE_3_STATIONS,GRADE3_CONTENT_REVISION} from './src/data/grade3Stations';
import {GRADE3_TEXTBOOK_PREVIOUS_CONTENT} from './src/data/grade3TextbookPreviousContent';
import {GRADE3_MEDIA,grade3MediaBySrc} from './src/data/grade3Media';
import {GRADE3_TOPIC_DECKS} from './src/data/teacher/grade3TopicDecks';
import {currentGrade3Content} from './src/services/Grade3ContentPolicy';
import {currentNarrationContent} from './src/services/NarrationReviewPolicy';
import {getStationsForGrade} from './src/data/allStations';
const byId=(id:string)=>GRADE_3_STATIONS.find(s=>s.id===id)!;
test('textbook sequence is independent of persistent station IDs',()=>{
 const stations=getStationsForGrade(3);
 assert.deepEqual(stations.map(s=>s.id),[2,3,1,4,5].map(n=>'g3-station-'+n));
 assert.deepEqual(stations.map(s=>s.number),[1,2,3,4,5]);
 assert.equal(stations[0].titleVi,'Hoàng Diệu – Phan Châu Trinh');
 for(const s of stations){assert.equal(s.version.version,GRADE3_CONTENT_REVISION);assert.match(s.officialCurriculumReference,/BIEN BAN HC LOP 3/);}
});
test('twenty points and their questions remain usable, with complete downstream activities',()=>{
 for(const s of GRADE_3_STATIONS){assert.equal(s.hotspots.length,4);assert.equal(s.challenge.questions?.length,5);assert.equal(s.checkIn.actionOptions.length,3);assert.equal(s.rewards.length,3);assert.equal(s.journeyMap?.summaryNodes.length,4);
 for(const h of s.hotspots){assert.ok(h.narrationVi.length>150);assert.ok(h.sources?.length);assert.equal(h.interaction?.options.filter(o=>o.isCorrect).length,1);assert.doesNotMatch(h.narrationVi,/Tài liệu lớp 2 nhấn mạnh|không biến mọi lời|Em không cần nhớ nhiều|Gié Triêng|\bCor\b/);}}
});
test('history teaches Hoang Dieu and Phan Chau Trinh with source-specific contributions',()=>{
 const s=byId('g3-station-2'),text=s.hotspots.map(h=>h.narrationVi).join(' ');
 assert.match(s.hotspots[0].titleVi,/Hoàng Diệu/);assert.doesNotMatch(s.hotspots[0].image,/huynh-thuc-khang/);
 for(const term of ['1828','Gò Nổi','25 tháng 4 năm 1882','Tây Hồ','1904','Trần Quý Cáp','chữ Quốc ngữ','Hải Châu'])assert.ok(text.includes(term),term);
 assert.deepEqual(s.rewards.map(r=>r.id),['rw-dn3-1','rw-dn3-2','rw-dn3-3']);assert.equal(s.stamp.id,'stamp-danh-nhan-lop3');assert.equal(s.journeyMap?.id,'map-g3-danh-nhan');
});
test('distinctive textbook knowledge is present in the other four topics',()=>{
 const checks:Record<string,string[]>={
 'g3-station-3':['Kinh, Cơ Tu, Co, Giẻ Triêng, Xơ Đăng và Hoa','Tung tung – da dá','gỗ cây chò','4 đến 9','đỏ, xanh lam, đen, trắng và vàng','chim chèo bẻo'],
 'g3-station-1':['phường Sơn Trà','xã đảo Tam Hải','đá đen','rêu xanh','chòi canh','phao cứu sinh','cờ báo hiệu'],
 'g3-station-4':['cửa sông Cu Đê','phường Hải Vân','2019','cá cơm than','12 đến 18 tháng','Bước bốn','ủ tiếp'],
 'g3-station-5':['Thăng An','Nam Phước','phường Sơn Trà','nẹp chặt vành','ép vành','dầu rái','3 đến 4 ngày','du lịch']};
 for(const [id,terms] of Object.entries(checks)){const text=byId(id).hotspots.map(h=>h.narrationVi).join(' ');for(const term of terms)assert.ok(text.includes(term),id+': '+term);}
});
test('previous shipped content upgrades without losing resources or mutating saved data',()=>{
 for(const s of GRADE_3_STATIONS){const old=GRADE3_TEXTBOOK_PREVIOUS_CONTENT.find(x=>x.id===s.id)!;
 const content={contentRevision:'3.1.1-grade3-photo-sources',coverImage:`/learning/grade3/${s.id}-cover.svg`,mapImage:s.journeyMap!.image!,resources:[{id:'r',title:'Học liệu riêng',url:'https://school.example/resource',kind:'document' as const}],hotspots:old.points.map((p,i)=>({...s.hotspots[i],titleVi:`${i+1}. ${p.title}`,narrationVi:p.narration,keyFactVi:p.fact,image:`/learning/grade3/${s.id}-point-${i+1}.svg`,interaction:{...s.hotspots[i].interaction!,questionVi:p.q}}))};
 const before=JSON.stringify(content),result=currentNarrationContent(currentGrade3Content(s,content));
 assert.deepEqual(result.hotspots,s.hotspots.map(h=>({...h,sources:result.hotspots.find(x=>x.id===h.id)!.sources})));
 assert.deepEqual(result.resources,content.resources);assert.equal(JSON.stringify(content),before);
 assert.equal(currentGrade3Content(s,result),result);
 }
});
test('teacher-authored text, custom media and questions survive the upgrade',()=>{
 const s=byId('g3-station-2');const content={contentRevision:'3.1.1-grade3-photo-sources',coverImage:'https://school.example/cover',mapImage:'https://school.example/map',resources:[],hotspots:s.hotspots.map(h=>({...h,narrationVi:'Lời dẫn riêng của giáo viên',image:'https://school.example/image',interaction:{...h.interaction!,questionVi:'Câu hỏi riêng'}}))};
 const before=JSON.stringify(content),result=currentGrade3Content(s,content);assert.deepEqual(result.hotspots,content.hotspots);assert.equal(result.coverImage,content.coverImage);assert.equal(result.mapImage,content.mapImage);assert.equal(JSON.stringify(content),before);
});
test('local learning media are available and schematic assets are explicitly labelled',()=>{
 for(const s of GRADE_3_STATIONS)for(const src of [s.coverImage,s.journeyMap!.image!,...s.hotspots.map(h=>h.image)]){assert.ok(existsSync('public'+src),src);if(!grade3MediaBySrc(src)){const xml=readFileSync('public'+src,'utf8');assert.match(xml,/không phải ảnh tư liệu/);assert.doesNotMatch(xml,/<script|<image|foreignObject|onload|href=/);}}
 const integrity=JSON.parse(readFileSync('content-review/grade3-media-integrity.json','utf8'));
 for(const media of GRADE3_MEDIA){const bytes=readFileSync('public'+media.src),record=integrity.find((r:{id:string})=>r.id===media.id);assert.ok(record);assert.equal(createHash('sha256').update(bytes).digest('hex'),record.sha256);}
});
test('teacher topic decks inherit the revised titles and stage-one content',()=>{
 assert.equal(GRADE3_TOPIC_DECKS.length,5);for(const deck of GRADE3_TOPIC_DECKS){const station=byId(deck.recordId.replace('topic-',''));assert.equal(deck.title,station.titleVi);assert.equal(deck.slides.length,11);for(const h of station.hotspots){const slide=deck.slides.find(s=>s.title===h.titleVi)!;assert.ok(slide);assert.ok(slide.points.includes(h.narrationVi));assert.equal(slide.question,h.interaction!.questionVi);}}
});
