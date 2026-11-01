import type { GddpRecord } from './GddpService';
import type { Station } from '../types';

export type TeacherLessonHit =
  | { kind: 'integration'; record: GddpRecord; score: number }
  | { kind: 'station'; station: Station; score: number };
export interface TeacherLessonSearchResult {
  hits: TeacherLessonHit[];
  total: number;
  message: string;
}

const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/đ/g, 'd').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
const cleanTitle = (text: string) => normalize(text)
  .replace(/\b(?:bai|chu de)\s*\d+\b/g, '').replace(/\btiet\s*\d+\b/g, '')
  .replace(/\b(?:noi va nghe|nghe viet|doc)\b/g, '').replace(/\s+/g, ' ').trim();
const STOP = new Set('toi thay co hay giup cho xin muon can tim mo vao xem day hoc bai ten cac nhung muc noi dung tich hop lien quan ve den cua mot va voi duoc gi nao nhe a'.split(' '));
const tokens = (text: string) => [...new Set(normalize(text).split(' ').filter(word => word.length > 1 && !STOP.has(word)))];
const subjects = [
  { aliases: ['tieng viet'], key: 'tieng viet' },
  { aliases: ['tu nhien va xa hoi', 'tu nhien xa hoi', 'tnxh'], key: 'tnxh' },
  { aliases: ['hoat dong trai nghiem', 'hdtn'], key: 'hdtn' },
  { aliases: ['lich su va dia li', 'lich su dia ly', 'lich su dia li'], key: 'lich su dia li' },
  { aliases: ['dao duc'], key: 'dao duc' },
];
const subjectKey = (text: string) => {
  const q = normalize(text);
  return subjects.find(subject => subject.aliases.some(alias => q === alias))?.key || q;
};
const matchText = (query: string, title: string) => {
  const a = cleanTitle(query), b = cleanTitle(title);
  if (!a || !b) return 0;
  if (a === b) return 120;
  // Whole phrases and substantial token overlap; a lone generic word cannot route a lesson.
  if (a.length >= 5 && a.split(' ').length >= 2 && (` ${b} `).includes(` ${a} `)) return 110;
  if (b.length >= 5 && b.split(' ').length >= 2 && (` ${a} `).includes(` ${b} `)) return 105;
  const wanted = tokens(a), available = new Set(tokens(b));
  const overlap = wanted.filter(word => available.has(word)).length;
  return wanted.length >= 2 && overlap >= 2 && overlap / wanted.length >= .85
    ? 80 + overlap : 0;
};

/** Read-only lookup. Return null for ordinary knowledge questions, including quiz requests. */
export function searchTeacherLessons(query: string, records: GddpRecord[], stations: Station[], currentGrade?: number): TeacherLessonSearchResult | null {
  const q = normalize(query);
  if (!q) return null;
  const navigation = /\b(?:tim|mo|vao|day|hoc lieu|bai hoc|ten bai|bai day|tich hop|lien quan|tuan)\b/.test(q)
    || /^bai\s+/.test(q);
  const knowledgeQuestion = /\b(?:la gi|la ai|vi sao|tai sao|o dau|nam nao|co phai|dung khong|bao nhieu|so sanh|trac nghiem|cau hoi|soan|thiet ke)\b/.test(q);
  if (knowledgeQuestion && !/\b(?:tim|mo|vao|hoc lieu|tich hop|lien quan)\b/.test(q)) return null;
  const explicitGrade = q.match(/\b(?:lop|khoi)\s*([1-5])\b/);
  const grade = explicitGrade ? Number(explicitGrade[1]) : undefined;
  const week = q.match(/\btuan\s*(\d{1,2})\b/)?.[1];
  let text = q.replace(/\b(?:lop|khoi)\s*[1-5]\b/g, '').replace(/\btuan\s*\d{1,2}\b/g, '');
  let requestedSubject: string | undefined;
  for (const subject of subjects) {
    const alias = subject.aliases.find(value => (` ${text} `).includes(` ${value} `));
    if (alias) { requestedSubject = subject.key; text = text.replace(alias, ''); break; }
  }
  text = text.replace(/\b(?:bai|chu de)\s*\d+\b/g, '').replace(/\bmon\b/g, '');
  // Remove request wording without stripping meaningful words inside lesson names.
  text = text.replace(/^(?:(?:toi|thay|co|hay|giup|cho|xin|muon|can|tim|mo|vao|xem|day|hoc|bai|ten|cac|nhung|muc|noi dung|tich hop|lien quan|ve|den)\s+)+/, '')
    .replace(/\s+(?:tich hop|lien quan)(?:\s+.*)?$/, '').trim();
  if (/^(?:bai|hoc lieu|tich hop|lien quan|noi dung|cac bai|mon)$/.test(text)) text = '';
  const filtered = records.filter(record => (!grade || record.grade === grade)
    && (!week || record.week.match(/\d+/)?.[0] === week)
    && (!requestedSubject || subjectKey(record.subject) === requestedSubject));
  const hits: TeacherLessonHit[] = [];
  for (const record of filtered) {
    const titleScore = matchText(text, record.lesson);
    const topicScore = navigation ? matchText(text, record.content) : 0;
    const filterOnly = !text && !!(grade || week || requestedSubject);
    const score = Math.max(titleScore, topicScore ? Math.min(75, topicScore) : 0, filterOnly ? 60 : 0);
    if (score) hits.push({ kind: 'integration', record, score });
  }
  for (const station of stations) {
    if ((grade && station.grade !== grade) || week || requestedSubject) continue;
    const score = matchText(text, station.titleVi);
    if (score) hits.push({ kind: 'station', station, score });
  }
  if (!navigation && !hits.length) return null;
  hits.sort((a, b) => {
    const ag = a.kind === 'integration' ? a.record.grade : a.station.grade;
    const bg = b.kind === 'integration' ? b.record.grade : b.station.grade;
    return b.score - a.score || Number(bg === currentGrade) - Number(ag === currentGrade) || ag - bg;
  });
  return {
    hits: hits.slice(0, 6), total: hits.length,
    message: hits.length
      ? `Tìm thấy ${hits.length} bài học và mục tích hợp phù hợp${hits.length > 6 ? '; đang hiện 6 kết quả đầu' : ''}. Thầy cô chọn đúng lớp, môn và bài bên dưới để mở học liệu.${hits.length > 6 ? ' Có thể thêm lớp, môn hoặc tuần để tìm gọn hơn.' : ''}`
      : 'Chưa tìm thấy bài phù hợp trong danh mục hiện có. Thầy cô thử nhập tên bài đầy đủ, thêm lớp, môn hoặc tuần; cũng có thể tìm theo chủ đề như “Tìm bài tích hợp về Hội An”.',
  };
}
