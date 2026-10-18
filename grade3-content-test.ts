import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {GRADE_3_STATIONS,GRADE3_CONTENT_REVISION} from './src/data/grade3Stations';
import {GRADE3_TOPIC_DECKS} from './src/data/teacher/grade3TopicDecks';
import {getStationsForGrade} from './src/data/allStations';
import {DEMO_STATION_IDS} from './src/data/demoStations';
import {currentGrade3Content} from './src/services/Grade3ContentPolicy';
import {contentService} from './src/services/ContentService';
import {getGddpLessonDeck} from './src/services/GddpLessonDeckService';

test('all five grade3 topics open in outline order with stable identities and review state',()=>{
 const stations=getStationsForGrade(3);assert.deepEqual(stations.map(s=>s.id),[1,2,3,4,5].map(i=>'g3-station-'+i));assert.deepEqual(stations.map(s=>s.number),[1,2,3,4,5]);for(const s of stations){assert.ok(DEMO_STATION_IDS.has(s.id));assert.equal(s.version.version,GRADE3_CONTENT_REVISION);assert.equal(s.version.status,'IN_REVIEW');assert.equal(s.isFullyVerified,false);assert.match(s.officialCurriculumReference,/dự thảo/);}
});
test('20 exploration points,25 independent applied challenges and complete reflection/passport',()=>{
 for(const s of GRADE_3_STATIONS){assert.equal(s.hotspots.length,4);assert.equal(s.challenge.questions?.length,5);assert.equal(s.challenge.passingScore,5);assert.equal(s.challenge.externalGame,undefined);const questions=new Set(s.hotspots.map(h=>h.interaction!.questionVi));
 for(const h of s.hotspots){assert.equal(h.stationId,s.id);assert.ok(h.narrationVi.length>150);assert.ok(h.sources!.length>1);assert.equal(h.interaction!.options.filter(o=>o.isCorrect).length,1);assert.doesNotMatch(h.narrationVi,/Ban biên soạn cập nhật|đang được hoàn thiện/);}
 const positions=new Set<number>();for(const q of s.challenge.questions!){assert.ok(!questions.has(q.questionVi));questions.add(q.questionVi);assert.equal(q.options.filter(o=>o.isCorrect).length,1);positions.add(q.options.findIndex(o=>o.isCorrect));assert.ok(q.hintVi);assert.doesNotMatch(q.questionVi,/bao nhiêu tiết|thuộc chủ đề trọng tâm/);}assert.equal(questions.size,9);assert.equal(positions.size,3);assert.equal(s.checkIn.actionOptions.length,3);assert.equal(s.checkIn.rememberOptions?.length,3);assert.equal(s.journeyMap?.summaryNodes.length,4);assert.equal(s.rewards.length,3);}
});
test('30 local assets exist, XML is static and labelled as schematic',()=>{
 const paths=GRADE_3_STATIONS.flatMap(s=>[s.coverImage,s.journeyMap!.image!,...s.hotspots.map(h=>h.image)]);assert.equal(new Set(paths).size,30);for(const p of paths){assert.match(p,/^\/learning\/grade3\/[a-z0-9-]+\.svg$/);assert.ok(existsSync('public'+p));const xml=readFileSync('public'+p,'utf8');assert.match(xml,/không phải ảnh tư liệu/);assert.doesNotMatch(xml,/<script|<image|foreignObject|onload|href=/);}
});
test('source conflicts and scope limitations remain visible; no invented mapping or portrait',()=>{
 const history=GRADE_3_STATIONS[1].hotspots.map(h=>h.narrationVi).join(' ');assert.match(history,/Tiếng Dân/);assert.match(history,/Trần Quý Cáp/);assert.doesNotMatch(history,/Phan Bội Châu/);
 const craft=GRADE_3_STATIONS[4].hotspots.map(h=>h.narrationVi).join(' ');assert.match(craft,/Hội An.*tham khảo chung/);assert.match(craft,/không phải.*quy trình riêng/);
 assert.match(GRADE3_TOPIC_DECKS[1].reviewNotes.join(' '),/Hoàng Diệu/);assert.match(GRADE3_TOPIC_DECKS[4].reviewNotes.join(' '),/Chờ tư liệu chuyên đề Sơn Trà/);
 for(const d of GRADE3_TOPIC_DECKS){assert.equal(d.mappingReview?.currentYearConfirmed,false);assert.equal(d.sourceRecord.week,'Chưa gắn kế hoạch');assert.equal(getGddpLessonDeck(d.sourceRecord),null);}
});
test('55 reusable slides have independent teacher answers, notes and accurate grade context',()=>{
 assert.equal(GRADE3_TOPIC_DECKS.length,5);for(const d of GRADE3_TOPIC_DECKS){assert.equal(d.slides.length,11);assert.equal(d.sourceRecord.grade,3);assert.ok(d.sources.length>=2);for(const slide of d.slides){assert.ok(slide.points.length);assert.ok(slide.question);assert.ok(slide.answer);assert.ok(slide.teacherNotes);for(const image of slide.images||[])assert.ok(existsSync('public'+image.src));}}
});
test('legacy saved content cannot override revised knowledge and no stored payload is mutated',()=>{
 const s=structuredClone(GRADE_3_STATIONS[1]);const old={coverImage:'https://old.example/portrait',mapImage:'https://old.example/map',hotspots:[{...s.hotspots[0],narrationVi:'Nội dung cũ'}],resources:[{id:'r',title:'Tài liệu cô đã lưu',url:'https://example.org',kind:'document' as const}]};const snapshot=JSON.stringify(old);const result=currentGrade3Content(s,old);assert.equal(result.hotspots.length,4);assert.equal(result.coverImage,s.coverImage);assert.deepEqual(result.resources,old.resources);assert.equal(JSON.stringify(old),snapshot);const edited={...result,hotspots:[{...result.hotspots[0],narrationVi:'Đã chỉnh và duyệt'},...result.hotspots.slice(1)]};assert.equal(currentGrade3Content(s,edited),edited);assert.equal(currentGrade3Content({...s,grade:2},old),old);
});
test('built-in content, revision policy and topic presentations need zero network or Firestore calls',()=>{
 const original=globalThis.fetch;let calls=0;globalThis.fetch=(()=>{calls++;throw Error('network prohibited')}) as typeof fetch;
 try{for(const s of GRADE_3_STATIONS){assert.equal(contentService.get(s).hotspots.length,4);contentService.apply(s);}assert.equal(GRADE3_TOPIC_DECKS.flatMap(d=>d.slides).length,55);assert.equal(calls,0);}finally{globalThis.fetch=original;}
});
test('past history rewards and progress identifiers preserved',()=>{const s=GRADE_3_STATIONS[1];assert.deepEqual(s.hotspots.map(h=>h.id),['dn3-huynh-thuc-khang','dn3-phan-chau-trinh','dn3-phong-trao-duy-tan','dn3-dau-chan-hom-nay']);assert.deepEqual(s.rewards.map(r=>r.id),['rw-dn3-1','rw-dn3-2','rw-dn3-3']);assert.equal(s.stamp.id,'stamp-danh-nhan-lop3');assert.equal(s.journeyMap?.id,'map-g3-danh-nhan');});

