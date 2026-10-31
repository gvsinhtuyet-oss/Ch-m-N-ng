import { ALL_25_STATIONS } from '../../data/allStations';
import { retrieveDanangAssistantAnswer } from '../../services/DanangAssistantRetrievalService';

/**
 * Admin-only LOCAL diagnostic suite. No question is sent to a model, API,
 * database or analytics service. These are checks, not a proof of learning.
 */
export const QUALITY_DIMENSIONS = {
  accuracy: { label: 'Độ chính xác', weight: 30 },
  language: { label: 'Hiểu cách hỏi', weight: 20 },
  extension: { label: 'Kiến thức mở rộng', weight: 20 },
  context: { label: 'Ngữ cảnh / hỏi tiếp', weight: 10 },
  teacher: { label: 'Hỗ trợ giáo viên', weight: 10 },
  safety: { label: 'An toàn', weight: 10 },
} as const;

export type QualityDimension = keyof typeof QUALITY_DIMENSIONS;
export type QualityCheck = 'context' | 'fact' | 'guard' | 'unknown' | 'manual';
export type QualityRating = 0 | 1 | 2;
export interface QualityCase {
  id: string;
  stationId: string;
  hotspotId?: string;
  question: string;
  dimension: QualityDimension;
  check: QualityCheck;
  audience?: 'student' | 'teacher';
  stage?: number;
  expected?: string[];
  previousQuery?: string;
  previousTopic?: string;
  note: string;
}
export interface QualityResult {
  caseId: string;
  answer: string;
  sources: Array<{label:string;url?:string}>;
  found: boolean;
  relatedStationId?: string;
  layer: string;
  confidence: string;
  durationMs: number;
  autoStatus: 'pass' | 'flag' | 'review';
  diagnostic: string;
}

const REGRESSION_FACTS: QualityCase[] = [
  {id:'fact-hoian-1999',stationId:'g2-station-4',question:'Hội An được UNESCO công nhận năm nào?',dimension:'accuracy',check:'fact',expected:['1999'],note:'Đối chiếu nguồn UNESCO và danh hiệu di sản thế giới.'},
  {id:'fact-culaoc-2009',stationId:'g2-station-2',question:'Cù Lao Chàm được UNESCO ghi nhận năm nào?',dimension:'accuracy',check:'fact',expected:['2009'],note:'Khu dự trữ sinh quyển, không nhầm danh hiệu của Hội An.'},
  {id:'fact-ma-nhai-2022',stationId:'g5-station-4',question:'Ma nhai được ghi danh năm nào?',dimension:'accuracy',check:'fact',expected:['2022'],note:'Danh hiệu di sản tư liệu, kiểm tra nguồn.'},
  {id:'fact-san-ho',stationId:'g2-station-2',question:'San hô là động vật hay thực vật?',dimension:'accuracy',check:'fact',expected:['động vật'],note:'Kiến thức khoa học ngoài bài, nguồn NOAA.'},
  {id:'fact-dienhai-1813',stationId:'g1-station-4',question:'Lịch sử xây Thành Điện Hải bắt đầu năm nào?',dimension:'accuracy',check:'fact',expected:['1813'],note:'Phân biệt dựng bằng đất 1813 và xây gạch 1823.'},
  {id:'fact-vong-nuoc',stationId:'g1-station-3',question:'Vòng tuần hoàn nước là gì?',dimension:'accuracy',check:'fact',expected:['bốc hơi'],note:'Giải thích quá trình, không chỉ nêu tên.'},
  {id:'fact-khi-hau',stationId:'g4-station-1',question:'Khí hậu khác thời tiết thế nào?',dimension:'accuracy',check:'fact',expected:['thời gian dài'],note:'Phân biệt khí hậu và thời tiết.'},
  {id:'fact-lua',stationId:'g5-lua-ma-chau',question:'Ươm tơ là gì?',dimension:'accuracy',check:'fact',expected:['tơ'],note:'Phân biệt ươm tơ và dệt lụa.'},
  {id:'teacher-san-ho',stationId:'g2-station-2',question:'Giải thích san hô là động vật hay thực vật cho học sinh lớp 2',dimension:'teacher',check:'fact',audience:'teacher',expected:['động vật'],note:'Xem nguồn, ví dụ sư phạm và độ phù hợp lứa tuổi.'},
  {id:'teacher-bao-ton',stationId:'g5-station-4',question:'Cho ví dụ về bảo tồn',dimension:'teacher',check:'manual',audience:'teacher',note:'Giáo viên kiểm tra ví dụ có khả thi và chính xác.'},
  {id:'followup-san-ho',stationId:'g2-station-2',question:'Cho ví dụ dễ hiểu',previousQuery:'San hô là động vật hay thực vật?',previousTopic:'san hô',dimension:'context',check:'manual',note:'Phải bám câu trước, không chuyển chủ đề.'},
  {id:'unknown-sao-hoa',stationId:'g4-station-1',question:'Em nên làm gì để bảo vệ sao Hỏa?',dimension:'safety',check:'unknown',note:'Không ghép nhầm lời khuyên bảo vệ môi trường địa phương.'},
  {id:'unknown-nha-guol',stationId:'g3-station-3',question:'Nhà Gươl được xây năm nào?',dimension:'safety',check:'unknown',note:'Không tự bịa năm xây nhà Gươl.'},
  {id:'unknown-san-ho-unesco',stationId:'g2-station-2',question:'San hô được UNESCO công nhận năm nào?',dimension:'safety',check:'unknown',note:'Không nhầm câu hỏi công nhận khu dự trữ sinh quyển.'},
];

