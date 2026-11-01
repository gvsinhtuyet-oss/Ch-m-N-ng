import knowledge from '../data/assistantKnowledge.json';
import profiles from '../data/assistantLearningProfiles.json';
import assessmentBank from '../data/assistantAssessmentBank.json';
import type {Station, ExplorationHotspot} from '../types';

export type LearningTask = 'knowledge' | 'comparison' | 'questions' | 'activity' | 'rewrite' | 'practice';
export interface LearningContext {
  audience?:'student'|'teacher'; grade?:number; stage?:number;
  previousQuery?:string; previousTopic?:string; previousAnswer?:string; pendingTask?:LearningTask; practiceIndex?:number;
  station?:Station|null; hotspot?:ExplorationHotspot|null;
}
export interface PracticeQuestion {
  id:string; topicId:string; topic:string; question:string; answer:string;
  options?:string[]; correctIndex?:number; explanation:string; hint?:string; sequence?:number;
}
export interface LearningResult {
  found:boolean; layer:'common'|'unknown'; confidence:'high'|'medium'|'low';
  answer:string; normalizedQuery:string; topic?:string; task?:LearningTask;
  sources?:{label:string;url?:string}[]; practice?:PracticeQuestion; pendingTask?:LearningTask; practiceIndex?:number;
}
const norm=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
  .replace(/đ/g,'d').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
