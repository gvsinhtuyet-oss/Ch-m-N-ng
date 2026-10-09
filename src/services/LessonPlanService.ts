import type { GddpRecord } from './GddpService';
export interface PlanActivity {title:string;minutes:number;teacher:string;student:string;evidence:string;}
export interface LessonPlan {lesson:string;subject:string;grade:number;week:string;school:string;teacher:string;className:string;date:string;objectives:string;competencies:string;qualities:string;materials:string;integration:string;activities:PlanActivity[];adjustments:string;source:string;}
export function createLessonPlan(r:GddpRecord):LessonPlan {
  return {lesson:r.lesson,subject:r.subject,grade:r.grade,week:r.week,school:'',teacher:'',className:'',date:'',
    objectives:r.outcomes || 'Bổ sung yêu cầu cần đạt của bài theo SGK và kế hoạch giáo dục của nhà trường.',
    competencies:'Giao tiếp và hợp tác: trao đổi, lắng nghe ý kiến của bạn.\nTự chủ và tự học: thực hiện nhiệm vụ được giao.\nBổ sung năng lực đặc thù của môn học theo bài.',
    qualities:'Yêu nước: quan tâm, trân trọng văn hóa và cảnh quan quê hương.\nTrách nhiệm: đề xuất việc làm phù hợp để giữ gìn địa phương.',
    materials:'SGK của bài đã chọn; nội dung GDĐP đã duyệt; hình ảnh hoặc học liệu phù hợp; phiếu học tập. Khi mất mạng, sử dụng học liệu đã chuẩn bị trước.',
    integration:`Vị trí: ${r.activity || 'Giáo viên xác định trong tiến trình bài học'}\nHình thức: ${r.integrationType}\nNội dung: ${r.content}`,
    activities:[
      {title:'Khởi động',minutes:5,teacher:`Giới thiệu bài ${r.lesson}. Mời học sinh chia sẻ điều đã biết có liên quan đến bài; kết nối với mục tiêu tiết học.`,student:'Quan sát, trả lời câu hỏi; chia sẻ theo cặp rồi trình bày.',evidence:'Câu trả lời và mức độ tham gia của học sinh.'},
      {title:'Khám phá và hình thành kiến thức',minutes:15,teacher:`Tổ chức nhiệm vụ theo SGK bài ${r.lesson}.\nTích hợp tại: ${r.activity || 'vị trí phù hợp do giáo viên chọn'}.\n${r.teachingSuggestion || 'Cho học sinh quan sát tư liệu, trao đổi và rút ra điều học được.'}\nNội dung GDĐP dùng trong nhiệm vụ:\n${r.content}`,student:'Thực hiện nhiệm vụ trong SGK; quan sát tư liệu địa phương, trao đổi nhóm, trình bày và bổ sung ý kiến.',evidence:'Sản phẩm nhóm, câu trả lời; đối chiếu với yêu cầu cần đạt đã xác định.'},
      {title:'Luyện tập',minutes:10,teacher:'Giao bài tập phù hợp trong SGK hoặc phiếu học tập. Hỗ trợ học sinh cần giúp đỡ; giao câu hỏi mở rộng cho học sinh hoàn thành sớm.',student:'Làm bài cá nhân hoặc theo cặp, giải thích cách làm; tự kiểm tra và sửa bài theo góp ý.',evidence:'Bài làm và cách giải thích của từng học sinh.'},
      {title:'Vận dụng và kết thúc',minutes:5,teacher:'Mời học sinh nêu điều học được và một việc làm phù hợp gắn với quê hương. Nhận xét, khích lệ và giao nhiệm vụ tiếp nối.',student:'Chia sẻ điều học được, đề xuất việc làm cụ thể; tự đánh giá và ghi nhớ nhiệm vụ.',evidence:'Phát biểu cuối tiết và đề xuất hành động của học sinh.'}
    ],adjustments:'',source:`Thư viện GDĐP nhà trường năm học 2026–2027; mã bài ${r.id}. Giáo viên bổ sung tên SGK, trang và nguồn học liệu sử dụng.`};
}
export function restoreLessonPlan(raw:string,r:GddpRecord):LessonPlan {
 const p=JSON.parse(raw);const original=createLessonPlan(r);
 if(!p || p.grade!==r.grade || p.lesson!==r.lesson || p.subject!==r.subject || !Array.isArray(p.activities) || p.activities.length!==4 || Object.keys(original).some(k=>k!=='activities' && typeof p[k]!==typeof original[k as keyof LessonPlan]) || p.activities.some((a:any)=>!a || !Number.isInteger(a.minutes) || a.minutes<1 || a.minutes>120 || ['title','teacher','student','evidence'].some(k=>typeof a[k]!=='string')))throw new Error('Bản nháp không hợp lệ hoặc thuộc bài khác.');
 return p;
}
export function totalMinutes(p:LessonPlan){return p.activities.reduce((s,a)=>s+a.minutes,0);}
export async function lessonPlanBlob(p:LessonPlan):Promise<Blob>{
  const {Document,Packer,Paragraph,TextRun,HeadingLevel,Table,TableRow,TableCell,WidthType}=await import('docx');
  const lines=(s:string)=>s.split('\n').map(text=>new Paragraph({children:[new TextRun(text)],spacing:{after:100}}));
  const heading=(text:string)=>new Paragraph({text,heading:HeadingLevel.HEADING_1,pageBreakBefore:text.startsWith('III ')});
  const widths=[15,35,30,20];
  const cell=(s:string,i:number)=>new TableCell({width:{size:widths[i],type:WidthType.PERCENTAGE},children:lines(s)});
  const children=[new Paragraph({text:'KẾ HOẠCH BÀI DẠY',heading:HeadingLevel.TITLE}),...lines(`Bài: ${p.lesson}\nMôn: ${p.subject} · Khối: ${p.grade} · Tuần: ${p.week}\nTrường: ${p.school}\nGiáo viên: ${p.teacher} · Lớp: ${p.className}\nNgày dạy: ${p.date} · Thời lượng: ${totalMinutes(p)} phút`),heading('I Yêu cầu cần đạt'),...lines(p.objectives),heading('Năng lực'),...lines(p.competencies),heading('Phẩm chất'),...lines(p.qualities),heading('II Đồ dùng dạy học'),...lines(p.materials),heading('Nội dung tích hợp giáo dục địa phương'),...lines(p.integration),heading('III Các hoạt động dạy học')];
  const table=new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[new TableRow({tableHeader:true,children:['Hoạt động và thời gian','Hoạt động của giáo viên','Hoạt động của học sinh','Sản phẩm và đánh giá'].map(cell)}),...p.activities.map(a=>new TableRow({children:[`${a.title}\n${a.minutes} phút`,a.teacher,a.student,a.evidence].map(cell)}))]});
  return Packer.toBlob(new Document({styles:{paragraphStyles:[{id:'Title',name:'Title',basedOn:'Normal',run:{font:'Times New Roman',size:36,bold:true,color:'000000'},paragraph:{spacing:{after:240}}},{id:'Heading1',name:'Heading 1',basedOn:'Normal',run:{font:'Times New Roman',size:28,bold:true,color:'000000'},paragraph:{keepNext:true,spacing:{before:160,after:100}}}],default:{document:{run:{font:'Times New Roman',size:26},paragraph:{spacing:{line:300}}}}},sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1134,bottom:1134,left:1417,right:1134}}},children:[...children,table,heading('IV Điều chỉnh sau bài dạy'),...lines(p.adjustments || ' '),heading('Nguồn học liệu'),...lines(p.source)]}]}));
}
