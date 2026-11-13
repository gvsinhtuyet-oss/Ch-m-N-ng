import type {GddpRecord} from './GddpService';
import type {TeacherWorkspace} from './TeacherWorkspaceService';

export const SCHOOL_NAME = 'Trường Tiểu học Trần Đại Nghĩa';
export const TEXTBOOK_NAME = 'Kết nối tri thức với cuộc sống';
export const SCHOOL_YEAR = '2026-2027';
const KEY_PREFIX = 'cham-teacher-local-plan-2026-v1';
const MAX_ROWS = 100;

export function blankLocalPlan(grade:number):TeacherWorkspace {
  return {school:SCHOOL_NAME,book:TEXTBOOK_NAME,year:SCHOOL_YEAR,grade,records:[]};
}

export function localPlanKey(userId:string,grade:number) {
  return KEY_PREFIX+':'+encodeURIComponent(userId)+':'+grade;
}

export function validateLocalPlan(input:unknown,grade:number):TeacherWorkspace {
  if(!Number.isInteger(grade)||grade<1||grade>5)throw Error('Khối lớp phải từ 1 đến 5.');
  if(!input || typeof input!=='object')throw Error('Tệp kế hoạch không hợp lệ.');
  const source=input as Partial<TeacherWorkspace>;
  if(source.grade!==grade)throw Error('Kế hoạch thuộc khối khác. Hãy chọn đúng khối trước khi nhập.');
  if(!Array.isArray(source.records)||source.records.length>MAX_ROWS)throw Error('Kế hoạch tối đa 100 bài.');
  const records:GddpRecord[]=source.records.map((row,i)=>{
    if(!row||typeof row!=='object'||row.grade!==grade)throw Error('Có bài học sai khối.');
    const fields=['subject','week','lesson','integrationType','activity','content','outcomes','teachingSuggestion'] as const;
    const item:Record<string,unknown>={id:typeof row.id==='string'&&row.id.startsWith('private-')?row.id:'private-'+i,grade};
    for(const field of fields) {
      const value=row[field];
      if(value!==undefined && typeof value!=='string')throw Error('Nội dung kế hoạch chưa hợp lệ.');
      item[field]=String(value||'').slice(0,2500);
    }
    item.resourceLinks=Array.isArray(row.resourceLinks)?row.resourceLinks.filter(link=>link&&typeof link.stationId==='string'&&typeof link.hotspotId==='string').slice(0,20).map(link=>({stationId:link.stationId,hotspotId:link.hotspotId})):[];
    return item as unknown as GddpRecord;
  });
  return {...blankLocalPlan(grade),records};
}

export function loadLocalPlan(userId:string,grade:number,storage:Pick<Storage,'getItem'>=localStorage):TeacherWorkspace {
  const raw=storage.getItem(localPlanKey(userId,grade));
  if(!raw)return blankLocalPlan(grade);
  return validateLocalPlan(JSON.parse(raw),grade);
}

export function storeLocalPlan(userId:string,plan:TeacherWorkspace,storage:Pick<Storage,'setItem'>=localStorage):void {
  const clean=validateLocalPlan(plan,plan.grade);
  storage.setItem(localPlanKey(userId,plan.grade),JSON.stringify({...clean,updatedAt:new Date().toISOString()}));
}

function saveBlob(blob:Blob,filename:string):void {
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=filename;a.click();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}

export function downloadLocalBackup(plan:TeacherWorkspace):void {
  const clean=validateLocalPlan(plan,plan.grade);
  saveBlob(new Blob([JSON.stringify(clean,null,2)],{type:'application/json;charset=utf-8'}),'Ke-hoach-tich-hop-khoi-'+plan.grade+'-du-phong.json');
}

export async function importLocalBackup(file:File,grade:number):Promise<TeacherWorkspace> {
  if(!/\.json$/i.test(file.name)||file.size>1024*1024)throw Error('Chọn bản sao JSON không quá 1 MB.');
  return validateLocalPlan(JSON.parse(await file.text()),grade);
}

export async function downloadLocalExcel(plan:TeacherWorkspace):Promise<void> {
  const clean=validateLocalPlan(plan,plan.grade);
  const {Workbook}=await import('exceljs');
  const book=new Workbook();const sheet=book.addWorksheet('Kế hoạch tích hợp');
  sheet.addRow(['Trường',SCHOOL_NAME]);
  sheet.addRow(['Bộ sách',TEXTBOOK_NAME]);
  sheet.addRow(['Năm học',SCHOOL_YEAR,'Khối',plan.grade]);
  sheet.addRow([]);
  sheet.addRow(['Môn học','Tuần','Tên bài','Nội dung tích hợp','Địa chỉ tích hợp','Mức độ','Yêu cầu cần đạt','Gợi ý tổ chức']);
  for(const row of clean.records)sheet.addRow([row.subject,row.week,row.lesson,row.content,row.activity,row.integrationType,row.outcomes||'',row.teachingSuggestion||'']);
  sheet.columns.forEach((col,i)=>{col.width=i===2?36:i===3?52:27;});
  sheet.getRow(5).font={bold:true,color:{argb:'FFFFFFFF'}};
  sheet.getRow(5).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF146C58'}};
  sheet.getRow(5).alignment={wrapText:true,vertical:'middle'};
  const data=await book.xlsx.writeBuffer();
  saveBlob(new Blob([data as BlobPart],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),'Ke-hoach-tich-hop-KNTT-khoi-'+plan.grade+'.xlsx');
}