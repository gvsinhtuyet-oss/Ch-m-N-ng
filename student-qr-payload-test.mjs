import test from 'node:test';
import assert from 'node:assert/strict';
import {extractStudentCodeFromQr,normalizeStudentCode} from './src/features/landing/studentQr.ts';
const valid='ABCD-EFGH-2345';
const origin='https://chamdanang-gddp.pages.dev';
test('only a legitimate student sync-code format or own-app QR link is accepted',()=>{
  assert.equal(normalizeStudentCode(valid),'ABCDEFGH2345');
  assert.equal(extractStudentCodeFromQr('ABCDEFGH2345',origin),'ABCDEFGH2345');
  assert.equal(extractStudentCodeFromQr(origin+'/#student-code='+valid,origin),'ABCDEFGH2345');
  assert.equal(extractStudentCodeFromQr(valid,origin),'ABCDEFGH2345');
  for(const wrong of ['','abc','123456','hello world','https://example.com/#student-code='+valid,
    'javascript:alert(1)',origin+'/#role=teacher',origin+'/#student-code='+valid+'&x=1',
    origin+'/attacker/#student-code='+valid,'https://chamdanang-gddp.pages.dev.evil.test/#student-code='+valid,
    origin+'/?redirect=1#student-code='+valid,'A'.repeat(3000)]){
      assert.equal(extractStudentCodeFromQr(wrong,origin),null,wrong);
    }
});
