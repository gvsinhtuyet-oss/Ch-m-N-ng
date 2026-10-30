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
