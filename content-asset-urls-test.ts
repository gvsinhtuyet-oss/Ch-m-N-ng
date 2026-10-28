import test from 'node:test';
import assert from 'node:assert/strict';
import {ALL_25_STATIONS} from './src/data/allStations';
import {contentForServer,isBundledAssetUrl} from './src/services/contentAssetUrls';
import type {StationContent} from './src/services/ContentService';

test('all bundled station maps and media can be published to the existing HTTPS-only API',()=>{
  for(const station of ALL_25_STATIONS){
    const content:StationContent={coverImage:station.coverImage,
      mapImage:'/images/maps/'+station.id+'.webp',hotspots:station.hotspots,resources:[]};
    const original=structuredClone(content);
    const sent=contentForServer(content,'https://contest.pages.dev');
    assert.equal(sent.mapImage,'https://contest.pages.dev/images/maps/'+station.id+'.webp');
    for(const value of [sent.coverImage,sent.mapImage,...sent.hotspots.map(h=>h.image)]){
      assert.ok(!value||/^https:\/\//.test(value)||value.startsWith('data:'),station.id+': '+value);
    }
    assert.deepEqual(content,original);
  }
});
test('editor rejects traversal, script, protocol-relative and arbitrary local files',()=>{
  for(const url of ['//evil.example/image.webp','/images/../private/file.webp','/api/auth/session',
    '/images/asset.html','javascript:alert(1)','/images/%2e%2e/asset.png'])assert.equal(isBundledAssetUrl(url),false,url);
});
