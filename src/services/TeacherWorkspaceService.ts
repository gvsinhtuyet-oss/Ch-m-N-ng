import type {GddpRecord} from './GddpService';
export interface TeacherWorkspace{school:string;book:string;year:string;grade:number;records:GddpRecord[];updatedAt?:string}
export async function workspaceRequest(method='GET',workspace?:TeacherWorkspace):Promise<TeacherWorkspace|null>{
 const r=await fetch('/api/teacher/workspace',{method,credentials:'same-origin',cache:'no-store',...(workspace?{headers:{'Content-Type':'application/json'},body:JSON.stringify(workspace)}:{})});
 const data=await r.json();if(!r.ok)throw Error(data.error||'Không tải được kế hoạch riêng.');return data.workspace;
}
const norm=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/đ/g,'d').trim();
export function recordsFromRows(rows:string[][],grade:number):GddpRecord[]{
 const header=rows.findIndex(r=>r.some(c=>norm(c).includes('ten bai')||norm(c)==='bai hoc')&&r.some(c=>norm(c).includes('noi dung')));
 if(header<0)throw Error('Không nhận diện được bảng. Cần cột Môn học, Tên bài, Nội dung tích hợp; có thể tải mẫu Excel.');
 const headers=Array.from(rows[header],c=>norm(String(c||'')));const col=(...names:string[])=>headers.findIndex(h=>names.some(n=>h===n||h.startsWith(n)));
 const indices={subject:col('mon hoc','mon'),lesson:col('ten bai','bai hoc'),content:col('noi dung tich hop','noi dung gddp','noi dung'),week:col('tuan'),activity:col('dia chi tich hop','vi tri','hoat dong'),integrationType:col('muc do','hinh thuc')};
 if(indices.subject<0||indices.lesson<0||indices.content<0)throw Error('Thiếu cột Môn học, Tên bài hoặc Nội dung tích hợp.');
 const records=rows.slice(header+1).filter(r=>r.some(c=>c.trim())).map((r,i)=>{const get=(key:keyof typeof indices)=>String(r[indices[key]]||'').trim();return {id:`private-${Date.now()}-${i}`,grade,subject:get('subject'),lesson:get('lesson'),content:get('content'),week:get('week'),activity:get('activity'),integrationType:get('integrationType'),resourceLinks:[]};});
 if(!records.length||records.length>100||records.some(r=>!r.subject||!r.lesson||!r.content))throw Error('Bảng cần 1–100 dòng, đủ môn, tên bài và nội dung. Ô gộp cần điền đầy đủ trước khi nhập.');return records;
}
export async function importPlan(file:File,grade:number){
 if(file.size>5*1024*1024)throw Error('Chọn file không quá 5 MB, chỉ chứa bảng kế hoạch.');
 const buffer=await file.arrayBuffer();let rows:string[][]=[];
 const {default:Zip}=await import('jszip');const archive=await Zip.loadAsync(buffer);
 const size=Object.values(archive.files).reduce((sum,entry)=>sum+Number((entry as any)._data?.uncompressedSize||0),0);if(size>15000000)throw Error('File giải nén quá lớn. Hãy dùng bảng kế hoạch thu gọn.');
 if(/\.xlsx$/i.test(file.name)){const {Workbook}=await import('exceljs');const book=new Workbook();await book.xlsx.load(buffer);const sheet=book.worksheets[0];sheet?.eachRow(row=>{const values:string[]=[];row.eachCell({includeEmpty:true},(cell,i)=>{values[i-1]=cell.text});rows.push(values);});}
 else if(/\.docx$/i.test(file.name)){const {default:JSZip}=await import('jszip');const zip=await JSZip.loadAsync(buffer);const entry=zip.file('word/document.xml');if(!entry)throw Error('File Word không hợp lệ.');const xml=await entry.async('string');if(xml.length>5000000)throw Error('Nội dung Word quá lớn.');const doc=new DOMParser().parseFromString(xml,'application/xml');for(const table of Array.from(doc.getElementsByTagName('w:tbl'))){const tableRows=Array.from(table.getElementsByTagName('w:tr')).map(row=>Array.from(row.children).filter(c=>c.localName==='tc').map(cell=>Array.from(cell.getElementsByTagName('w:t')).map(n=>n.textContent||'').join(' ')));try{return recordsFromRows(tableRows,grade);}catch{}}throw Error('Không tìm thấy bảng phù hợp trong Word. Dùng mẫu Excel để chuẩn hóa.');}
 else throw Error('Hỗ trợ Word .docx và Excel .xlsx.');return recordsFromRows(rows,grade);
}
export async function downloadPlanTemplate(){const {Workbook}=await import('exceljs');const w=new Workbook();const s=w.addWorksheet('Địa chỉ tích hợp');s.addRow(['Môn học','Tuần','Tên bài','Nội dung tích hợp','Địa chỉ tích hợp','Mức độ']);s.columns.forEach(c=>c.width=28);const blob=new Blob([await w.xlsx.writeBuffer() as BlobPart]);const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='Mau-dia-chi-tich-hop.xlsx';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
