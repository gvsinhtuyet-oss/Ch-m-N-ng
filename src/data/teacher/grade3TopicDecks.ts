import {GRADE_3_STATIONS} from '../grade3Stations';
import {GRADE3_CONTENT} from '../grade3Content';
import {grade3MediaBySrc} from '../grade3Media';
import {GRADE3_PHOTO_REFERENCES} from '../grade3PhotoReferences';
import type {LessonDeckDefinition} from './grade2LessonDecks';
// Reusable topic presentations, deliberately outside the integration record matcher.
// Synthetic records are display context only; never saved or published as integration mappings.
export const GRADE3_TOPIC_DECKS:LessonDeckDefinition[]=GRADE_3_STATIONS.map(s=>{
 const content=GRADE3_CONTENT.find(l=>l.id===s.id)!;
 const sourceRecord={id:'topic-'+s.id,grade:3,subject:'Học liệu theo chủ đề',week:'Chưa gắn kế hoạch',lesson:s.titleVi,integrationType:'Tham khảo',activity:'Khám phá – vận dụng',content:s.pedagogyGoals.knowGoalVi};
 const schematicCaption='Sơ đồ minh họa học tập; không phải ảnh tư liệu hay bản đồ địa lí.';
 const caption=(src:string)=>grade3MediaBySrc(src)?.caption||schematicCaption;
 return {presentationKind:'topic',recordId:sourceRecord.id,sourceRecord,title:s.titleVi,status:'source-aligned-draft',outcomes:[s.pedagogyGoals.knowGoalVi,s.pedagogyGoals.understandGoalVi,s.pedagogyGoals.behaviorGoalVi],sources:[...new Set([s.officialCurriculumReference,...content.sources,...GRADE3_PHOTO_REFERENCES.filter(r=>r.stationId===s.id).map(r=>r.sourceUrl)])],reviewNotes:content.notes,
 mappingReview:{sourceYear:'Đề cương dự thảo và nguồn chuyên môn',currentYearConfirmed:false,note:'Bộ trình chiếu theo chủ đề; chưa gắn tuần, bài SGK hay kế hoạch tích hợp mới. Giáo viên duyệt mục tiêu và chọn phần phù hợp trước khi dạy.'},
 slides:[
 {title:s.titleVi,points:[s.openingMessageVi,...[s.pedagogyGoals.knowGoalVi,s.pedagogyGoals.behaviorGoalVi]],question:'Em đã biết điều gì và muốn tìm hiểu điều gì về chủ đề này?',answer:'Đón nhận hiểu biết ban đầu; hỏi thêm căn cứ, không chấm cảm xúc hoặc trải nghiệm cá nhân là đúng/sai.',teacherNotes:'Khởi động 2–3 phút. Cho học sinh nói, chỉ hình hoặc viết điều muốn biết. Đây là học liệu chủ đề, không thay phần đọc hay nhiệm vụ của SGK. '+content.notes.join(' '),visual:['Quan sát','Tìm hiểu','Vận dụng'],images:[{src:s.coverImage,alt:s.titleVi,caption:caption(s.coverImage)}]},
 ...s.hotspots.map(h=>({title:h.titleVi,points:[h.narrationVi,h.keyFactVi],question:h.interaction!.questionVi,answer:h.interaction!.options.find(o=>o.isCorrect)!.textVi,teacherNotes:'Cho học sinh quan sát, trao đổi theo cặp rồi nêu căn cứ. Phân biệt ảnh chụp, ảnh hiện vật/mô hình bảo tàng và sơ đồ. Đọc đúng nơi chụp, xuất xứ, niên đại; không suy rộng ảnh bối cảnh thành bằng chứng công đoạn sản xuất. '+content.notes.join(' '),visual:['Quan sát','Giải thích'],images:[{src:h.image,alt:h.titleVi,caption:caption(h.image)}]})),
 ...s.challenge.questions!.map((q,i)=>({title:`Vận dụng ${i+1}`,points:[q.questionVi,...q.options.map(o=>o.textVi)],question:'Em chọn cách nào? Vì sao?',answer:q.options.find(o=>o.isCorrect)!.textVi,teacherNotes:q.hintVi+' Trao đổi lí do trước khi mở gợi ý; chấp nhận cách diễn đạt tương đương. Không biến tình huống mô phỏng thành nhiệm vụ thực hành nguy hiểm.',visual:['Suy nghĩ','Lựa chọn','Nêu lí do']})),
 {title:'Điều em mang về',points:s.checkIn.actionOptions.map(o=>o.textVi),question:'Em chọn một việc nhỏ nào và sẽ thực hiện ra sao?',answer:'Học sinh tự chọn việc phù hợp và giải thích. Không yêu cầu tất cả cùng một cảm xúc hoặc một cam kết.',teacherNotes:'Kết thúc 2–3 phút. Quan sát khả năng giới thiệu một thông tin có nguồn và chọn hành động phù hợp; không yêu cầu học thuộc số tiết hay mốc năm ngoài mục tiêu.',visual:['Em biết','Em hiểu','Em hành động'],images:[{src:s.journeyMap!.image!,alt:'Sơ đồ tổng kết '+s.titleVi,caption:schematicCaption}]}
 ]};
});
