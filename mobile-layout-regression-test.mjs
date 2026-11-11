
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = path => readFileSync(new URL(path,import.meta.url),'utf8');
const index=read('./src/index.css'),cover=read('./src/features/landing/landing-cover.css');
const stage1=read('./src/features/stations/station-stage1-compact.css');
const stage2=read('./src/games/stage2/mobile-portrait.css');
const shared=read('./src/games/stage2/SharedChallengeGame.tsx');
const journey=read('./src/components/station/journey-stages.css');
const st3=read('./src/components/station/Stage3CheckIn.tsx'),st4=read('./src/components/station/Stage4Stamp.tsx');
const landing=read('./src/features/landing/LandingView.tsx');

test('phone shell and four-stage toolbar use natural flow and a two-row tab grid',()=>{
 assert.match(index,/station-screen-fixed.*?height:auto!important/s);
 assert.match(index,/grid-template-columns:44px minmax\(0,1fr\) 44px 44px!important/);
 assert.match(index,/station-stage-tabs[\s\S]*?grid-row:2!important/);
 assert.match(index,/station-stage-tab-name[\s\S]*?overflow-wrap:anywhere!important/);
});
test('portrait destination selection snaps vertically one station at a time',()=>{
 const phone=index.slice(index.lastIndexOf('@media (max-width: 640px) and (orientation: portrait)'));
 assert.match(phone,/scroll-snap-type: y mandatory/);
 assert.match(phone,/grid-template-columns: minmax\(0, 1fr\) !important/);
 assert.match(phone,/min-height: var\(--station-page-height\) !important/);
 assert.match(phone,/scroll-snap-stop: always/);
 assert.match(phone,/journey-extension .*scroll-snap-align: start/);
 assert.match(read('./src/features/landing/AccessPortal.tsx'),/cham-access-grade-grid/);
});
test('cover keeps 2-row identity, fixed 16:9 video and accessible buttons',()=>{
 assert.match(cover,/landing-cover-title\s*\{[\s\S]*?flex-direction:column!important/);
 assert.match(cover,/landing-cover-player iframe\{display:block!important/);
 assert.match(cover,/min-width:44px!important;min-height:44px!important/);
});
test('Stage 1 portrait has natural one-column learning content and readable controls',()=>{
 assert.match(stage1,/stage-one-map-content>\.grid[\s\S]*?flex-direction:column!important/);
 assert.match(stage1,/stage1-reading>p\{font-size:16px!important/);
 assert.match(stage1,/stage-one-hotspot-ribbon>\.grid\{display:grid!important;grid-template-columns:repeat\(2/);
});
test('Stage 2 portrait CSS is loaded after existing styles in isolated ShadowRoot',()=>{
 assert.match(shared,/import mobilePortraitCss from '\.\/mobile-portrait\.css\?raw'/);
 assert.match(shared,/victorySideFillCss\+'\\n'\+mobilePortraitCss/);
 assert.match(stage2,/scene\.is-victory[\s\S]*?background-size:100% auto!important/);
 assert.match(stage2,/scene\.is-victory \.victory-buttons[\s\S]*?position:static!important/);
});
test('Stage 3 keeps emotion, memory, action and persistence while Stage 4 shows and zooms genuine station map',()=>{
 assert.match(st3,/progressService\.completeStage3/);
 assert.match(st3,/selectedRememberIds\.length/);
 assert.match(st3,/selectedActionIds\.length/);
 assert.match(st4,/actualMapImage = station\.journeyMap\?\.image \|\| station\.coverImage/);
 assert.match(st4,/mobile-map-zoom-trigger/);
 assert.match(st4,/mapZoomScale \* 100/);
 assert.match(st4,/finalizeJourneyAndStamp/);
 assert.match(st4,/JourneyRating/);
 assert.match(journey,/station-viewport\[data-stage="3"\][\s\S]*?checkin-pages/);
 assert.match(journey,/station-viewport\[data-stage="4"\][\s\S]*?journey-photo-main/);
});

test('mobile shared header keeps brand, audio, assistant and account accessible',()=>{
 const header=read('./src/components/common/Header.tsx');
 const audio=read('./src/components/common/MusicControl.tsx');
 assert.match(header,/header-brand-title[^>]*>CHẠM ĐÀ NẴNG/);
 assert.match(header,/header-brand-copy block min-w-0/);
 assert.doesNotMatch(header,/header-language-toggle|toggleLanguage|Đổi ngôn ngữ|Ngôn ngữ ·/);
 assert.match(read('./src/contexts/AppContext.tsx'),/const toggleLanguage =/); // Keep language infrastructure for future fully reviewed bilingual mode.
 assert.match(header,/header-audio-control/);
 assert.match(header,/header-touch-assistant[^>]*aria-label="Mở Trợ lý khám phá Đà Nẵng"/);
 assert.match(header,/header-account-toggle/);
 assert.match(index,/@media \(max-width: 767px\)\s*\{/);
 assert.match(index,/\.app-touch-header \.header-brand-copy\s*\{\s*display: block !important/);
 assert.match(index,/\.app-touch-header \.header-touch-assistant\s*\{\s*display: inline-flex/);
 assert.match(index,/\.app-touch-header \.header-account-toggle[\s\S]*?min-height: 44px !important/);
 assert.match(index,/@media \(max-width: 360px\)[\s\S]*?\.header-assistant-label \{ display: none; \}/);
 assert.match(audio,/header-audio-popover/);
 assert.match(index,/\.app-touch-header \.header-audio-popover[\s\S]*?width: min\(360px, calc\(100vw - 24px\)\)/);
 assert.doesNotMatch(index, /@media\(max-width:839px\)\{\.app-touch-header>div>button>span:nth-child\(2\)\{display:none\}\}/);
});

test('all role/student/teacher screens use one responsive real UI, high-res approved art and a live QR scanner',()=>{
 const portal=read('./src/features/landing/AccessPortal.tsx');
 const responsive=read('./src/features/landing/ResponsiveAccessPortal.tsx');
 const css=read('./src/features/landing/access-portal.css');
 assert.match(landing,/showRolePicker && <ResponsiveAccessPortal/);
 assert.match(responsive,/ResponsiveAccessPortal = AccessPortal/);
 assert.doesNotMatch(responsive,/approved-mobile-stage|approved-hotspot/);
 assert.match(landing,/landing-cover-title/);
 assert.doesNotMatch(portal,/<Wordmark/);
 assert.match(portal,/approved-clean\/student-card\.webp/);
 assert.match(portal,/approved-clean\/student-banner\.webp/);
 assert.match(portal,/approved-clean\/teacher-card\.webp/);
 assert.match(portal,/approved-clean\/teacher-banner\.webp/);
 assert.match(portal,/cham-access-role-card student/);
 assert.match(portal,/cham-access-role-card teacher/);
 assert.match(portal,/GoogleTeacherLogin onLogin=\{onGoogleLogin\}/);
 assert.match(portal,/onSubmit=\{onStaffLogin\}/);
 assert.match(portal,/onStudentGrade\(grade\)/);
 assert.match(portal,/onStudentSubmit/);
 assert.match(portal,/onTeacherDemo/);
 assert.match(portal,/StudentQrScanner/);
 assert.match(portal,/onScanCode/);
 assert.match(portal,/cham-access-qr-button/);
 assert.match(portal,/Giáo viên tự do/);
 assert.match(portal,/Khám phá tự do/);
 assert.match(landing,/onScanCode=/);
 assert.match(css,/@media\(max-width:767px\)/);
 assert.match(css,/100dvh/);
 assert.match(css,/min-height:44px/);
 assert.match(read('./src/features/landing/StudentQrScanner.tsx'),/getUserMedia/);
 assert.match(read('./src/features/landing/StudentQrScanner.tsx'),/Tải ảnh QR/);
 assert.match(read('./src/features/landing/studentQr.ts'),/extractStudentCodeFromQr/);
});
