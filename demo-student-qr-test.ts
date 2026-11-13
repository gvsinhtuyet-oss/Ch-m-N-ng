import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makeDemoStudentQrUrl,parseDemoStudentQr} from './src/features/teacher/demoStudentQr';

test('Fictional classroom QR links round-trip and cannot impersonate real student credentials',()=>{
  const url=makeDemoStudentQrUrl('https://chamdanang-gddp.pages.dev',2,1,'2/24 (trải nghiệm)');
  assert.equal(url,'https://chamdanang-gddp.pages.dev/#demo-student=g2&n=1&c=2%2F24');
  assert.deepEqual(parseDemoStudentQr(new URL(url).hash),{grade:2,ordinal:1,className:'2/24'});
  assert.equal(parseDemoStudentQr('#student-code=ABCD1234EFGH'),null);
  for(const invalid of [
    '#demo-student=g0&n=1&c=2%2F24',
    '#demo-student=g2&n=101&c=2%2F24',
    '#demo-student=g2&n=0&c=2%2F24',
    '#demo-student=g2&n=1&c=3%2F24',
    '#demo-student=g2&n=1&c=2%2F24&x=evil',
    '#demo-student=g2&n=1&c=2%2F24&n=2',
  ])assert.equal(parseDemoStudentQr(invalid),null,invalid);
  assert.throws(()=>makeDemoStudentQrUrl('https://chamdanang-gddp.pages.dev',2,1,'2/24 Nguyễn A'));
  assert.throws(()=>makeDemoStudentQrUrl('http://evil.example',2,1,'2/24'));
});
test('Free classroom QR uses local-only guest and never calls credential restore or analytics API',()=>{
  const landing=readFileSync('src/features/landing/LandingView.tsx','utf8');
  const app=readFileSync('src/App.tsx','utf8');
  const service=readFileSync('src/services/EffectivenessService.ts','utf8');
  const demo=readFileSync('src/features/teacher/DemoStudentAccessCards.tsx','utf8');
  const real=readFileSync('src/features/teacher/StudentAccessCards.tsx','utf8');
  const dashboard=readFileSync('src/features/teacher/TeacherDashboard.tsx','utf8');
  assert.match(demo,/makeDemoStudentQrUrl/);
  assert.match(demo,/THẺ TRẢI NGHIỆM/);
  assert.match(demo,/Tải trọn bộ thẻ QR \(ZIP\)/);
  assert.doesNotMatch(demo,/authService|issueStudentCode|fetch\s*\(|studentSyncService/);
  assert.match(landing,/parseDemoStudentQr/);
  assert.match(landing,/effectivenessService\.setDemoMode\(true\)/);
  assert.match(landing,/isGuest:true/);
  assert.match(landing,/demo-qr-g/);
  assert.match(app,/effectivenessService\.setDemoMode\(fromDemoQr\)/);
  assert.match(service,/if \(demoOnly\(\) \|\| import\.meta\.env/);
  assert.match(service,/if\(demoOnly\(\)\)return stars\?\?0/);
  assert.match(real,/authService\.issueStudentCode/);
  assert.match(dashboard,/demoClassPanel/);
  assert.match(dashboard,/Lớp của tôi · Mã QR/);
});
