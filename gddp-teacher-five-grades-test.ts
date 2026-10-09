import {test} from 'node:test';
import assert from 'node:assert/strict';
import {matchGddpResources} from './src/services/GddpResourceMatcher.ts';
const row=(grade:number,content:string,links:any[]=[])=>({id:'case-'+grade,grade,subject:'Tiếng Việt',week:'3',lesson:'Bài luyện tập',
  integrationType:'Bộ phận',activity:'Khởi động',content,resourceLinks:links});
const station=(grade:number,name:string,verified=true)=>({id:'station-'+grade,grade,isFullyVerified:verified,titleVi:name,
  hotspots:[{id:'hotspot-'+grade,titleVi:name,image:'https://example.com/verified.jpg',
    narrationVi:'Thông tin giáo dục đã kiểm duyệt về '+name,keyFactVi:''}]});
test('all 5 teacher grades: match only correct-grade relevant hotspot, never whole stations',()=>{
 for(let grade=1;grade<=5;grade++){
  const stations=[1,2,3,4,5].map(g=>station(g,'Chùa Cầu Hội An'));
  const found=matchGddpResources(row(grade,'Tìm hiểu Chùa Cầu Hội An'),stations as any);
  assert.equal(found.length,1,'Grade '+grade);
  assert.equal(found[0].station.grade,grade);
  assert.equal(found[0].hotspot.id,'hotspot-'+grade);
 }
});
test('all 5 grades: generic locality words cannot auto-match unrelated hotspots',()=>{
 for(let grade=1;grade<=5;grade++){
  const found=matchGddpResources(row(grade,'Yêu quê hương Đà Nẵng và văn hóa địa phương'),
    [station(grade,'Chùa Cầu Hội An')] as any);
  assert.deepEqual(found,[],'Grade '+grade);
 }
});
test('unfinished / unverified / wrong-grade hotspots never appear even with explicit links',()=>{
 const grade=2;
 const valid=station(grade,'Chùa Cầu Hội An');
 const unfinished={...station(grade,'Chùa Cầu Hội An'),id:'unfinished',hotspots:[{...valid.hotspots[0],narrationVi:'Nội dung đang được hoàn thiện'}]};
 const hidden=station(grade,'Chùa Cầu Hội An',false);
 const foreign=station(3,'Chùa Cầu Hội An');
 const found=matchGddpResources(row(grade,'Chùa Cầu Hội An',
  [{stationId:'unfinished',hotspotId:'hotspot-2'},{stationId:'station-3',hotspotId:'hotspot-3'}]),
  [unfinished,hidden,foreign] as any);
 assert.deepEqual(found,[]);
});
test('exact Admin link selects only approved hotspot, even if other hotspot title matches',()=>{
 const s={...station(5,'Chùa Cầu Hội An'),hotspots:[
   {id:'one',titleVi:'Chùa Cầu Hội An',image:'https://example.com/1.jpg',narrationVi:'Đã kiểm duyệt'},
   {id:'two',titleVi:'Hội An nhà cổ',image:'https://example.com/2.jpg',narrationVi:'Đã kiểm duyệt'}]};
 const found=matchGddpResources(row(5,'Chùa Cầu Hội An',[{stationId:'station-5',hotspotId:'two'}]),[s] as any);
 assert.equal(found.length,1); assert.equal(found[0].hotspot.id,'two');
});
