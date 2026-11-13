import type { TeacherWorkspace } from '../../services/TeacherWorkspaceService';

function saveBlob(blob:Blob,name:string){
  const href=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=href;a.download=name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(href),30000);
}
const fileName=(value:string)=>value.replace(/[^\p{L}\p{N}_-]+/gu,'_').slice(0,48);
const brief=(value?:string)=>value?.trim()||'Giáo viên bổ sung sau khi đối chiếu bài học';

export async function exportTeacherPlanExcel(plan:TeacherWorkspace){
  const {Workbook}=await import('exceljs');
  const book=new Workbook();book.creator='CHẠM ĐÀ NẴNG';
  const cover=book.addWorksheet('Thông tin kế hoạch');
  cover.addRows([
    ['KẾ HOẠCH TÍCH HỢP GIÁO DỤC ĐỊA PHƯƠNG'],
    ['Trường',plan.school],['Bộ sách',plan.book],['Năm học',plan.year],
    ['Khối lớp',plan.grade],['Số bài',plan.records.length],
    [],['Lưu ý','Giáo viên kiểm tra yêu cầu cần đạt, tuần dạy và nguồn trước khi tổ chức.'],
  ]);
  cover.getColumn(1).width=33;cover.getColumn(2).width=80;
  cover.getCell('A1').font={bold:true,size:16,color:{argb:'FF1D4ED8'}};
  const sheet=book.addWorksheet('Địa chỉ tích hợp');
  sheet.addRow(['STT','Khối','Môn học','Tuần','Tên bài','Yêu cầu cần đạt','Nội dung GDĐP',
    'Vị trí / hoạt động','Hình thức tích hợp','Gợi ý tổ chức','Liên kết trạm - điểm chạm']);
  plan.records.forEach((row,index)=>sheet.addRow([
    index+1,row.grade,row.subject,row.week,row.lesson,row.outcomes||'',
    row.content,row.activity,row.integrationType,row.teachingSuggestion||'',
    (row.resourceLinks||[]).map(link=>link.stationId+' / '+link.hotspotId).join('; '),
  ]));
  sheet.columns.forEach((col,index)=>{col.width=[8,9,20,12,34,50,58,50,24,58,32][index];});
  sheet.views=[{state:'frozen',ySplit:1}];
  sheet.autoFilter={from:'A1',to:'K'+Math.max(2,plan.records.length+1)};
  sheet.getRow(1).font={bold:true,color:{argb:'FFFFFFFF'}};
  sheet.getRow(1).height=30;
  sheet.getRow(1).eachCell(cell=>{cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF1E40AF'}};cell.alignment={wrapText:true,vertical:'middle'};});
  for(let i=2;i<=plan.records.length+1;i++){
    const row=sheet.getRow(i);row.alignment={wrapText:true,vertical:'top'};
    row.height=70;
    if(i%2===0)row.eachCell(cell=>{cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFEFF6FF'}};});
  }
  const data=await book.xlsx.writeBuffer();
  saveBlob(new Blob([data as BlobPart],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),
    'Ke_hoach_tich_hop_khoi_'+plan.grade+'_'+fileName(plan.year)+'.xlsx');
}

export async function exportTeacherPlanWord(plan:TeacherWorkspace){
  const {Document,Packer,Paragraph,TextRun,HeadingLevel}=await import('docx');
  const para=(text:string,bold=false)=>new Paragraph({
    children:[new TextRun({text,bold})],spacing:{after:100},keepTogether:true,
  });
  const rows:any[]=[
    new Paragraph({text:'KẾ HOẠCH TÍCH HỢP GIÁO DỤC ĐỊA PHƯƠNG',heading:HeadingLevel.TITLE}),
    para('Trường: '+plan.school),
    para('Bộ sách: '+plan.book),
    para('Năm học: '+plan.year+' · Khối '+plan.grade),
    para('Số bài được chọn: '+plan.records.length),
    para('Ghi chú: Thầy cô đối chiếu SGK và kế hoạch giáo dục của trường trước khi triển khai.'),
  ];
  plan.records.forEach((row,index)=>{
    rows.push(new Paragraph({text:(index+1)+'. '+row.lesson,heading:HeadingLevel.HEADING_2}));
    for(const [name,value] of [
      ['Môn học',row.subject],['Tuần',row.week||'Theo kế hoạch của trường'],
      ['Yêu cầu cần đạt',brief(row.outcomes)],['Vị trí tích hợp',brief(row.activity)],
      ['Nội dung GDĐP',brief(row.content)],['Hình thức',brief(row.integrationType)],
      ['Gợi ý tổ chức',brief(row.teachingSuggestion)],
      ['Liên kết học liệu',(row.resourceLinks||[]).map(link=>link.stationId+' – '+link.hotspotId).join('; ')||'Chưa chọn điểm chạm'],
    ])rows.push(para(name+': '+value));
  });
  const doc=new Document({styles:{default:{document:{run:{font:'Times New Roman',size:26},paragraph:{spacing:{line:310}}}}},
    sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1134,bottom:1134,left:1417,right:1134}}},children:rows}]});
  saveBlob(await Packer.toBlob(doc),'Ke_hoach_tich_hop_khoi_'+plan.grade+'_'+fileName(plan.year)+'.docx');
}
