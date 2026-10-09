import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import { GDDP_YEAR, validateGddpCatalog, cleanGddpCatalog } from './gddp-catalog.mjs';
const row={id:'gddp-2026-3-01',grade:3,subject:'Tiếng Việt',week:'3',
 lesson:'Bài 4: Nhật kí tập bơi',integrationType:'Bộ phận',
 activity:'Khởi động',content:'Tìm hiểu quy tắc an toàn khi tắm biển'};
test('GDĐP 2026–2027 catalog accepts an approved row without modifying it',()=>{
 const data={year:GDDP_YEAR,records:[row]};
 assert.equal(validateGddpCatalog(data),true);
 assert.deepEqual(cleanGddpCatalog(data).records[0],{...row,outcomes:'',teachingSuggestion:'',resourceLinks:[]});
});
test('rejects duplicate ID, other academic year and invalid grades',()=>{
 assert.equal(validateGddpCatalog({year:GDDP_YEAR,records:[row,row]}),false);
 assert.equal(validateGddpCatalog({year:'2025-2026',records:[row]}),false);
 assert.equal(validateGddpCatalog({year:GDDP_YEAR,records:[{...row,grade:6}]}),false);
});
test('rejects missing integration content and oversized payloads',()=>{
 assert.equal(validateGddpCatalog({year:GDDP_YEAR,records:[{...row,content:''}]}),true); // allowed as an unpublished draft only
 assert.equal(validateGddpCatalog({year:GDDP_YEAR,records:[{...row,content:'a'.repeat(10000)}]}),false);
 assert.equal(validateGddpCatalog({year:GDDP_YEAR,records:Array(501).fill(row)}),false);
});

test('bundled 2026–2027 integration addresses cover all five grades with no blank content',async()=>{
 const data=JSON.parse(await readFile(new URL('./content-data/gddp-2026-2027.json',import.meta.url),'utf8'));
 assert.equal(validateGddpCatalog(data),true);
 assert.equal(data.records.length,42);
 assert.deepEqual([1,2,3,4,5].map(grade=>data.records.filter(row=>row.grade===grade).length),[7,8,10,9,8]);
 assert.ok(data.records.every(row=>row.content.trim() && row.lesson.trim() && row.subject.trim()));
});
