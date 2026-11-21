/** Source-backed knowledge independent of the learning stations.
 * Entities and categories, rather than individual question templates, support
 * listing, classification, definitions and follow-up questions.
 */
import { normalizeDanangDialect } from '../data/danangAssistantLexicon';

type Source = {label:string;url:string};
type Group = 'craft' | 'game';
type Entity = {name:string;aliases:string[];group:Group;summary:string;source:Source;how?:string};
export type LocalKnowledgeAnswer = {answer:string;sources:Source[];found:boolean};
const normalize=(s:string)=>normalizeDanangDialect(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
const contains=(q:string,term:string)=>(` ${q} `).includes(` ${normalize(term)} `);
const craftSource={label:'Cổng thông tin Đà Nẵng – Làng nghề',url:'https://cttdt.danangportal.gov.vn/vi/web/dng/lang-nghe'};
const gamesSource={label:'Đại học Duy Tân – Nghiên cứu bảo tồn trò chơi dân gian Hội An (2024)',url:'https://files02.duytan.edu.vn/svruploads/dtu-duytan/upload/file/638644945571487644-24%2866%29.-B%E1%BA%A3o-t%E1%BB%93n-v%C3%A0-ph%C3%A1t-huy-tr%C3%B2-ch%C6%A1i-d%C3%A2n-gian-%E1%BB%9F-th%C3%A0nh-ph%E1%BB%91-H%E1%BB%99i-An%2C-t%E1%BB%89nh-Qu%E1%BA%A3ng-Nam-%28L%C3%AA-Th%E1%BB%8B-Di%E1%BB%87u-Mi%29.pdf'};
const hideSource={label:'Trường Mầm non Bồ Đề – Trò chơi dân gian: Trốn tìm',url:'https://mnbode.hanoi.edu.vn/tro-choi-cho-be/tro-choi-dan-gian-tron-tim/ctmb/9344/637577'};
const craftRows=[
 ['Chiếu Cẩm Nê','Cẩm Nê','dệt chiếu'],
 ['Đá mỹ nghệ Non Nước','làng đá Non Nước','chế tác đá mỹ nghệ'],
 ['Nước mắm Nam Ô','Nam Ô','làm nước mắm'],
 ['Bánh tráng Túy Loan','Túy Loan','làm bánh tráng'],
 ['Bánh khô mè Cẩm Lệ','khô mè Cẩm Lệ','làm bánh khô mè'],
] as const;
const entities:Entity[]=[
 ...craftRows.map(([name,alias,product])=>({name,aliases:[name,alias],group:'craft' as const,summary:`${name} gắn với nghề ${product} truyền thống ở Đà Nẵng.`,source:craftSource})),
 {name:'Gốm Thanh Hà',aliases:['gốm Thanh Hà','làng gốm Thanh Hà','Thanh Hà'],group:'craft',summary:'Làng gốm Thanh Hà ở Hội An gắn với nghề làm gốm thủ công truyền thống.',source:{label:'UBND phường Hội An Tây – Làng gốm Thanh Hà',url:'https://hoiantay.danang.gov.vn/van-hoa-du-lich/lang-gom-thanh-ha-lang-nghe-ruc-ro-sac-xuan-325122'}},
 {name:'Đúc đồng Phước Kiều',aliases:['đúc đồng Phước Kiều','Phước Kiều'],group:'craft',summary:'Làng nghề Phước Kiều gắn với nghề đúc đồng, nổi tiếng với các sản phẩm như chuông và cồng chiêng.',source:{label:'Cổng thông tin Điện Bàn – Đúc đồng Phước Kiều',url:'https://dienban.danang.gov.vn/chi-tiet-tin/group/131/nid/4326/default'}},
 {name:'Trốn tìm',aliases:['trốn tìm','ú tim','năm mười'],group:'game',summary:'Trốn tìm là trò chơi dân gian quen thuộc: một người đi tìm, những người còn lại đi trốn trong phạm vi đã thống nhất.',how:'Các bạn thống nhất phạm vi chơi an toàn. Một bạn nhắm mắt và đếm theo thỏa thuận, các bạn khác đi trốn. Đếm xong, bạn đó đi tìm. Luật đổi người tìm có thể khác nhau giữa các nhóm; cần thống nhất trước khi chơi.',source:hideSource},
 ...['Kéo co','Nhảy bao bố','Bịt mắt bắt dê','Rồng rắn lên mây','Nhảy dây','Cướp cờ','Ô ăn quan','Chuyền thẻ'].map(name=>({name,aliases:[name,...(name==='Nhảy bao bố'?['nhảy bao']:[])],group:'game' as const,summary:`${name} là một trò chơi dân gian. Các nhóm cần thống nhất luật chơi và chọn chỗ chơi an toàn.`,source:gamesSource})),
];
const groups:Record<Group,{label:string;aliases:string[];definition:string}>={
 craft:{label:'làng nghề truyền thống',aliases:['làng nghề','làng nghề truyền thống','nghề truyền thống','nghề thủ công'],definition:'Làng nghề là nơi có nhiều hộ cùng làm một hoặc một số nghề. Làng nghề truyền thống gìn giữ kỹ năng, sản phẩm và kinh nghiệm được trao truyền qua các thế hệ.'},
 game:{label:'trò chơi dân gian',aliases:['trò chơi dân gian','trò dân gian'],definition:'Trò chơi dân gian là những trò chơi được cộng đồng lưu truyền qua nhiều thế hệ, gắn với sinh hoạt và văn hóa của người dân.'},
};
const uniqueSources=(items:Entity[])=>[...new Map(items.map(e=>[e.source.url,e.source])).values()];
export function resolveLocalEducationFollowUp(query:string,previousQuery?:string):string {
 const q=normalize(query);
 if(!previousQuery || !/^(?:vay |the |rua )?(?:choi the nao|cach choi|choi ra sao|tro nay choi the nao|tro do choi the nao|no la gi|co phai tro choi dan gian khong)\b/.test(q)) return query;
 const previous=normalize(previousQuery);
 const matches=entities.filter(e=>e.aliases.some(a=>contains(previous,a)));
 return matches.length===1?`${matches[0].name}: ${query}`:query;
}
export function answerLocalEducationQuestion(query:string):LocalKnowledgeAnswer|null {
 const q=normalize(query);
 const named=entities.filter(e=>e.aliases.some(a=>contains(q,a)));
 const categories=(Object.keys(groups) as Group[]).filter(g=>groups[g].aliases.some(a=>contains(q,a)));
 const confirmation=/co phai|phai (?:khong|ko|k)|dung (?:khong|ko)|phai la|(?:khong|ko) phai/.test(q);
 const listing=/ke ten|liet ke|ke vai|ke mot so|vi du|nhung .*nao|co .*gi|co .*nao|gom|nhung gi/.test(q);
 if(named.length===1){
  const entity=named[0];
  if(confirmation && categories.length===1){
   const matches=entity.group===categories[0];
   // Correct a negative premise rather than blindly affirming it.
   const negative=/(?:khong|ko) phai/.test(q);
   return {found:true,answer:`${negative?'Thực ra, ':matches?'Đúng rồi! ':'Không. '}${entity.name} ${matches?'là':'không phải là'} ${groups[categories[0]].label}. ${entity.summary}`,sources:[entity.source]};
  }
  if(/cach choi|choi the nao|choi ra sao|luat choi|huong dan choi/.test(q)){
   return entity.how?{found:true,answer:`${entity.name}: ${entity.how}`,sources:[entity.source]}:
    {found:false,answer:`Mình biết ${entity.name} thuộc nhóm ${groups[entity.group].label}, nhưng chưa có hướng dẫn chi tiết đã đối chiếu cho câu hỏi này. Bạn muốn tìm hiểu đặc điểm hay kể tên những ví dụ khác?`,sources:[entity.source]};
  }
  // Specific dates, prices, locations or materials must use fact-specific evidence.
  if(/nam nao|bao gio|bao nhieu|o dau|nam o|dia chi|vi tri|nguyen lieu|vat lieu|lam tu|lam bang|tai sao|vi sao/.test(q)) return null;
  if(/la gi|the nao|gioi thieu|tim hieu|noi ve|ke ve/.test(q) || entity.aliases.some(a=>normalize(a)===q))
   return {found:true,answer:entity.summary,sources:[entity.source]};
 }
 if(categories.length===1 && !named.length){
  const g=categories[0],group=groups[g];
  // Unknown named subjects in yes/no questions must not become a generic list.
  if(confirmation) return {found:false,answer:`Bạn đang muốn xác nhận điều gì có phải ${group.label} không? Hãy nêu rõ tên để mình trả lời đúng đối tượng nhé.`,sources:[]};
  if(listing || group.aliases.some(a=>normalize(a)===q)){
   if(g==='craft' && !/da nang|que huong|dia phuong/.test(q) && /ha noi|hue|sai gon|ho chi minh|sao hoa|sao kim|nhat ban|trung quoc|nuoc phap|nuoc my/.test(q)) return null;
   const selected=entities.filter(e=>e.group===g);
   const names=selected.map(e=>e.name).join(', ');
   return {found:true,answer:g==='craft'?`Một số làng nghề và nghề truyền thống tiêu biểu ở Đà Nẵng có: ${names}. Đây là các ví dụ, không phải danh sách đầy đủ. Bạn muốn tìm hiểu nghề nào?`:`Một số trò chơi dân gian gồm: ${names}. Mỗi trò có cách chơi riêng; bạn muốn tìm hiểu trò nào?`,sources:uniqueSources(selected)};
  }
  if(/la gi|nghia la/.test(q)) return {found:true,answer:group.definition,sources:[g==='craft'?craftSource:gamesSource]};
 }
 return null;
}

type ReviewedSubject = {
  topic: string;
  names: RegExp;
  source: Source;
  summary?: string;
  facts: {intent: RegExp; answer: string}[];
};

const hoiAnSource = {label: 'UNESCO – Đô thị cổ Hội An', url: 'https://whc.unesco.org/en/list/948/'};
const bridgeSource = {label: 'Trung tâm Quản lý Bảo tồn Di sản Văn hóa Hội An – Chùa Cầu', url: 'https://hoianheritage.danang.gov.vn/vi/di-san-van-hoa/Cau/Chua-Cau-134.html'};
const potterySource = {label: 'Trung tâm Quản lý Bảo tồn Di sản Văn hóa Hội An – Nghề gốm Thanh Hà', url: 'https://hoianheritage.danang.gov.vn/vi/di-san-van-hoa/Nghe-thu-cong-truyen-thong/Nghe-gom-Thanh-Ha-181.html'};
const gardenSource = {label: 'Trung tâm Quản lý Bảo tồn Di sản Văn hóa Hội An – Nghề trồng rau Trà Quế', url: 'https://hoianheritage.danang.gov.vn/vi/trao-doi-chuyen-nganh/chuyen-de-nghien-cuu-trao-doi/nghe-trong-rau-tra-que-qua-trinh-xay-dung-ho-so-cong-nhan-di-san-van-hoa-phi-vat-the-quoc-gia-995.html'};
const camNeSource = {label: 'Báo Đà Nẵng – Nghề dệt chiếu Cẩm Nê', url: 'https://baodanang.vn/nguoi-lam-chieu-cuoi-cung-tren-dat-cam-ne-3287044.html'};
const banThachSource = {label: 'Báo Đà Nẵng – Làng chiếu truyền thống Bàn Thạch', url: 'https://baodanang.vn/lang-chieu-truyen-thong-ban-thach-tim-cach-phuc-vu-du-khach-3154492.html'};
const biosphereSource = {label: 'UNESCO – Khu dự trữ sinh quyển Cù Lao Chàm–Hội An', url: 'https://www.unesco.org/en/mab/cu-lao-cham-hoi?hub=66369'};
const primateSource = {label: 'Cổng thông tin Đà Nẵng – Voọc chà vá chân nâu', url: 'https://bana.danang.gov.vn/vi/web/dng-old/w/t%E1%BB%95ng-quan-v%E1%BB%81-vo%E1%BB%8Dc-ch%C3%A0-v%C3%A1-ch%C3%A2n-n%C3%A2u-pygathrix-nemaeus-'};
const material = /\b(?:nguyen lieu|vat lieu|lam (?:tu|bang) (?:gi|cay gi)|det (?:tu|bang) (?:gi|cay gi)|dung (?:cay|soi|dat) gi)\b/;

const hoiAn: ReviewedSubject = {
  topic: 'Hội An',
  names: /\b(?:pho co hoi an|do thi co hoi an|hoi an)\b/,
  source: hoiAnSource,
  facts: [
    {
      intent: /\b(?:vi sao|tai sao|ly do)\b.*\b(?:unesco|ghi danh|cong nhan|di san)\b/,
      answer: 'Hội An từng là một thương cảng, nơi thuyền bè đến buôn bán. Đường phố và nhiều ngôi nhà cổ vẫn lưu lại dấu tích của thương cảng và sự gặp gỡ giữa nhiều nền văn hóa. Đó là những giá trị UNESCO ghi nhận khi đưa đô thị cổ Hội An vào Danh mục Di sản thế giới.',
    },
    {
      intent: /\b(?:giu gin|bao ve|ung xu)\b.*\b(?:di san|pho co|hoi an)\b|\b(?:viet|ve|khac) len (?:tuong|nha|cua) (?:co|di tich)\b/,
      answer: 'Khi tham quan phố cổ, em đi theo lối hướng dẫn, bỏ rác đúng chỗ và giữ nguyên bề mặt nhà, cửa, tường cổ. Nếu thấy bạn định viết lên tường, em có thể nhắc nhẹ và báo người lớn. Một vết viết nhỏ cũng có thể làm hỏng bề mặt cũ.',
    },
  ],
};
const bridge: ReviewedSubject = {
  topic: 'Chùa Cầu',
  names: /\b(?:chua cau|lai vien kieu|cau nhat ban)\b/,
  source: bridgeSource,
  summary: 'Chùa Cầu là một cây cầu có mái che ở phố cổ Hội An. Bên cầu có một ngôi miếu nhỏ. Em có thể nhìn ảnh để tìm phần mái phía trên và lối đi qua cầu phía dưới.',
  facts: [{
    intent: /\b(?:vi sao|tai sao|sao)\b.*\b(?:goi ten nhu vay|goi .+ la chua cau|ten (?:la|chua cau)|chua cau .+ goi)\b|\b(?:co phai|la) (?:mot )?(?:ngoi )?chua\b/,
    answer: 'Cạnh phần cầu có một ngôi miếu. Người địa phương quen gọi miếu ấy là chùa. Hai tiếng chùa và cầu ghép lại thành tên Chùa Cầu. Nhìn ảnh, em thử chỉ lối qua cầu và phần miếu nhé.',
  }, {
    intent: material,
    answer: 'Ở Chùa Cầu, móng và trụ xây bằng đá. Khung và sàn cầu làm bằng gỗ. Mái được lợp ngói. Nhìn ảnh, em thử chỉ ba phần này nhé.',
  }],
};
const pottery: ReviewedSubject = {
  topic: 'Gốm Thanh Hà',
  names: /\b(?:lang gom thanh ha|gom thanh ha|thanh ha)\b/,
  source: potterySource,
  summary: 'Thanh Hà ở Hội An có nghề làm gốm truyền thống. Người thợ tạo hình đất trên bàn xoay để làm những đồ vật như chum, nồi hoặc bình.',
  facts: [{
    intent: material,
    answer: 'Người thợ gốm Thanh Hà dùng đất sét. Họ xử lý đất, tạo hình, làm khô rồi nung để đồ gốm cứng hơn.',
  }],
};
const garden: ReviewedSubject = {
  topic: 'Làng rau Trà Quế',
  names: /\b(?:lang rau tra que|tra que)\b/,
  source: gardenSource,
  summary: 'Trà Quế ở Hội An có nghề trồng rau truyền thống, nổi tiếng với các loại rau thơm. Khi xem ảnh, em thử tìm luống rau và kể một việc người trồng rau cần làm để chăm cây.',
  facts: [{
    intent: /\b(?:trong rau|bon rau|rau)\b.*\b(?:rong|phan bon|phan gi)\b|\b(?:dung|bon) (?:loai )?(?:phan|rong) gi\b/,
    answer: 'Một cách chăm rau truyền thống ở Trà Quế là dùng rong lấy từ đầm Trà Quế để bón. Đây là kinh nghiệm của người trồng rau tại làng.',
  }],
};
const camNe: ReviewedSubject = {
  topic: 'Chiếu Cẩm Nê', names: /\b(?:chieu cam ne|cam ne)\b/, source: camNeSource,
  facts: [{intent: material, answer: 'Chiếu Cẩm Nê dùng sợi cói, lác để dệt. Người thợ đưa từng sợi qua khung dệt để các sợi đan thành tấm chiếu.'}],
};
const banThach: ReviewedSubject = {
  topic: 'Chiếu Bàn Thạch', names: /\b(?:chieu ban thach|ban thach)\b/, source: banThachSource,
  summary: 'Bàn Thạch có nghề dệt chiếu từ cây cói, còn gọi là cây lác. Người thợ dùng khung dệt để đan các sợi thành tấm chiếu.',
  facts: [{intent: material, answer: 'Nguyên liệu dệt chiếu Bàn Thạch là cói, còn gọi là lác. Người thợ phơi sợi trước khi đưa lên khung dệt.'}],
};
const biosphere: ReviewedSubject = {
  topic: 'Cù Lao Chàm–Hội An',
  names: /\bcu lao cham(?: hoi an)?\b/,
  source: biosphereSource,
  facts: [{
    intent: /\b(?:co phai|phai khong|dung khong|hay)\b.*\b(?:di san|sinh quyen)\b|\bdi san (?:van hoa )?the gioi\b/,
    answer: 'Cù Lao Chàm–Hội An được UNESCO ghi nhận là khu dự trữ sinh quyển năm 2009. Đô thị cổ Hội An được UNESCO ghi danh Di sản thế giới năm 1999. Hai tên này thuộc hai chương trình khác nhau của UNESCO.',
  }],
};
const primate: ReviewedSubject = {
  topic: 'Voọc chà vá chân nâu',
  names: /\b(?:vooc cha va chan nau|vooc o son tra|vooc son tra)\b/,
  source: primateSource,
  facts: [
    {intent: /\b(?:an gi|thuc an|an la|an qua)\b/, answer: 'Voọc chà vá chân nâu ăn chủ yếu là lá, đặc biệt là lá non. Chúng cũng ăn một số phần khác của cây. Khi quan sát voọc, em giữ khoảng cách và để chúng tự tìm thức ăn trong rừng.'},
    {intent: /\b(?:co nen|duoc|nen|khong nen) cho .*(?:an|banh)\b|\bcho (?:vooc|chung|no) an\b/, answer: 'Em hãy quan sát voọc từ xa và để chúng tự tìm thức ăn trong rừng. Khi đi cùng đoàn tham quan, em thực hiện hướng dẫn của người phụ trách.'},
  ],
};

const reviewedSubjects = [hoiAn, bridge, pottery, garden, camNe, banThach, biosphere, primate];
const comparison = /\b(?:so sanh|khac nhau|khac gi|khac .+ the nao|giong nhau|giong .+ khong|khac biet|phan biet)\b/;
const localComparisons = [
  {subjects: [pottery, garden], answer: 'Thanh Hà giữ nghề làm gốm. Người thợ tạo hình và nung đất để làm đồ dùng. Trà Quế giữ nghề trồng rau. Người dân chuẩn bị luống, trồng và chăm rau. Cả hai đều lưu giữ kỹ năng lao động được trao truyền qua nhiều thế hệ.'},
  {subjects: [camNe, banThach], answer: 'Cẩm Nê và Bàn Thạch đều có nghề dệt chiếu truyền thống và dùng sợi cói, lác. Tư liệu về Bàn Thạch ghi nhận vùng trồng cói từng cung cấp nguyên liệu cho làng. Khi xem ảnh hai làng, em có thể tìm một dụng cụ hoặc công đoạn giống nhau để giải thích.'},
  {subjects: [hoiAn, biosphere], answer: 'Đô thị cổ Hội An được ghi danh Di sản thế giới năm 1999 vì các giá trị của một thương cảng cổ. Cù Lao Chàm–Hội An được ghi nhận là khu dự trữ sinh quyển năm 2009, gắn việc bảo tồn thiên nhiên với đời sống cộng đồng. Cả hai danh hiệu đều do UNESCO ghi nhận trong các chương trình riêng.'},
];

function reviewedSubjectsIn(q: string) {
  const matches = reviewedSubjects.filter(subject => subject.names.test(q));
  if (matches.includes(biosphere) && /\bcu lao cham hoi an\b/.test(q) && !hoiAn.names.test(q.replace(/\bcu lao cham hoi an\b/g, ''))) {
    return matches.filter(subject => subject !== hoiAn);
  }
  return matches;
}

export function answerReviewedLocalFacts(query: string, previousTopic?: string, previousQuery?: string) {
  const q = normalize(query);
  const named = reviewedSubjectsIn(q);
  if (comparison.test(q)) {
    const pair = localComparisons.find(item => named.length === 2 && item.subjects.every(subject => named.includes(subject)));
    if (pair) return {answer: pair.answer, sources: pair.subjects.map(subject => subject.source)};
    return null;
  }

  // A specific place followed by “ở Hội An” is one subject, not a request about both.
  const subjects = named.length === 2 && named.includes(hoiAn) && /\b(?:o|tai) hoi an\b/.test(q)
    ? named.filter(subject => subject !== hoiAn)
    : named;
  // Inherit a subject only for a short, closed set of questions without a new noun.
  const bareFollowUp = /^(?:(?:con|vay|the|rua) )?(?:(?:nguyen lieu|vat lieu) (?:la|gi)(?: gi)?|(?:no |nguoi ta )?(?:lam|det) (?:tu|bang) gi|(?:no |chung )?an gi|(?:co nen |duoc )?cho (?:no|chung) an(?: khong)?|(?:vi sao|tai sao) (?:lai )?(?:goi ten nhu vay|duoc (?:ghi danh|cong nhan)(?: nhu vay)?))(?: (?:a|nhe|vay|rua))?$/.test(q);
  const previous = reviewedSubjectsIn(normalize(previousTopic || previousQuery || ''));
  const subject = subjects.length === 1 ? subjects[0] : !subjects.length && bareFollowUp && previous.length === 1 ? previous[0] : undefined;
  if (!subject) return null;

  // Keep an unfamiliar exact date or quantity out of broader explanatory cards.
  if (/\b(?:nam nao|bao gio|khi nao|bao nhieu|dai bao|cao bao|rong bao)\b/.test(q)) return null;
  const fact = subject.facts.find(item => item.intent.test(q));
  const definition = subject.names.test(q) && /\b(?:la gi|noi tieng ve (?:gi|nghe nao)|co nghe gi|co gi dac biet|co chi dac biet|o do lam nghe gi)\b/.test(q);
  const answer = fact?.answer ?? (definition ? subject.summary : undefined);
  if (!answer) return null;
  const sources = subject === biosphere ? [biosphereSource, hoiAnSource] : [subject.source];
  return {answer, sources, topic: subject.topic};
}