const qualityCases: QualityCase[] = [];
for (const station of ALL_25_STATIONS) {
  // These 121 cases check ROUTING ONLY, not factual correctness.
  for (const hotspot of station.hotspots) {
    qualityCases.push({
      id:'route-' + hotspot.id, stationId:station.id, hotspotId:hotspot.id,
      question:'Nơi ni có chi đặc biệt?', dimension:'context', check:'context',
      note:'Kiểm tra truy hồi đúng điểm đang mở, KHÔNG chứng minh câu trả lời đúng kiến thức.',
    });
  }
  qualityCases.push({
    id:'dialect-' + station.id, stationId:station.id, hotspotId:station.hotspots[0]?.id,
    question:'Ở chỗ ni có chi hay rứa?', dimension:'language', check:'manual',
    note:'Đọc câu trả lời để đánh giá hiểu phương ngữ theo ngữ cảnh.',
  });
  qualityCases.push({
    id:'extension-' + station.id, stationId:station.id,
    question:'Vì sao ' + station.titleVi + ' có ý nghĩa với đời sống người dân?',
    dimension:'extension', check:'manual',
    note:'Câu hỏi mở độc lập; chỉ giáo viên xác nhận sau khi đối chiếu tài liệu.',
  });
  qualityCases.push({
    id:'teacher-' + station.id, stationId:station.id, audience:'teacher',
    question:'Thầy cô có thể gợi ý một hoạt động liên môn về ' + station.titleVi + ' không?',
    dimension:'teacher', check:'manual',
    note:'Chấm tính khả thi, tính sư phạm, đúng khối lớp và nguồn kiến thức.',
  });
}
for (const station of ALL_25_STATIONS.filter(s => s.grade >= 1 && s.grade <= 5 && ALL_25_STATIONS.find(x=>x.grade===s.grade)?.id===s.id)) {
  qualityCases.push({
    id:'guard-' + station.id,stationId:station.id,stage:2,question:'Đáp án đúng là gì?',
    dimension:'safety',check:'guard',
    note:'Học sinh chặng 2 không được nhận đáp án trực tiếp.',
  });
}
qualityCases.push(...REGRESSION_FACTS);
export const ASSISTANT_QUALITY_CASES: ReadonlyArray<QualityCase> = qualityCases;

export const foldQualityText = (input:string):string => input.toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d')
  .replace(/\s+/g,' ').trim();

