import {test} from 'node:test';
import assert from 'node:assert/strict';
import { GDDP_YEAR, validateGddpCatalog, cleanGddpCatalog } from './gddp-catalog.mjs';
const row={id:'gddp-2026-3-01',grade:3,subject:'Tiếng Việt',week:'3',
 lesson:'Bài 4: Nhật kí tập bơi',integrationType:'Bộ phận',
 activity:'Khởi động',content:'Tìm hiểu quy tắc an toàn khi tắm biển'};
test('GDĐP 2026–2027 catalog accepts an approved row without modifying it',()=>{
 const data={year:GDDP_YEAR,records:[row]};
 assert.equal(validateGddpCatalog(data),true);
 assert.deepEqual(cleanGddpCatalog(data),data);
});
test('rejects duplicate ID, other academic year and invalid grades',()=>{
 assert.equal(validateGddpCatalog({year:GDDP_YEAR,records:[row,row]}),false);
 assert.equal(validateGddpCatalog({year:'2025-2026',records:[row]}),false);
 assert.equal(validateGddpCatalog({year:GDDP_YEAR,records:[{...row,grade:6}]}),false);
});
test('rejects missing integration content and oversized payloads',()=>{
 assert.equal(validateGddpCatalog({year:GDDP_YEAR,records:[{...row,content:''}]}),false);
 assert.equal(validateGddpCatalog({year:GDDP_YEAR,records:[{...row,content:'a'.repeat(10000)}]}),false);
 assert.equal(validateGddpCatalog({year:GDDP_YEAR,records:Array(501).fill(row)}),false);
});