const contains=(query:string,term:string)=>(` ${query} `).includes(` ${norm(term)} `);
export const learningProfiles=profiles;
export const learningAssessmentBank=assessmentBank;
export function detectLearningTask(query:string):LearningTask {
  const q=norm(query);
  if(/\b(?:hoi em|hoi minh|do em|do minh|kiem tra em|tu kiem tra|luyen tap|on tap tung cau|cau tiep theo)\b/.test(q))return 'practice';
  if(/\b(?:viet lai|rut gon|ngan hon|noi de hieu|de hieu hon|noi don gian|giai thich don gian|bang \d+ cau)\b/.test(q))return 'rewrite';
  if(/\b(?:hoat dong|ke hoach day|tien trinh day)\b/.test(q)&&/\b(?:goi y|thiet ke|to chuc|tao|soan|lap|phut)\b/.test(q))return 'activity';
  if(/\b(?:tao|soan|cho|viet|dat|goi y)\b/.test(q)&&/\b(?:cau hoi|trac nghiem|bai tap)\b/.test(q))return 'questions';
  if(/\b(?:so sanh|khac nhau|khac gi|khac .*the nao|giong nhau)\b/.test(q))return 'comparison';
  return 'knowledge';
}
export function learningGrade(query:string,context:LearningContext):number {
  const explicit=norm(query).match(/\b(?:lop|khoi)\s*([1-5])\b/);
  return explicit?Number(explicit[1]):context.grade || context.station?.grade || 3;
}
const cardsIn=(query:string)=>{
  const q=norm(query);
  const hits=knowledge.map(card=>({card,alias:[card.term,...card.aliases].filter(alias=>contains(q,alias)).sort((a,b)=>b.length-a.length)[0]}))
    .filter(hit=>hit.alias);
  return hits.filter(hit=>!hits.some(other=>other.card.id!==hit.card.id&&other.alias.length>hit.alias.length&&contains(norm(other.alias),hit.alias)))
    .sort((a,b)=>b.alias.length-a.alias.length).map(hit=>hit.card);
};
const result=(query:string,answer:string,card?:typeof knowledge[number],task:LearningTask='knowledge'):LearningResult=>({
  found:true,layer:'common',confidence:'high',answer,normalizedQuery:query,topic:card?.term,task,sources:card?[card.source]:[],
});
const clarify=(query:string,task:LearningTask):LearningResult=>({
  found:true,layer:'common',confidence:'low',normalizedQuery:query,task,pendingTask:task,
  answer:'Bạn muốn thực hiện yêu cầu này về chủ đề nào? Hãy nêu tên, ví dụ: san hô, Hội An, làng nghề; hoặc mở một bài học rồi hỏi lại.',
});
const profileFor=(id:string)=>profiles.find(profile=>profile.id===id);
export function resolveLearningTopic(query:string,context:LearningContext={}) {
  const named=cardsIn(query);
  if(named.length)return named[0];
  const q=norm(query);
  // An explicit unfamiliar subject must not silently inherit the previous lesson.
  if(/\b(?:ve|chu de)\s+/.test(q)&&!/(?:chu de|bai) (?:nay|do|dang hoc)/.test(q))return undefined;
  if(/\b(?:bai|chu de) (?:nay|dang hoc)\b/.test(q)){
    const active=cardsIn([context.hotspot?.titleVi,context.station?.titleVi].filter(Boolean).join(' '));
    if(active.length===1)return active[0];
    return undefined;
  }
  const previous=cardsIn(context.previousTopic || context.previousQuery || '');
  if(previous.length===1)return previous[0];
  const local=cardsIn([context.hotspot?.titleVi,context.station?.titleVi].filter(Boolean).join(' '));
  return local.length===1?local[0]:undefined;
}
export function learningExplanation(topicId:string,grade:number):string {
  const card=knowledge.find(item=>item.id===topicId),profile=profileFor(topicId);
  if(!card)return '';
  return grade<=2&&profile?profile.young:card.answer;
}
export function presentAssessmentQuestion(item:typeof assessmentBank[number],seed:string):typeof assessmentBank[number] {
  const shift=[...seed].reduce((sum,char)=>sum+char.charCodeAt(0),0)%item.options.length;
  return {...item,options:[...item.options.slice(shift),...item.options.slice(0,shift)],correctIndex:(item.correctIndex-shift+item.options.length)%item.options.length};
}
function misconception(query:string,context:LearningContext):LearningResult|null {
  const q=norm(query),grade=learningGrade(query,context);
  const checks:[string,RegExp,RegExp,string][]=[
    ['san-ho',/\bsan ho\b/,/\b(?:la|thuoc|phai la) (?:mot loai )?(?:cay|thuc vat)\b|\bkhong phai (?:la )?dong vat\b/,'San hô là động vật. Hình dáng giống cành cây không có nghĩa san hô là thực vật.'],
    ['tay-trang',/\bsan ho\b.*\b(?:trang|tay trang)\b/,/\b(?:da chet|chet roi|chac chan chet)\b/,'San hô tẩy trắng chưa nhất thiết đã chết. Nó đang dễ bị tổn thương và cần điều kiện phù hợp để phục hồi.'],
    ['boc-hoi',/\b(?:boc hoi|vung nuoc kho|nuoc kho)\b/,/\b(?:bien mat|mat han|khong con ton tai)\b/,'Khi bốc hơi, nước chuyển từ dạng lỏng sang hơi nước đi vào không khí, không biến mất hoàn toàn.'],
    ['khi-hau',/\bkhi hau\b/,/\b(?:mot ngay|hom nay|mot buoi)\b.*\b(?:du|ket luan|quyet dinh)\b/,'Một ngày nắng hoặc mưa chưa đủ để kết luận khí hậu. Khí hậu được nhận biết từ đặc điểm thời tiết qua nhiều năm.'],
  ];
  if(/\bhoi an\b/.test(q)&&/\b(?:unesco|di san the gioi)\b/.test(q)&&/\b(?:ghi danh|cong nhan)\b/.test(q)){
    const years=[...q.matchAll(/\bnam (\d{4})\b/g)];
    if(years.length===1&&/^(?:(?:do thi co|pho co) )?hoi an (?:co phai )?(?:(?:khong|chua) )?(?:duoc )?(?:unesco )?(?:ghi danh|cong nhan) (?:la )?(?:di san (?:van hoa )?the gioi )?nam \d{4}(?: (?:dung khong|phai khong|khong))?$/.test(q)){
      const card=knowledge.find(item=>item.id==='hoi-an-on-tap')!;
      const negative=/\b(?:khong|chua) (?:duoc )?(?:unesco )?(?:ghi danh|cong nhan)\b/.test(q);
      const correct=(Number(years[0][1])===1999)!==negative;
      return result(query,(correct?'Đúng rồi. ':'Cần sửa lại ý này: ')+learningExplanation(card.id,grade),card);
    }
  }
  if(/\bsan ho\b/.test(q)&&/\b(?:song|o) tren can\b/.test(q)){
    const card=knowledge.find(item=>item.id==='san-ho')!;
    return result(query,'San hô là động vật sống ở biển. Không thể kết luận san hô sống trên cạn từ việc hình dáng giống cành cây.',card);
  }
  if(/\bhay\b/.test(q))return null;
  if(/^san ho (?:co phai la |co phai |la |thuoc nhom |khong phai la |khong phai |chang phai la )?(?:dong vat|thuc vat|cay)(?: (?:dung khong|phai khong|khong|ko))?$/.test(q)){
    const card=knowledge.find(item=>item.id==='san-ho')!;
    const plant=/thuc vat|cay/.test(q),negative=/khong phai|chang phai/.test(q);
    const correct=plant?negative:!negative;
    return result(query,(correct?'Đúng rồi. ':'Cần sửa lại ý này: ')+(grade<=2?profileFor(card.id)!.young:card.answer),card);
  }
  for(const [id,subject,claim,correction] of checks){
    if(subject.test(q)&&claim.test(q)){
      const card=knowledge.find(item=>item.id===id)!;
      const answer=grade<=2?correction:correction+' '+card.answer;
      return result(query,'Cần sửa lại ý này: '+answer,card);
    }
  }
  return null;
}