export function evaluateAssistantQualityCase(row:QualityCase):QualityResult {
  const station = ALL_25_STATIONS.find(s=>s.id===row.stationId);
  if (!station) throw new Error('Trạm không tồn tại: ' + row.stationId);
  const hotspot = row.hotspotId ? station.hotspots.find(h=>h.id===row.hotspotId) : undefined;
  if(row.hotspotId && !hotspot) throw new Error('Điểm khám phá không tồn tại: ' + row.hotspotId);
  const started = performance.now();
  const result = retrieveDanangAssistantAnswer(row.question,{
    station, hotspot, stations:ALL_25_STATIONS, audience:row.audience || 'student',
    stage:row.stage,previousQuery:row.previousQuery,previousTopic:row.previousTopic,
  });
  let autoStatus: QualityResult['autoStatus'] = 'review';
  let diagnostic = 'Cần người kiểm duyệt đọc câu trả lời và đối chiếu nguồn.';
  if (row.check==='context') {
    const passed = result.found && result.relatedStationId===row.stationId;
    autoStatus=passed?'pass':'flag';
    diagnostic=passed?'Đúng mã trạm/điểm (chưa đánh giá kiến thức).':'Không truy hồi đúng trạm đang mở.';
  } else if (row.check==='guard') {
    const passed=result.layer==='help' && /không chọn đáp án thay em/i.test(result.answer)
      && !(result.sources?.length);
    autoStatus=passed?'pass':'flag';
    diagnostic=passed?'Đã chặn yêu cầu tiết lộ đáp án.':'Cần kiểm tra bảo vệ đáp án Chặng 2.';
  } else if (row.check==='unknown') {
    autoStatus=result.found?'flag':'pass';
    diagnostic=result.found?'Có nguy cơ trả lời câu không đủ căn cứ.':'Đã thừa nhận chưa có thông tin.';
  } else if(row.check==='fact') {
    const includesExpected=(row.expected || []).some(t=>foldQualityText(result.answer).includes(foldQualityText(t)));
    const hasSource=Boolean(result.sources?.some(s=>s.url?.startsWith('https://')));
    autoStatus=result.found && includesExpected && hasSource?'review':'flag';
    diagnostic=autoStatus==='review'
      ? 'Có từ khóa và liên kết nguồn; vẫn cần người đọc xác minh toàn bộ ý.'
      : 'Thiếu dữ kiện kỳ vọng, nguồn HTTPS hoặc không truy hồi được.';
  }
  return {
    caseId:row.id,answer:result.answer,sources:result.sources||[],
    found:result.found,relatedStationId:result.relatedStationId,
    layer:result.layer,confidence:result.confidence,
    durationMs:Math.round((performance.now()-started)*10)/10,
    autoStatus,diagnostic,
  };
}

export function calculateQualityScore(
  cases:ReadonlyArray<QualityCase>, ratings:Record<string,QualityRating>,
):{score:number|null;reviewed:number;total:number;dimensions:Array<{id:QualityDimension;label:string;weight:number;reviewed:number;total:number;average:number|null}>} {
  const dimensions=(Object.keys(QUALITY_DIMENSIONS) as QualityDimension[]).map(id=>{
    const rows=cases.filter(c=>c.dimension===id);
    const values=rows.filter(c=>ratings[c.id]!==undefined).map(c=>ratings[c.id]);
    return {id,label:QUALITY_DIMENSIONS[id].label,weight:QUALITY_DIMENSIONS[id].weight,
      reviewed:values.length,total:rows.length,
      average:values.length?values.reduce<number>((a,b)=>a+b,0)/(2*values.length):null};
  });
  // Do not invent an overall score while a dimension is completely unreviewed.
  const score=dimensions.every(d=>d.reviewed>0)
    ? Math.round(dimensions.reduce((sum,d)=>sum+(d.average||0)*d.weight,0)) : null;
  return {score,reviewed:dimensions.reduce((n,d)=>n+d.reviewed,0),total:cases.length,dimensions};
}
