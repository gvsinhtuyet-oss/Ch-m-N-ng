import test from 'node:test';
import assert from 'node:assert/strict';
import { GRADE_2_STATIONS } from './src/data/grade2Stations';

test('grade 2 has five current-book stations', () => {
  assert.equal(GRADE_2_STATIONS.length, 5);
});

test('every grade 2 hotspot has a distinct non-empty image within its station', () => {
  for (const station of GRADE_2_STATIONS) {
    assert.ok(station.coverImage);
    const images = station.hotspots.map(h => h.image?.trim());
    assert.ok(images.every(Boolean), station.titleVi);
    assert.equal(new Set(images).size, images.length, station.titleVi);
  }
});

test('Hoi An keeps six learning points', () => {
  const station = GRADE_2_STATIONS.find(s => s.id === 'g2-station-4');
  assert.ok(station);
  assert.equal(station.hotspots.length, 6);
});

test('all grade 2 stations cite the current teaching material', () => {
  for (const station of GRADE_2_STATIONS) {
    assert.match(station.officialCurriculumReference || '', /lop 2 dang su dung|lớp 2 đang sử dụng/i);
  }
});


test('all five grade 2 stations are unlocked for competition demo', async () => {
  const { DEMO_STATION_IDS } = await import('./src/data/demoStations');
  for (const station of GRADE_2_STATIONS) {
    assert.equal(DEMO_STATION_IDS.has(station.id), true, station.titleVi);
  }
});


test('Cu Lao Cham station follows current-book checkpoints', () => {
  const station = GRADE_2_STATIONS.find(s => s.id === 'g2-station-2');
  assert.ok(station);
  assert.equal(station.hotspots.length, 5);
  assert.match(station.hotspots[0].titleVi, /Hòn Lao/i);
  assert.match(station.hotspots[1].keyFactVi || '', /2009/i);
  assert.match(station.hotspots[2].narrationVi, /lặn ngắm san hô/i);
  assert.match(station.hotspots[3].narrationVi, /Voọc chà vá chân nâu/i);
  assert.match(station.hotspots[4].narrationVi, /bỏ rác đúng nơi/i);
  assert.equal(new Set(station.hotspots.map(h => h.image)).size, 5);
});
