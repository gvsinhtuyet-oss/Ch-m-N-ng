import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { ALL_25_STATIONS } from './src/data/allStations';
import recordings from './src/data/stage1Recordings.json';
import { stage1Narration } from './src/components/station/stage1Narration';

test('121 unique recordings cover the actual 25 stations and exact point text', () => {
  assert.equal(ALL_25_STATIONS.length, 25);
  assert.equal(recordings.length, 121);
  assert.equal(new Set(recordings.map(r => r.pointId)).size, 121);
  assert.equal(new Set(recordings.map(r => r.src)).size, 121);
  for (const station of ALL_25_STATIONS) for (const point of station.hotspots) {
    const recording = recordings.find(r => r.pointId === point.id);
    assert.ok(recording, point.id);
    assert.equal(recording.stationId, station.id);
    assert.equal(recording.title, point.titleVi);
    assert.equal(recording.narration, point.narrationVi);
    assert.equal(stage1Narration(station, point, 'vi'), recording.src);
    const bytes = readFileSync(`public${recording.src}`);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), recording.sha256);
    assert.ok(recording.src.includes(recording.sha256.slice(0, 12)));
    assert.equal(stage1Narration(station, {...point, narrationVi: 'Edited'}, 'vi'), undefined);
    assert.equal(stage1Narration(station, {...point, narrationEn: 'English'}, 'en'), undefined);
    assert.equal(stage1Narration({...station, id: 'another-station'}, point, 'vi'), undefined);
  }
  for (const [grade, count] of [[1,20],[2,25],[3,20],[4,27],[5,29]])
    assert.equal(recordings.filter(r => r.grade === grade).length, count);
});

test('legacy grade-one files are gone and special grade-four/five IDs use supplied mapping', () => {
  for (let s=1;s<=5;s++) for (let p=1;p<=4;p++)
    assert.equal(existsSync(`public/audio/stage1/grade1/g1-${s}-${p}.mp3`), false);
  const mapped = (filename: string) => recordings.find(r => r.filename === filename)?.stationId;
  assert.equal(mapped('g4-2-1.mp3'), 'g4-station-3');
  assert.equal(mapped('g4-3-1.mp3'), 'g4-station-2');
  assert.equal(mapped('g4-4-1.mp3'), 'g4-thu-bon-hon-kem');
  assert.equal(mapped('g5-2-1.mp3'), 'g5-station-3');
  assert.equal(mapped('g5-3-1.mp3'), 'g5-station-4');
});
