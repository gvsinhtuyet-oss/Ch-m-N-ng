import {test} from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {ALL_25_STATIONS} from './src/data/allStations';
import {stationMapPlaces,stationVrOptions} from './src/features/stations/explorationResources';
import {StationExplorationTools} from './src/components/station/StationExplorationTools';

test('all 25 stations show only tools with curated content; frames wait until a tool is opened',()=>{
 for(const station of ALL_25_STATIONS){
  const html=renderToStaticMarkup(<StationExplorationTools station={station} onOpenChange={()=>{}}/>);
  assert.equal((html.match(/aria-haspopup="dialog"/g)||[]).length,Number(stationMapPlaces(station).length>0)+Number(stationVrOptions(station).length>0),station.id);
  assert.doesNotMatch(html,/<iframe|tile.openstreetmap.org/);
  for(const option of stationVrOptions(station))assert.equal(new URL(option.url).protocol,'https:');
 }
});
test('Ba Na and Hai Van Quan remain separate choices; non-place lessons do not get map buttons',()=>{
 const station=ALL_25_STATIONS.find(s=>s.id==='g5-station-3')!;
 assert.deepEqual(stationVrOptions(station).map(v=>v.label),['Khám phá Bà Nà 360°','Khám phá Hải Vân Quan 360°']);
 const games=ALL_25_STATIONS.find(s=>s.id==='g1-station-2')!;
 assert.deepEqual(stationMapPlaces(games),[]);
});