test('grade-3 review uses its own nature badge and retains primary evidence for all five topics',()=>{
 assert.equal(GRADE_3_STATIONS[0].rewards[2].template,'nature_leaf');
 assert.equal(GRADE_3_STATIONS[1].rewards[2].template,'guardian_star');
 assert.ok(GRADE_3_STATIONS[1].hotspots[2].sources?.some(s=>s.includes('chu-quoc-ngu')));
 assert.ok(GRADE_3_STATIONS[2].hotspots[0].sources?.some(s=>s.includes('tratan.danang.gov.vn')));
 assert.ok(GRADE_3_STATIONS[3].hotspots[0].sources?.some(s=>s.includes('dbc.danang.gov.vn')));
 assert.doesNotMatch(GRADE_3_STATIONS[1].hotspots[3].narrationVi,/Đề cương cô cung cấp/);
});

test('minor source review preserves previous reviewed teacher narration, media and resources without mutating the record',()=>{
 const s=GRADE_3_STATIONS[1];const edited={contentRevision:'3.0.0-grade3-source',coverImage:'https://school.example/cover.jpg',mapImage:'https://school.example/map.svg',hotspots:s.hotspots.map((h,i)=>i?{...h}:{...h,narrationVi:'Lời thuyết minh giáo viên đã duyệt',image:'https://school.example/photo.jpg'}),resources:[]};const before=JSON.stringify(edited);const updated=currentGrade3Content(s,edited);assert.equal(updated.hotspots[0].narrationVi,edited.hotspots[0].narrationVi);assert.equal(updated.hotspots[0].image,edited.hotspots[0].image);assert.equal(updated.coverImage,edited.coverImage);assert.equal(updated.mapImage,edited.mapImage);assert.equal(JSON.stringify(edited),before);assert.equal(updated.contentRevision,GRADE3_CONTENT_REVISION);
});
