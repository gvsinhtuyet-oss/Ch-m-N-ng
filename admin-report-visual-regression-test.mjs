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
  assert.match(report,/showOctoberPeriod\?daysFromOctober:30/);
  assert.match(report,/Từ 01\/10\/2026 đến nay/);
  assert.match(report,/monthlyVisits = new Map/);
  assert.match(report,/So sánh lượt truy cập theo tháng/);
  assert.match(report,/monthlyVisits\.entries\(\)/);
  assert.match(report,/Dữ liệu được tổng hợp từ hoạt động đã ghi nhận trên máy chủ/);
  assert.match(report,/Chưa kết nối được báo cáo hiệu quả/);
  assert.doesNotMatch(report,/bg-amber-50 p-3 text-sm text-amber-900/,'Technical errors must not dominate the report');
  assert.doesNotMatch(report,/300 lượt|100 lượt|dữ liệu minh họa|dữ liệu mô phỏng/i);
});

test('Admin stars draw only from server ratings and show unavailable state',()=>{
  const inbox=source('src/features/admin/ProposalInbox.tsx');
  assert.match(inbox,/authService\.stationRatingsReport\(\)/);
  assert.match(inbox,/ratingsError/);
  assert.match(inbox,/ratingsStatus===404/);
  assert.match(inbox,/Thống kê sao đang chờ đồng bộ/);
  assert.match(inbox,/Tải lại thống kê/);
  assert.match(inbox,/Chi tiết trạng thái dữ liệu dành cho quản trị/);
  assert.match(inbox,/Không coi dữ liệu chưa truy xuất được là 0 đánh giá/);
  assert.doesNotMatch(inbox,/bg-rose-50 p-3 text-sm text-rose-800/,'No conspicuous red banner for a missing ratings API');
  assert.doesNotMatch(inbox,/API thống kê sao chưa có trên máy chủ đang chạy/,'Technical incident must not dominate dashboard');
  assert.match(inbox,/aria-label="Đánh giá theo 25 bài học"/);
  assert.match(inbox,/Đánh giá cả bài · 1 đến 5 sao/);
  assert.match(inbox,/const \[stationId,setStationId\]=useState\(initialStationId \?\? ''\)/);
  assert.match(inbox,/initialStationId!==undefined\)\{setStationId\(initialStationId\);setGrade\(0\);\}/);
  assert.doesNotMatch(inbox,/Math\.random\(/);
  assert.match(inbox,/Đánh giá theo 5 khối lớp/);
  assert.match(inbox,/gradeSummaries=\[1,2,3,4,5\]/);
  assert.match(inbox,/highestGradeTotal/);
  assert.doesNotMatch(inbox,/300 lượt|100 lượt|dữ liệu minh họa|dữ liệu mô phỏng/i);
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

test('Admin overview presents source failures without red technical alerts or false numbers',()=>{
  const dashboard=source('src/features/admin/AdminDashboard.tsx');
  assert.match(dashboard,/Một số báo cáo chưa được đồng bộ/);
  assert.match(dashboard,/Chi tiết kết nối dành cho quản trị/);
  assert.match(dashboard,/Biểu đồ sử dụng và hiệu quả/);
  assert.match(dashboard,/Xem đánh giá sao và góp ý/);
  assert.doesNotMatch(dashboard,/role="alert" className="bg-rose-50/);
  assert.doesNotMatch(dashboard,/Math\.random\(/);
});
