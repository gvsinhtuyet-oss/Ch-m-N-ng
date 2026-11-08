import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source = path => readFileSync(path,'utf8');

test('Admin effectiveness charts use API response and never demo metrics',()=>{
  const report=source('src/features/admin/EffectivenessReport.tsx');
  assert.match(report,/fetchWithTimeout\('\/api\/effectiveness\?days='/);
  assert.match(report,/VisitTrendChart entries=\{\[\.\.\.visitsByDay\.entries\(\)\]\}/);
  assert.match(report,/StageProgressChart values=\{stageTotals\}/);
  assert.match(report,/Lượt truy cập theo ngày/);
  assert.match(report,/const stageTotals = \[/);
  assert.doesNotMatch(report,/Math\.random\(/,'Reports must not fabricate metrics');
});

test('Admin stars draw only from server ratings and show unavailable state',()=>{
  const inbox=source('src/features/admin/ProposalInbox.tsx');
  assert.match(inbox,/authService\.stationRatings\(\)/);
  assert.match(inbox,/ratingsError/);
  assert.match(inbox,/Biểu đồ sao của 25 trạm/);
  assert.match(inbox,/Đánh giá Chặng 4/);
  assert.match(inbox,/const \[stationId,setStationId\]=useState\(initialStationId \?\? ''\)/);
  assert.match(inbox,/initialStationId!==undefined\)setStationId\(initialStationId\)/);
  assert.doesNotMatch(inbox,/Math\.random\(/);
});

test('Admin header remains readable after programmatic focus navigation',()=>{
  const dashboard=source('src/features/admin/AdminDashboard.tsx');
  const css=source('src/index.css');
  assert.match(dashboard,/pageTitle\.current\?\.focus\(/);
  assert.match(css,/\.admin-page-hero h1:focus \{outline:none;box-shadow:none\}/);
});

test('Admin station editing warns before abandoning an unpublished change',()=>{
  const editor=source('src/features/admin/ContentEditor.tsx');
  const dashboard=source('src/features/admin/AdminDashboard.tsx');
  assert.match(editor,/hasUnsavedChanges/);
  assert.match(editor,/window\.confirm\('Nội dung trạm chưa lưu/);
  assert.match(editor,/e\.currentTarget\.value = stationId/);
  assert.match(editor,/beforeunload/);
  assert.match(editor,/onDirtyChange\?\.\(hasUnsavedChanges\)/);
  assert.match(dashboard,/window\.confirm\('Bạn có nội dung trạm chưa lưu/);
  assert.match(dashboard,/<ContentEditor onDirtyChange=\{setEditorDirty\} \/>/);
  assert.doesNotMatch(dashboard,/Xuất bản chuẩn/,'Never claim catalog entries published without server confirmation');
});

test('Admin overview never substitutes zeros for an unavailable source',()=>{
  const dashboard=source('src/features/admin/AdminDashboard.tsx');
  assert.match(dashboard,/Promise\.allSettled/);
  assert.match(dashboard,/Các chỉ số chưa xác minh hiển thị “—”/);
  assert.match(dashboard,/available\.implementations\?implementations\.length:'—'/);
  assert.match(dashboard,/available\.users\?counts\.teachers:'—'/);
});
