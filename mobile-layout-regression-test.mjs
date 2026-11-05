
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
 assert.match(landing,/grid-cols-2 gap-3 sm:grid-cols-5/);
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
