import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const router = read('./src/components/station/Stage2Challenge.tsx');
const stationView = read('./src/features/stations/StationView.tsx');
const sharedCss = read('./src/games/stage2/mobile-portrait.css');
const frameCss = read('./src/games/stage2/frame-portrait.css');
const frameHook = read('./src/games/stage2/usePortraitStage2Frame.ts');
const myKhe = read('./src/components/station/MyKheBanThanV12.tsx');
const hoangDieu = read('./src/components/station/HoangDieuPhanChauTrinhV18.tsx');

test('25 stations have an explicit Stage 2 renderer without losing the two approved HTML games', async () => {
  const { ALL_25_STATIONS } = await import('./src/data/allStations.ts');
  const { grade1SharedConfigs } = await import('./src/games/stage2/grade1/index.ts');
  const { grade2SharedConfigs } = await import('./src/games/stage2/grade2/index.ts');
  const { grade3SharedConfigs } = await import('./src/games/stage2/grade3/index.ts');
  const { grade45SharedConfigs } = await import('./src/games/stage2/grade45/index.ts');
  const actual = new Set([
    ...Object.keys(grade1SharedConfigs),
    ...Object.keys(grade2SharedConfigs),
    ...Object.keys(grade3SharedConfigs),
    ...Object.keys(grade45SharedConfigs),
    'g3-station-1',
    'g3-station-2',
  ]);
  const expected = new Set(ALL_25_STATIONS.map(station => station.id));
  assert.equal(expected.size, 25, '25 distinct stations are required');
  assert.deepEqual([...actual].sort(), [...expected].sort(), 'Every station must have an approved game');
  assert.match(router, /<MyKheBanThanV12/);
  assert.match(router, /<HoangDieuPhanChauTrinhV18/);
  assert.match(router, /<SharedStage2/);
});

test('Stage 2 removes only its redundant phone title, retaining Stage 1 title', () => {
  assert.match(stationView, /currentStage === 1 && <p className="station-phone-stage-name"/);
  assert.doesNotMatch(stationView, /currentStage < 3 && <p className="station-phone-stage-name"/);
});

test('React games use the original working HUD above image and panel on a portrait phone', () => {
  assert.match(sharedCss, /\.shell::before\s*\{[\s\S]*?order:2!important/);
  assert.match(sharedCss, /\.hud\s*\{\s*order:1!important/);
  assert.match(sharedCss, /\.panel\s*\{\s*order:3!important/);
  assert.match(sharedCss, /background:transparent!important;box-shadow:none!important/);
  assert.match(sharedCss, /music-toggle[\s\S]*?min-width:44px!important/);
});

test('Both approved HTML games use the same phone layout without replacing their game logic', () => {
  assert.match(frameCss, /\.shell::before\s*\{[\s\S]*?order:2!important/);
  assert.match(frameCss, /\.shell > \.hud\s*\{[\s\S]*?order:1!important/);
  assert.match(frameCss, /\.shell > \.panel\s*\{[\s\S]*?order:3!important/);
  assert.match(frameCss, /background:var\(--game-artwork\) center top \/ contain no-repeat!important/);
  assert.match(frameCss, /data-stage2-artwork-missing/);
  assert.match(frameHook, /style\.textContent = embeddedPortraitCss \+ framePortraitCss/);
  assert.match(frameHook, /observer\.observe\(scene\)/);
  assert.match(myKhe, /grade3-my-khe-ban-than\/v12\/index\.html/);
  assert.match(hoangDieu, /grade3-hoang-dieu-phan-chau-trinh\/v18\/index\.html/);
  assert.match(myKhe, /progressService\.completeStage2/);
  assert.match(hoangDieu, /progressService\.completeStage2/);
  assert.match(myKhe, /onCompleteStage/);
  assert.match(hoangDieu, /onCompleteStage/);
});

test('Wordwall has no active Stage 2 embed or reward flow', () => {
  assert.doesNotMatch(router, /wordwall|externalGameOpened|embedUrl/i);
  assert.doesNotMatch(read('./src/data/canonicalHoiAn.ts'), /wordwall/i);
  assert.doesNotMatch(read('./src/types/index.ts'), /wordwall/i);
});
