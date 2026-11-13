import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ALL_25_STATIONS} from './src/data/allStations';
import {reviewGddpTextbookAddress} from './gddp-textbook-review.mjs';
import {
  DEFAULT_SCHOOL,DEFAULT_BOOK,DEFAULT_YEAR,textbookSuggestions,
  makeEmptyWorkspace,withWorkspaceDefaults,availableSuggestions,lessonResources,makePrivateRecord,
} from './src/features/teacher/TeacherIntegrationPlanner';

test('Teacher real and free-demo share the required defaults without mutating old plans',()=>{
  assert.equal(makeEmptyWorkspace(2).school,'Trường Tiểu học Trần Đại Nghĩa');
  assert.equal(makeEmptyWorkspace(2).book,'Kết nối tri thức với cuộc sống');
  assert.equal(makeEmptyWorkspace(2).year,'2026-2027');
  assert.equal(DEFAULT_SCHOOL,makeEmptyWorkspace(5).school);
  assert.equal(DEFAULT_BOOK,makeEmptyWorkspace(5).book);
  assert.equal(DEFAULT_YEAR,makeEmptyWorkspace(1).year);
  const old={school:'',book:'',year:'2026-2027',grade:2,records:[]};
  const normalized=withWorkspaceDefaults(old,2);
  assert.equal(normalized.school,DEFAULT_SCHOOL);
  assert.equal(normalized.book,DEFAULT_BOOK);
  assert.equal(old.school,'','normalizing cannot write back to an existing teacher account');
  assert.equal(old.book,'');
  const saved={...old,school:'Trường B',book:'Bộ sách khác',records:[{id:'private-1',grade:2,subject:'TNXH',lesson:'Lịch sử',week:'8',activity:'',content:'Tự viết',integrationType:'Liên hệ',resourceLinks:[]}]};
  const copy=withWorkspaceDefaults(saved,2);
  assert.equal(copy.school,'Trường B','never overwrite entered school');
  assert.equal(copy.book,'Bộ sách khác','never overwrite a saved book without teacher approval');
  assert.equal(copy.records[0].content,'Tự viết','never replace old custom records');
});

test('Suggestions cover textbook-matched titles only, with grade/subject/search filters',()=>{
  assert.ok(textbookSuggestions.length>=12);
  for(const row of textbookSuggestions){
    assert.equal(reviewGddpTextbookAddress(row).status,'title_checked',row.id+' unsupported or mismatched book');
    assert.ok(row.grade>=1&&row.grade<=5);
  }
  for(const grade of [1,2,3,4,5])assert.ok(availableSuggestions(grade,'','').length>0,'No options grade '+grade);
  const grade2=availableSuggestions(2,'','');
  const first=grade2[0];
  assert.ok(availableSuggestions(2,first.subject,first.lesson).some(x=>x.id===first.id));
  assert.ok(availableSuggestions(2,first.subject,'TỪ KHÔNG TỒN TẠI 8XZXZX').length===0);
  assert.ok(availableSuggestions(2,'Môn học chưa có','').length===0);
  assert.ok(!textbookSuggestions.some(x=>x.id==='gddp-2026-2-05'),'Other textbook entry cannot be suggested');
});

test('Suggested lessons link only to fully present same-grade hotspots, never all 25 stations',()=>{
  const entries=textbookSuggestions.filter(x=>Array.isArray(x.resourceLinks)&&x.resourceLinks.length>0);
  assert.ok(entries.length>0);
  for(const row of entries){
    const matches=lessonResources(row,ALL_25_STATIONS);
    assert.ok(matches.length<=8);
    const privateRow=makePrivateRecord(row,ALL_25_STATIONS,'private-safe-1');
    assert.equal(privateRow.id,'private-safe-1');
    assert.equal(privateRow.grade,row.grade);
    assert.equal(privateRow.lesson,row.lesson);
    assert.equal(privateRow.outcomes,row.outcomes||'');
    for(const link of privateRow.resourceLinks||[]){
      assert.ok(row.resourceLinks?.some(x=>x.stationId===link.stationId&&x.hotspotId===link.hotspotId));
      const station=ALL_25_STATIONS.find(x=>x.id===link.stationId);
      assert.ok(station&&station.grade===row.grade);
      assert.ok(station.hotspots.some(h=>h.id===link.hotspotId));
    }
  }
});

test('Real account save requires explicit click, demo has no API request, imported rows preview first',()=>{
  const source=readFileSync('src/features/teacher/TeacherWorkspace.tsx','utf8');
  assert.match(source,/const demo=uid==='teacher-demo'/);
  assert.match(source,/if\(!demo\)\{\s*workspaceRequest\(\)/);
  assert.match(source,/await workspaceRequest\('PUT',plan\)/);
  assert.match(source,/if\(synced\)/);
  assert.match(source,/if\(remote\?\.records\?\.length && !window\.confirm/);
  assert.match(source,/localStorage\.setItem\(ownKey\(uid\)/);
  assert.match(source,/if\(uid==='teacher-demo'\)/);
  assert.match(source,/setPendingImport\(\{name:file\.name,records\}\)/);
  assert.match(source,/Dùng bảng đã xem/);
  assert.match(source,/onOpenStudentStage1=\{station=>openStation\(station,1\)\}/);
  assert.match(source,/Tải Excel/);
  assert.match(source,/Tải Word/);
  assert.match(source,/DEFAULT_BOOK/);
  assert.match(source,/Chỉ đồng bộ khi chủ động bấm lưu/);
  assert.doesNotMatch(source,/setInterval|onBlur=.*workspaceRequest|auto.*submitProposal/i);
});
