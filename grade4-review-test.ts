import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {GRADE_45_STATIONS,GRADE4_CONTENT_REVISION} from './src/data/grade45Stations';
import {GRADE4_PREVIOUS_POINTS} from './src/data/grade4PreviousContent';
import {GRADE4_PHOTO_REFERENCES} from './src/data/grade4PhotoReferences';
import {GRADE3_MEDIA} from './src/data/grade3Media';
import {GRADE45_MEDIA} from './src/data/grade45Media';
import {LearningMediaCredit} from './src/components/LearningMediaCredit';
import {currentGrade45Content} from './src/services/Grade45ContentPolicy';
const stations=GRADE_45_STATIONS.filter(s=>s.grade===4);
test('grade4 has twenty reviewed narratives, eight local photo placements, twelve selected source references',()=>{
 let photos=0,refs=0;
 for(const s of stations){assert.equal(s.version.version,GRADE4_CONTENT_REVISION);for(const h of s.hotspots){assert.notEqual(h.narrationVi,GRADE4_PREVIOUS_POINTS[h.id].narrationVi);assert.ok(existsSync('public'+h.image));const html=renderToStaticMarkup(React.createElement(LearningMediaCredit,{src:h.image,credit:h.mediaCredit}));
 if(h.image.endsWith('.webp')){photos++;const media=[...GRADE3_MEDIA,...GRADE45_MEDIA].find(m=>m.src===h.image)!;assert.ok(media);assert.ok(html.includes(media.licenseUrl));assert.ok(html.includes(media.sourceUrl));assert.ok(html.includes(media.author));}else{refs++;const ref=GRADE4_PHOTO_REFERENCES.find(r=>r.localSrc===h.image)!;assert.ok(ref);assert.ok(html.includes(ref.sourceUrl));assert.ok(html.includes(ref.scope));assert.equal(ref.rights,'LINK_ONLY_PENDING_PERMISSION');assert.ok(!html.includes('<img'));}
 assert.ok(!h.image.endsWith('museum-old.webp'));assert.ok(!h.image.endsWith('port.webp'));}}
 assert.equal(photos,8);assert.equal(refs,12);assert.equal(GRADE4_PHOTO_REFERENCES.length,12);assert.deepEqual(JSON.parse(readFileSync('content-review/grade4-photo-references.json','utf8')),GRADE4_PHOTO_REFERENCES);
});
test('old shipped fields update while teacher images, narration, questions and resources survive without mutations',()=>{
 for(const s of stations){const old={contentRevision:'3.0.0-grade45-source',coverImage:s.coverImage,mapImage:s.journeyMap!.image!,resources:[{id:'teacher',kind:'document' as const,title:'Tài liệu riêng',url:'https://example.org/doc'}],hotspots:s.hotspots.map(h=>{const b=GRADE4_PREVIOUS_POINTS[h.id];return {...h,image:b.image,narrationVi:b.narrationVi,interaction:{...h.interaction!,questionVi:b.questionVi,options:b.answers.map((textVi,i)=>({id:'opt-'+i,textVi,isCorrect:i===0}))}}})};
 const snapshot=JSON.stringify(old),updated=currentGrade45Content(s,old);assert.equal(JSON.stringify(old),snapshot);assert.equal(updated.contentRevision,GRADE4_CONTENT_REVISION);assert.equal(updated.resources,old.resources);assert.deepEqual(updated.hotspots.map(h=>h.image),s.hotspots.map(h=>h.image));assert.deepEqual(updated.hotspots.map(h=>h.narrationVi),s.hotspots.map(h=>h.narrationVi));assert.equal(currentGrade45Content(s,updated),updated);
 const custom=structuredClone(old);custom.coverImage='https://example.org/teacher-cover';custom.mapImage='https://example.org/teacher-map';custom.hotspots[0].image='https://example.org/teacher-photo';custom.hotspots[0].narrationVi='Lời giảng giáo viên tự soạn';custom.hotspots[0].interaction!.questionVi='Câu hỏi riêng';const preserved=currentGrade45Content(s,custom);assert.equal(preserved.coverImage,custom.coverImage);assert.equal(preserved.mapImage,custom.mapImage);assert.equal(preserved.hotspots[0].image,custom.hotspots[0].image);assert.equal(preserved.hotspots[0].narrationVi,custom.hotspots[0].narrationVi);assert.equal(preserved.hotspots[0].interaction,custom.hotspots[0].interaction);}
});
test('local examples and unresolved source claims remain explicit; stage2 uses different tasks from stage1',()=>{
 const text=(id:number)=>stations[id-1].hotspots.map(h=>h.narrationVi).join(' ');
 assert.match(text(1),/Nam Ô/);assert.match(text(2),/42–44 Bạch Đằng và 31 Trần Phú/);assert.match(text(3),/Tiên Sa/);assert.match(text(3),/không khẳng định mọi công đoạn/);assert.match(text(4),/chưa chọn một tên tổ nghề/);assert.match(text(4),/không được coi là bản thu/);assert.match(text(5),/sợi dọc và sợi ngang/);
 for(const s of stations){const first=s.hotspots.map(h=>h.interaction!.questionVi);for(const q of s.challenge.questions!)assert.ok(!first.includes(q.questionVi));assert.equal(s.isFullyVerified,false);assert.equal(s.version.status,'IN_REVIEW');}
});
