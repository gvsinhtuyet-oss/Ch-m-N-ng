import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {ALL_25_STATIONS} from './src/data/allStations';
import {REAL_PHOTOS,REAL_POINT_PHOTOS,realPointGallery,realCoverPhoto} from './src/data/realPhotos';
import {currentRealPhotos} from './src/services/RealPhotoPolicy';

test('every imported image is a local WebP matching its reviewed digest and metadata',()=>{
 for(const p of REAL_PHOTOS){const bytes=readFileSync('public'+p.src);assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.equal(createHash('sha256').update(bytes).digest('hex'),p.sha256);assert.ok(p.width>200&&p.height>200&&p.width<=1440&&p.height<=1440);assert.ok(p.bytes<600000);assert.ok(p.author&&p.license&&p.sourceUrl.startsWith('https://'));}
});
test('priority stations have photos for every point, covers and compound processes',()=>{
 for(const id of ['g3-station-5','g4-station-4','g5-ky-anh-me-nhu','g5-lua-ma-chau']){const s=ALL_25_STATIONS.find(s=>s.id===id)!;assert.ok(realCoverPhoto(id));assert.equal(REAL_POINT_PHOTOS[id].length,s.hotspots.length);s.hotspots.forEach((h,i)=>{assert.equal(h.image,realPointGallery(id,i)[0].src);assert.ok(existsSync('public'+h.image));});}
 assert.equal(realPointGallery('g4-station-4',2).length,3);
 assert.equal(realPointGallery('g5-lua-ma-chau',2).length,2);
 assert.match(ALL_25_STATIONS.find(s=>s.id==='g5-ky-anh-me-nhu')!.hotspots[3].image,/me-nhu-tuong/);
});
test('media upgrades update saved built-in paths without changing questions or custom teacher images',()=>{
 const s=ALL_25_STATIONS.find(s=>s.id==='g5-lua-ma-chau')!;
 const content={contentRevision:s.version.version,coverImage:'/learning/grade45/photos/ma-chau.webp',mapImage:s.journeyMap!.image!,resources:[],hotspots:s.hotspots.map(h=>({...h,image:'/learning/grade45/old.svg'}))};
 const before=structuredClone(content);const out=currentRealPhotos(s,content);
 assert.deepEqual(content,before);assert.equal(out.coverImage,s.coverImage);assert.deepEqual(out.hotspots.map(h=>h.interaction),before.hotspots.map(h=>h.interaction));assert.deepEqual(out.hotspots.map(h=>h.narrationVi),before.hotspots.map(h=>h.narrationVi));
 const custom={...content,coverImage:'https://school.example/cover.webp',hotspots:content.hotspots.map(h=>({...h,image:'https://school.example/custom.webp'}))};assert.deepEqual(currentRealPhotos(s,custom),custom);
});
test('all local station covers and exploration assets exist across all 25 stations',()=>{
 assert.equal(ALL_25_STATIONS.length,25);for(const s of ALL_25_STATIONS)for(const src of [s.coverImage,...s.hotspots.map(h=>h.image)])if(src.startsWith('/'))assert.ok(existsSync('public'+src),`${s.id}: ${src}`);
});
