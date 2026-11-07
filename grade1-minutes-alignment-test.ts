import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {GRADE1_MINUTES} from './src/data/grade1MinutesAlignment';
import {GRADE1_CONTENT} from './src/data/grade1Content';
import {GRADE_1_STATIONS,GRADE1_CONTENT_REVISION} from './src/data/grade1Stations';
import {GRADE1_REVISION} from './src/services/Grade1ContentPolicy';
import {stage1Narration} from './src/components/station/stage1Narration';

const byId=(id:string)=>GRADE1_MINUTES.find(s=>s.stationId===id)!;
const lesson=(id:string)=>GRADE1_CONTENT.find(s=>s.id===id)!;
const changed=new Set(['g1-home-2','g1-home-3','g1-food-1','g1-food-4']);
test('minutes reference preserves 5 grade 1 themes and exact 4 instructional activity labels',()=>{
  assert.deepEqual(GRADE1_MINUTES.map(s=>s.stationId),['g1-station-1','g1-station-4','g1-station-2','g1-station-3','g1-station-5']);
  for(const s of GRADE1_MINUTES) {
    assert.deepEqual(s.phases.map(p=>p.name),['Khởi động','Khám phá','Thực hành','Vận dụng'],s.stationId);
    assert.ok(s.phases.every(p=>p.instructions.length),s.stationId);
    assert.ok(s.sourcePages.includes('Biên bản'));
  }
  assert.equal(GRADE1_REVISION,GRADE1_CONTENT_REVISION);
  assert.match(GRADE1_REVISION,/minutes-2025/);
});
test('Homeland retains exact 5 administrative labels, six discovery places, two school figures',()=>{
  const p=byId('g1-station-1').phases;
  assert.deepEqual(p[0].imageSubjects,['Phường Hội An','Xã Nam Trà My','Phường Hải Châu','Xã Hiệp Đức','Đặc khu Hoàng Sa']);
  assert.equal(p[1].imageSubjects?.length,6);
  for(const item of ['Thạch Bích','Trần Hưng Đạo','Việt An','Tây Giang','Cẩm Lệ','Trà Kiệu'])assert.ok(p[1].imageSubjects?.some(x=>x.includes(item)),item);
  assert.equal(p[2].imageSubjects?.length,2);
  assert.equal(p[3].instructions.length,2);
  const home=lesson('g1-station-1');
  assert.doesNotMatch(home.points[1].narration,/hai trường.*Võ Thị Sáu/i);
  assert.match(home.points[1].narration,/năm 2025/);
  assert.match(byId('g1-station-1').editorialNotice!,/26\/8\/2026/);
});
test('Citadel remains in Hai Chau and document-preserved lesson is not fabricated',()=>{
  const p=byId('g1-station-4').phases;
  assert.match(p[0].instructions.join(' '),/phường Hải Châu/);
  assert.match(p[2].instructions.join(' '),/vị tướng nào/);
  assert.match(p[3].instructions.join(' '),/di tích lịch sử/);
  assert.match(p[3].instructions.join(' '),/lập kế hoạch tham quan Thành Điện Hải/i);
  assert.match(byId('g1-station-2').editorialNotice!,/giữ nguyên/i);
  const folk=byId('g1-station-2').phases;
  assert.match(folk[1].instructions.join(' '),/bịt kín mắt|bịt mắt/i);
  assert.match(folk[1].instructions.join(' '),/kéo co/);
  assert.match(folk[3].instructions.join(' '),/người thân/);
});
test('Six opening falls and two discovery falls match minutes without confusing two Suoi Mo sites',()=>{
  const p=byId('g1-station-3').phases;
  assert.equal(p[0].imageSubjects?.length,6);
  assert.equal(p[0].imageSubjects?.filter(x=>x.startsWith('Suối Mơ')).length,2);
  assert.ok(p[0].imageSubjects?.some(x=>x.includes('Hà Nha')));
  assert.ok(p[0].imageSubjects?.some(x=>x.includes('Bà Nà')));
  assert.deepEqual(p[1].imageSubjects,['Thác Grăng – xã Bến Giằng','Thác Hòa Phú Thành – xã Hòa Vang']);
  assert.equal(p[3].instructions.length,2);
  assert.match(p[3].instructions[0],/sưu tầm những hình ảnh/);
});
test('Food opening exactly reflects six dishes and practical substitution Bánh đập',()=>{
  const p=byId('g1-station-5').phases;
  const names=['Mì Quảng','Bánh tráng cuốn thịt heo','Bánh sừng trâu','Bánh thuẫn','Bánh bèo','Bánh xèo'];
  assert.deepEqual(p[0].imageSubjects,names);
  assert.deepEqual(p[2].imageSubjects,['Cao lầu','Bê thui','Bánh đập','Cơm gà']);
  assert.match(p[1].instructions.join(' '),/mì Quảng/i);
  assert.match(p[3].instructions.join(' '),/Đầu bếp siêu hạng/);
  assert.match(p[2].instructions.join(' '),/Bánh tráng chập/);
  assert.doesNotMatch(lesson('g1-station-5').points[0].narration,/cao lầu|bê thui|cơm gà|nem nướng/i);
  for(const name of names)assert.ok(lesson('g1-station-5').points[0].narration.toLowerCase().includes(name.toLowerCase()),name);
  assert.match(lesson('g1-station-5').points[3].narration,/bánh đập/);
});
test('All existing progress IDs and challenges survive; corrected narration never plays old recording',()=>{
  for(const station of GRADE_1_STATIONS){
    assert.equal(station.hotspots.length,4);
    assert.equal(station.challenge.questions?.length,5);
    for(const hotspot of station.hotspots){
      const audio=stage1Narration(station,hotspot,'vi');
      if(changed.has(hotspot.id))assert.equal(audio,undefined,hotspot.id);
      else assert.ok(audio,hotspot.id);
    }
  }
  const ui=readFileSync('src/components/station/Stage1Exploration.tsx','utf8');
  assert.match(ui,/grade1MinutesTopic/);
  assert.match(ui,/grade1Minutes\.phases\.map/);
  assert.match(ui,/chưa (?:thay )?ảnh|Chưa thay ảnh/);
});
