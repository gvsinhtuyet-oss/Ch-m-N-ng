import {test} from 'node:test';
import assert from 'node:assert/strict';
import {gddpPrompt,cleanGddpAiSuggestion} from './gddp-ai.mjs';
const row={grade:3,subject:'Tiếng Việt',week:'3',lesson:'Nhật kí tập bơi',activity:'Khởi động',
 integrationType:'Bộ phận',content:'Giáo dục an toàn tắm biển'};
test('AI receives only the selected integrated lesson source',()=>{
 const prompt=gddpPrompt(row);
 assert.match(prompt,/Nhật kí tập bơi/);
 assert.match(prompt,/không tự suy đoán/i);
 assert.doesNotMatch(prompt,/mật khẩu|studentId|học sinh cá nhân/i);
});
test('AI suggestion must contain two nonempty fields',()=>{
 assert.deepEqual(cleanGddpAiSuggestion({outcomes:' Nêu được quy tắc an toàn. ',teachingSuggestion:' GV hỏi, HS trả lời. '}),{
 outcomes:'Nêu được quy tắc an toàn.',teachingSuggestion:'GV hỏi, HS trả lời.'
 });
 assert.throws(()=>cleanGddpAiSuggestion({outcomes:'',teachingSuggestion:'x'}),{status:502});
 assert.throws(()=>cleanGddpAiSuggestion({outcomes:'x'}),{status:502});
});