function readRequestedCount(q:string):number|undefined {
  const hit=q.match(/\b(\d+|mot|hai|ba|bon|nam)\s*cau(?: hoi| trac nghiem| tu luan)?\b/);
  if(!hit)return undefined;
  const words:Record<string,number>={mot:1,hai:2,ba:3,bon:4,nam:5};
  return words[hit[1]]??Number(hit[1]);
}

function stationMaterial(query:string,context:LearningContext) {
  const q=norm(query),station=context.station;
  const hotspot=context.hotspot || station?.hotspots[0];
  if(!station||!hotspot?.narrationVi?.trim())return undefined;
  const explicit=/\b(?:ve|chu de)\s+/.test(q);
  if(explicit&&!contains(q,station.titleVi)&&!contains(q,hotspot.titleVi)&&!/(?:bai|chu de) (?:nay|do|dang hoc)/.test(q))return undefined;
  return {topic:hotspot.titleVi.replace(/^\d+[.)]\s*/,''),answer:hotspot.narrationVi,sources:[{label:'Học liệu trong ứng dụng: '+station.titleVi}],id:station.id+':'+hotspot.id};
}
export function handleLearningRequest(query:string,context:LearningContext={}):LearningResult|null {
  if(context.stage===2&&context.audience!=='teacher')return null;
  // Resume only a short subject-only reply. A new full request always wins.
  const subject=cardsIn(query);
  if(context.pendingTask&&subject.length&&detectLearningTask(query)==='knowledge'&&
    /^(?:ve |chu de )?[^?!.:]+$/.test(norm(query))&&norm(query).split(' ').length<=8&&
    !/\b(?:la|phai|vi sao|tai sao|the nao|o dau|vi du|mo|tim|lop)\b/.test(norm(query))){
    const verbs:Record<LearningTask,string>={knowledge:'Giải thích',comparison:'So sánh',questions:'Tạo 3 câu hỏi',activity:'Gợi ý hoạt động 5 phút',rewrite:'Viết lại dễ hiểu',practice:'Hỏi em một câu'};
    const prior=context.previousQuery&&detectLearningTask(context.previousQuery)===context.pendingTask?context.previousQuery:verbs[context.pendingTask];
    query=prior+' về '+query;
  }
  const task=detectLearningTask(query),q=norm(query),teacher=context.audience==='teacher',grade=learningGrade(query,context);
  if(task==='knowledge'){
    const correction=misconception(query,context);if(correction)return correction;
    if(/\b(?:cho vi du|lay vi du)\b/.test(q)){
      const card=resolveLearningTopic(query,context),profile=card&&profileFor(card.id);
      if(card&&profile)return result(query,'Ví dụ: '+profile.example,card);
    }
    return null;
  }
  const requestedCount=readRequestedCount(q);
  if(task==='questions'&&requestedCount!==undefined&&(requestedCount<1||requestedCount>5))return {...clarify(query,task),pendingTask:undefined,answer:'Mỗi lượt tôi có thể soạn từ 1 đến 5 câu hỏi có căn cứ. Bạn hãy yêu cầu tối đa 5 câu, rồi tiếp tục ở lượt sau.'};
  const requestedMinutes=Number(q.match(/\b(\d+)\s*phut\b/)?.[1]||5);
  if(task==='activity'&&(requestedMinutes<3||requestedMinutes>20))return {...clarify(query,task),pendingTask:undefined,answer:'Khung hoạt động hiện hỗ trợ từ 3 đến 20 phút. Bạn hãy chọn thời lượng trong khoảng này để tôi phân bổ đủ bước và kiểm tra cuối hoạt động.'};
  const named=task==='comparison'?(()=>{const direct=knowledge.filter(card=>contains(q,card.term));return direct.length===2?direct:cardsIn(query);})():cardsIn(query);
  if(task==='comparison'){
    if(named.length!==2)return clarify(query,task);
    const [a,b]=named;
    const key=[a.id,b.id].sort().join('|');
    const distinctions:Record<string,string>={
      'khi-hau|thoi-tiet':'Thời tiết nói về lúc cụ thể và có thể đổi nhanh; khí hậu cho biết đặc điểm thường gặp qua nhiều năm.',
      'boi-tu|xoi-mon':'Xói mòn lấy vật liệu khỏi một nơi; bồi tụ làm vật liệu lắng lại ở nơi khác.',
      'ken-tam|lua':'Kén là nguồn nguyên liệu lấy tơ; lụa là tấm vải được dệt từ sợi tơ.',
      'lua|uom-to':'Ươm tơ là lấy và thu sợi tơ từ kén; dệt tạo ra tấm lụa từ những sợi tơ.',
    };
    return {...result(query,`**${a.term}:** ${learningExplanation(a.id,grade)}\n\n**${b.term}:** ${learningExplanation(b.id,grade)}${distinctions[key]?'\n\n**Phân biệt:** '+distinctions[key]:''}`,a,task),sources:[...new Map([a.source,b.source].map(source=>[source.url,source])).values()]};
  }
  const card=resolveLearningTopic(query,context),profile=card&&profileFor(card.id);
  if(!card||!profile){
    const material=stationMaterial(query,context);
    if(!material)return clarify(query,task);
    const sentences=material.answer.split(/(?<=[.!?])\s+/).filter(Boolean);
    if(task==='rewrite')return {...result(query,sentences.slice(0,2).join(' '),undefined,task),topic:material.topic,sources:material.sources};
    if(task==='practice')return {...result(query,`Em hãy nêu một điều đã biết về ${material.topic}.`,undefined,task),topic:material.topic,sources:material.sources,practice:{id:material.id,topicId:material.id,topic:material.topic,question:`Em hãy nêu một điều đã biết về ${material.topic}.`,answer:sentences.slice(0,2).join(' '),explanation:'Đối chiếu câu trả lời với học liệu; phần tự đối chiếu này không được chấm điểm tự động.'}};
    if(task==='questions'){
      const prompts=[
        [`Bài học nói gì về ${material.topic}?`,sentences.slice(0,2).join(' ')],
        ['Em chọn chi tiết nào trong bài để giới thiệu?','Chọn một chi tiết đúng trong học liệu và nói rõ căn cứ.'],
        ['Em kiểm tra thông tin vừa học bằng cách nào?','Đọc lại học liệu, chú thích nguồn và hỏi giáo viên khi còn chưa rõ.'],
        ['Chi tiết nào trong bài khiến em muốn tìm hiểu thêm?','Nêu chi tiết trong học liệu và một câu hỏi liên quan.'],
        ['Em giới thiệu chủ đề này cho bạn bằng lời của mình thế nào?','Nêu một ý đúng và chỉ căn cứ trong học liệu.'],
      ];
      return {...result(query,(/trac nghiem/.test(q)?'Chưa có bộ trắc nghiệm đối chiếu cho học liệu này. Dưới đây là câu tự luận.\n\n':'')+prompts.slice(0,requestedCount??3).map(([question,answer],i)=>`**Câu ${i+1}. ${question}**\nGợi ý đáp án: ${answer}`).join('\n\n'),undefined,task),topic:material.topic,sources:material.sources};
    }
    const duration=Math.max(3,Math.min(20,Number(q.match(/\b(\d+)\s*phut\b/)?.[1]||5)));
    const first=duration===3?.5:1,middle=duration-first-2;
    return {...result(query,`**Hoạt động ${duration} phút: ${material.topic}**\n${first} phút: Quan sát ảnh và đọc nội dung.\n${middle} phút: Mỗi cặp chọn một chi tiết có căn cứ để giới thiệu.\n1 phút: Chia sẻ và chỉ căn cứ trong học liệu.\n1 phút: Giáo viên kiểm tra một chi tiết học sinh vừa nêu.\n**Kiểm tra:** Chi tiết phải đúng với học liệu; không tự thêm số liệu.`,undefined,task),topic:material.topic,sources:material.sources};
  }
  if(task==='rewrite'){
    const count=q.match(/\b(?:bang|thanh|trong|gon|con)\s*([1-4])\s*cau\b/)?.[1];
    const sentences=(grade<=2?profile.young:card.answer).split(/(?<=[.!?])\s+/).filter(Boolean);
    if(count){const extra=[profile.example,profile.applicationAnswer].flatMap(text=>text.split(/(?<=[.!?])\s+/));const unique=[...new Set([...sentences,...extra])];const selected=unique.slice(0,Number(count));return result(query,selected.join(' ')+(selected.length<Number(count)?'\nTôi chỉ giữ các ý đã có căn cứ, nên đoạn này ngắn hơn số câu yêu cầu.':''),card,task);}
    return result(query,(grade<=2?profile.young:card.answer)+'\nVí dụ: '+profile.example,card,task);
  }
  if(task==='practice'){
    // Practice never exposes the reserved pre/post assessment items.
    const sequence=Math.max(0,Math.floor(context.practiceIndex||0))%3;
    const prompts=[
      {question:`Em giải thích ${card.term} bằng lời của mình nhé.`,answer:learningExplanation(card.id,grade),hint:'Em thử nhớ điều quan trọng nhất về chủ đề, rồi nói một câu ngắn.'},
      {question:`Em nêu một ví dụ về ${card.term} nhé.`,answer:profile.example,hint:'Em nghĩ đến một điều đã quan sát hoặc một tình huống quen thuộc.'},
      {question:profile.applicationQuestion,answer:profile.applicationAnswer,hint:'Em chọn cách làm hoặc cách giải thích, rồi nói vì sao mình chọn.'},
    ];
    const prompt=prompts[sequence];
    const practice:PracticeQuestion={id:card.id+'-practice-'+sequence,topicId:card.id,topic:card.term,...prompt,explanation:'Em đối chiếu ý chính; không cần giống từng chữ. Nếu còn phân vân, hãy nhờ thầy cô góp ý.',sequence};
    return {...result(query,'Em thử trả lời câu dưới đây trước khi xem phản hồi nhé.',card,task),practice};
  }
  if(task==='questions'){
    const count=requestedCount??3;
    const items=assessmentBank.filter(item=>item.topicId===card.id);
    if(/trac nghiem/.test(q)&&items.length>=count){
      const chosen=items.slice(0,Math.min(count,items.length)).map((item,index)=>presentAssessmentQuestion(item,query+index));
      return result(query,chosen.map((item,index)=>`**Câu ${index+1}. ${item.question}**\n${item.options.map((option,i)=>String.fromCharCode(65+i)+'. '+option).join('\n')}\nĐáp án: ${String.fromCharCode(65+item.correctIndex)}. ${item.explanation}`).join('\n\n'),card,task);
    }
    const questions=[
      {question:/(?:la gi|vi sao|nam nao|bao nhieu)/.test(norm(card.term))?card.term+'?':`Em hiểu ${card.term} là gì?`,answer:learningExplanation(card.id,grade)},
      {question:`Em nêu một ví dụ giúp hiểu ${card.term}.`,answer:profile.example},
      {question:profile.applicationQuestion,answer:profile.applicationAnswer},
      {question:'Em dựa vào nguồn nào để kiểm tra thông tin vừa học?',answer:card.source.label+'. Đọc thông tin và đối chiếu, không tự thêm dữ kiện.'},
      {question:`Em sẽ giới thiệu ${card.term} với bạn bằng điều gì có căn cứ?`,answer:learningExplanation(card.id,grade)},
    ];
    const intro=/trac nghiem/.test(q)?'Kho hiện chưa đủ số câu trắc nghiệm đã đối chiếu cho yêu cầu này. Dưới đây là đủ số câu tự luận kèm gợi ý đáp án.\n\n':'';
    return result(query,intro+questions.slice(0,count).map((item,index)=>`**Câu ${index+1}. ${item.question}**\nGợi ý đáp án: ${item.answer}`).join('\n\n'),card,task);
  }
  const minutes=Math.max(3,Math.min(20,Number(q.match(/\b(\d+)\s*phut\b/)?.[1]||5)));
  const protect=/bao ve|giu gin/.test(q)&&/san ho/.test(q);
  const prompt=protect?'Đi tham quan rạn san hô, em nên làm gì để bảo vệ rạn?':profile.applicationQuestion;
  const expected=protect?'Không bẻ, không giẫm lên san hô; giữ vệ sinh và thực hiện nội quy tham quan.':profile.applicationAnswer;
  const first=minutes===3?.5:1,middle=minutes-first-2;
  return result(query,`**Hoạt động ${minutes} phút · Lớp ${grade} · ${card.term}**\n**Mục tiêu:** ${protect?'Chọn được việc làm phù hợp để bảo vệ rạn san hô.':`Nêu được ý chính về ${card.term} và vận dụng vào một tình huống.`}\n**Chuẩn bị:** Ảnh hoặc thẻ chữ phù hợp, nội dung nguồn bên dưới.\n**${first} phút — Khởi động:** ${grade<=2?'Quan sát và gọi tên điều nhìn thấy.':'Nêu điều đã biết; giáo viên ghi lại một nhận định cần kiểm tra.'}\n**${middle} phút — Khám phá:** ${protect?'Dùng tranh hai hành động: giữ gìn rạn và làm hỏng rạn; học sinh chọn và giải thích.':card.teachingExample}\n**1 phút — Vận dụng:** ${prompt}\n**1 phút — Kiểm tra:** ${grade<=2?'Mời học sinh nói một câu hoặc chỉ tranh.':'Yêu cầu nêu lựa chọn và một lý do có căn cứ.'}\n**Gợi ý đáp án / tiêu chí:** ${expected}\n**Điều chỉnh:** ${grade<=2?'Cho học sinh chỉ tranh hoặc trả lời miệng; giáo viên đọc câu hỏi.':'Cho học sinh trao đổi theo cặp rồi tự giải thích trước lớp.'}`,card,task);
}
export function adaptLearningResult<T extends {found:boolean;answer:string;matchedEntryId?:string;topic?:string;followUp?:string;teachingExample?:string}>(original:T,query:string,context:LearningContext):T {
  if(!original.found||(!context.grade&&!context.station?.grade&&!/\b(?:lop|khoi)\s*[1-5]\b/.test(norm(query))))return original;
  const card=original.matchedEntryId?.startsWith('expanded-')?knowledge.find(card=>card.id===original.matchedEntryId!.slice(9)):undefined;
  const profile=card&&profileFor(card.id);if(!card||!profile)return original;
  const grade=learningGrade(query,context);
  return {...original,answer:grade<=2?profile.young:original.answer,followUp:context.audience==='teacher'?original.followUp:grade>=3?profile.applicationQuestion:undefined};
}
