import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,statSync} from 'node:fs';
import {GRADE_1_STATIONS} from './src/data/grade1Stations';
import {gradeOneNarration} from './src/components/station/gradeOneNarration';

test('all grade one points map to their existing recorded voice and changed text does not',()=>{
  let count=0;
  for(const station of GRADE_1_STATIONS) for(const point of station.hotspots){
    const src=gradeOneNarration(station,point,'vi');
    assert.ok(src); assert.ok(existsSync(`public${src}`)); assert.ok(statSync(`public${src}`).size>1000, `Empty audio: ${src}`);
    assert.equal(gradeOneNarration(station,{...point,narrationVi:point.narrationVi+' sửa'},'vi'),undefined);
    assert.equal(gradeOneNarration(station,{...point,narrationEn:'English'},'en'),undefined);
    count++;
  }
  assert.equal(count,20);
});
