import test from 'node:test';
import assert from 'node:assert/strict';
import {setExperienceMode} from './src/services/ExperienceMode';
import {learningFeedbackService} from './src/services/LearningFeedbackService';
import {gddpService} from './src/services/GddpService';
import {effectivenessService} from './src/services/EffectivenessService';
import {importPlan} from './src/services/TeacherWorkspaceService';
import ExcelJS from 'exceljs';
const {Workbook}=ExcelJS;
test('experience catalog, rating read/write and feedback issue zero network requests with writes blocked',async()=>{
 const originalFetch=globalThis.fetch,originalStorage=globalThis.localStorage;
 const calls:string[]=[];const values=new Map();
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(k:string)=>values.get(k)||null,setItem:(k:string,v:string)=>values.set(k,v)}});
 globalThis.fetch=async(input,init)=>{calls.push((init?.method||'GET')+' '+String(input));throw Error('Network blocked in experience acceptance test');};
 setExperienceMode(true);
 try{
  assert.ok((await gddpService.publicCatalog()).records.length>0);
  assert.equal(await learningFeedbackService.rating('g2-station-1'),0);
  assert.equal(await learningFeedbackService.saveRating('g2-station-1',5),5);
  assert.equal(await learningFeedbackService.rating('g2-station-1'),5);
  await learningFeedbackService.propose({stationId:'g2-station-1',category:'Đề xuất khác',text:'Ý kiến kiểm thử cục bộ',source:'test'});
  effectivenessService.visit(2);effectivenessService.stage('g2-station-1',4);effectivenessService.flush();
  assert.deepEqual(calls,[], 'No read or write request may leave experience services');
 }finally{globalThis.fetch=originalFetch;Object.defineProperty(globalThis,'localStorage',{configurable:true,value:originalStorage});setExperienceMode(false);}
});
test('export-shaped Excel imports the plan after a cover sheet and keeps lesson details',async()=>{
 const w=new Workbook();w.addWorksheet('Thông tin kế hoạch').addRows([['Trường','Trường kiểm thử']]);
 const s=w.addWorksheet('Địa chỉ tích hợp');s.addRow(['STT','Khối','Môn học','Tuần','Tên bài','Yêu cầu cần đạt','Nội dung GDĐP','Vị trí / hoạt động','Hình thức tích hợp','Gợi ý tổ chức']);s.addRow([1,2,'TNXH','2','Bài đối chiếu','Nêu một nét chính','Nội dung địa phương','Khám phá','Liên hệ','Trao đổi theo cặp']);
 const bytes=await w.xlsx.writeBuffer();const file=new File([bytes as BlobPart],'ke-hoach.xlsx');
 const records=await importPlan(file,2);assert.equal(records.length,1);assert.equal(records[0].lesson,'Bài đối chiếu');assert.equal(records[0].outcomes,'Nêu một nét chính');assert.equal(records[0].teachingSuggestion,'Trao đổi theo cặp');
});
