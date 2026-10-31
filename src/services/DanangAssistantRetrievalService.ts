import knowledge from '../data/assistantKnowledge.json';
import grade1Research from '../data/assistantGrade1Research.json';
import guides from '../data/assistantStationGuides.json';
import { answerLocalEducationQuestion, resolveLocalEducationFollowUp } from './LocalEducationKnowledge';
import { ExplorationHotspot, Station } from '../types';
import {
  AssistantLexiconEntry,
  AssistantStationScope,
  DANANG_ASSISTANT_HELP_RESPONSE,
  DANANG_ASSISTANT_LEXICON,
  normalizeDanangDialect,
} from '../data/danangAssistantLexicon';

export type AssistantRetrievalLayer =
  | 'hotspot'
  | 'station'
  | 'five-stations'
  | 'common'
  | 'help'
  | 'unknown';

export interface AssistantRetrievalContext {
  station?: Station | null;
  hotspot?: ExplorationHotspot | null;
  stations?: Station[];
  audience?: 'student' | 'teacher';
  stage?: number;
  previousQuery?: string;
  previousTopic?: string;
}

export interface AssistantRetrievalResult {
  topic?: string;
  found: boolean;
  sources?: { label: string; url?: string }[];
  teachingExample?: string;
  followUp?: string;
  layer: AssistantRetrievalLayer;
  answer: string;
  normalizedQuery: string;
  matchedTerm?: string;
  matchedEntryId?: string;
  relatedStationId?: string;
  relatedStationTitle?: string;
  confidence: 'high' | 'medium' | 'low';
}

interface DemoStationMeta {
  stationId: string;
  scope: Exclude<AssistantStationScope, 'common'>;
  title: string;
  aliases: string[];
}

const DEMO_STATIONS: DemoStationMeta[] = [
  {
    stationId: 'g4-station-2',
    scope: 'bao-tang-da-nang',
    title: 'Khu đền tháp Mỹ Sơn – Bảo tàng Điêu khắc Chăm Đà Nẵng',
    aliases: ['mỹ sơn', 'đền tháp mỹ sơn', 'bảo tàng điêu khắc chăm', 'bảo tàng đà nẵng', 'bảo tàng'],
  },
  {
    stationId: 'g3-station-2',
    scope: 'danh-nhan-xu-quang',
    title: 'Hoàng Diệu – Phan Châu Trinh',
    aliases: ['danh nhân xứ quảng', 'hoàng diệu', 'phan châu trinh', 'duy tân'],
  },
  {
    stationId: 'g1-station-4',
    scope: 'thanh-dien-hai',
    title: 'Thành Điện Hải',
    aliases: ['thành điện hải', 'điện hải', 'nguyễn tri phương'],
  },
  {
    stationId: 'g5-station-4',
    scope: 'ngu-hanh-son',
    title: 'Danh thắng Ngũ Hành Sơn',
    aliases: ['ngũ hành sơn', 'non nước', 'làng đá non nước'],
  },
  {
    stationId: 'g2-station-4',
    scope: 'hoi-an',
    title: 'Di sản văn hóa thế giới Hội An',
    aliases: ['hội an', 'phố cổ hội an', 'chùa cầu', 'sông hoài', 'hội quán'],
  },
];

const HELP_PATTERNS = [
  'giúp được gì',
  'giúp tôi điều gì',
  'giúp mình điều gì',
  'bạn biết gì',
  'bạn làm được gì',
  'bạn có thể làm gì',
  'hỏi bạn gì',
  'hỏi gì',
  'trợ lý làm gì',
];

const DEICTIC_PATTERNS = [
  'cái này',
  'nơi này',
  'chỗ này',
  'điều này',
  'ở đây',
  'nó là gì',
  'cái đó',
  'nơi đó',
];

const UNKNOWN_RESPONSE =
  'Mình chưa tìm thấy thông tin đã được kiểm duyệt cho câu hỏi này 😊 Bạn thử hỏi về địa danh, lịch sử, địa lý, văn hóa, từ khó hoặc nội dung của trạm đang khám phá nhé!';

const removeDiacritics = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');

// Cache normalized text only, never answers: teacher edits are still read on every question.
const searchTextCache = new Map<string, string>();
const normalizeForSearch = (value: string) => {
  const cached = searchTextCache.get(value);
  if (cached !== undefined) return cached;
  const normalized = removeDiacritics(normalizeDanangDialect(value))
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (searchTextCache.size >= 2000) searchTextCache.clear();
  searchTextCache.set(value, normalized);
  return normalized;
};

const words = (value: string) =>
  normalizeForSearch(value)
    .split(' ')
    .filter(word => word.length >= 2);

const unique = <T,>(items: T[]) => [...new Set(items)];

const QUESTION_STOPWORDS = new Set([
  'la', 'gi', 'o', 'dau', 'tai', 'sao', 'vi', 'co', 'khong', 'ai',
  'cai', 'nay', 'do', 'ay', 'dung', 'de', 'lam', 'nhu', 'the', 'nao',
  'cho', 'minh', 'em', 'ban', 'noi', 'ke', 've',
  'no', 'hay', 'toi', 'biet', 'tim', 'hieu', 'duoc', 'nhung', 'cac', 'mot', 'nhe', 'nha', 'voi', 'xin', 'hoi', 'dac', 'biet',
]);

const meaningfulWords = (value: string) =>
  unique(words(value).filter(word => !QUESTION_STOPWORDS.has(word)));

const longTextScore = (query: string, candidate: string): number => {
  const q = normalizeForSearch(query);
  const c = normalizeForSearch(candidate);
  if (!q || !c) return 0;
  if (c.includes(q) && q.length >= 4) return 96;

  const qTokens = meaningfulWords(q);
  if (!qTokens.length) return tokenScore(query, candidate);

  const candidateTokens = new Set(words(c));
  const hits = qTokens.filter(token => candidateTokens.has(token)).length;
  const coverage = hits / qTokens.length;
  return Math.round(coverage * 92 + Math.min(hits, 4) * 2);
};

const tokenScore = (query: string, candidate: string): number => {
  const q = normalizeForSearch(query);
  const c = normalizeForSearch(candidate);
  if (!q || !c) return 0;
  if (q === c) return 120;

  // Ưu tiên cụm từ xuất hiện trọn vẹn trong câu hỏi. Cụm nhiều từ
  // phải thắng alias quá chung (ví dụ "hào thành" thắng "thành").
  const paddedQuery = ` ${q} `;
  const paddedCandidate = ` ${c} `;
  if (paddedQuery.includes(paddedCandidate)) {
    const candidateTokens = words(c);
    if (candidateTokens.length >= 2) return Math.min(119, 105 + Math.min(10, c.length));
    if (c.length >= 2) return 92 + Math.min(5, c.length);
  }
  if (c.includes(q) && q.length >= 4) return 88;

  const qTokens = unique(words(q));
  const cTokens = new Set(words(c));
  if (!qTokens.length || !cTokens.size) return 0;

  const hits = qTokens.filter(token => cTokens.has(token)).length;
  const coverage = hits / qTokens.length;
  const candidateCoverage = hits / cTokens.size;
  return Math.round(coverage * 55 + candidateCoverage * 25 + hits * 3);
};

const scoreEntry = (query: string, entry: AssistantLexiconEntry): number => {
  const variants = [entry.term, ...entry.aliases];
  return Math.max(...variants.map(variant => tokenScore(query, variant)));
};

const stationScopeFromId = (stationId?: string): AssistantStationScope | undefined =>
  DEMO_STATIONS.find(item => item.stationId === stationId)?.scope;

const stationMetaFromScope = (scope?: AssistantStationScope) =>
  DEMO_STATIONS.find(item => item.scope === scope);

const looksLikeHelpQuestion = (query: string) => {
  const normalized = normalizeForSearch(query);
  return HELP_PATTERNS.some(pattern => normalized.includes(normalizeForSearch(pattern)));
};

const usesDeicticReference = (query: string) => {
  const normalized = normalizeForSearch(query);
  return DEICTIC_PATTERNS.some(pattern => normalized.includes(normalizeForSearch(pattern)));
};

const friendlyDefinition = (entry: AssistantLexiconEntry) => {
  const suffix = entry.childExample ? ` Ví dụ: ${entry.childExample}` : '';
  return `${entry.shortDefinition}${suffix}`;
};

const searchLexicon = (
  query: string,
  predicate: (entry: AssistantLexiconEntry) => boolean,
): { entry: AssistantLexiconEntry; score: number } | null => {
  let best: { entry: AssistantLexiconEntry; score: number } | null = null;

  DANANG_ASSISTANT_LEXICON.forEach(entry => {
    if (!predicate(entry)) return;
    const score = scoreEntry(query, entry);
    if (!best || score > best.score) best = { entry, score };
  });

  return best;
};

const hotspotCorpusScore = (query: string, hotspot: ExplorationHotspot): number =>
  longTextScore(
    query,
    [hotspot.titleVi, hotspot.subtitleVi || '', hotspot.narrationVi, hotspot.keyFactVi].join(' '),
  );

const makeResult = (
  layer: AssistantRetrievalLayer,
  normalizedQuery: string,
  answer: string,
  confidence: 'high' | 'medium' | 'low',
  extra: Partial<AssistantRetrievalResult> = {},
): AssistantRetrievalResult => ({
  found: layer !== 'unknown',
  layer,
  answer,
  normalizedQuery,
  confidence,
  ...extra,
});

// Determine the requested fact before choosing a lesson passage.
type QuestionIntent = 'definition' | 'location' | 'material' | 'history' | 'purpose' | 'action' | 'actor' | 'quantity' | 'comparison' | 'list' | 'confirmation' | 'feature';
const questionIntent = (query: string): QuestionIntent => {
  const q = normalizeForSearch(query);
  if (/nguyen lieu|vat lieu|lam bang|lam tu/.test(q)) return 'material';
  if (/o dau|nam o|dia chi|vi tri|o tinh|o thanh pho|o phuong|o xa|o quan|thuoc tinh|thuoc thanh pho/.test(q)) return 'location';
  if (/nam nao|bao gio|khi nao|lich su|ra doi/.test(q)) return 'history';
  if (/bao nhieu|dai bao|cao bao|rong bao/.test(q)) return 'quantity';
  if (/ai (xay|tao|lap|sang|dung)|nguoi nao/.test(q)) return 'actor';
  if (/khac .*the nao|so sanh|khac nhau|khac gi/.test(q)) return 'comparison';
  if (/em .*lam gi|nen lam gi|giu gin|bao ve|ung xu/.test(q)) return 'action';
  if (/tai sao|vi sao|de lam gi|y nghia|cong dung/.test(q)) return 'purpose';
  if (/co phai|phai khong|phai ko|dung khong|dung ko/.test(q)) return 'confirmation';
  if (/ke ten|liet ke|ke vai|nhung .*nao|co .*gi|co .*nao|gom nhung/.test(q)) return 'list';
  if (/nghia la|la gi|la ai/.test(q)) return 'definition';
  return 'feature';
};
const intentEvidence: Record<QuestionIntent, RegExp> = {
  definition: /./,
  location: /\b(?:nam o|toa lac|dia chi|phuong|xa|huyen|pho|ben|tai|thuoc)\b/,
  material: /\b(?:coi|lac|tre|go|dat set|da|soi|nguyen lieu|vat lieu)\b/,
  history: /[12][0-9]{3}|the ky|xay dung|ra doi|lich su/,
  purpose: /\b(?:de|giup|nham|vi|tuong nho|cau mong|y nghia|bao ve)\b/,
  action: /\b(?:em|nen|can|khong|giu|bao ve|chap hanh|bo rac)\b/,
  actor: /\b(?:nguoi|nhan dan|cu dan|nghe nhan|vua|trieu|nhat ban)\b.*\b(?:xay|tao|lap|dung|thiet ke)\b/,
  quantity: /[0-9]+(?:[.,][0-9]+)?\s*(?:km|m|met|ha|nam|the ky|hon|dao|loai)/,
  comparison: /\b(?:khac|trong khi|con|so voi|giong)\b/,
  feature: /./,
  list: /./,
  confirmation: /$^/,
};
const dialectDefinitionRequested = (query: string, entry: AssistantLexiconEntry) => {
  // Inspect the original words: dialect normalization erases the word being defined.
  const q = query.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
  const term = entry.term.toLowerCase();
  return q === term || new RegExp(`^(?:từ |chữ )?${term} (?:nghĩa là gì|là gì|có nghĩa gì)$`).test(q);
};
const concisePassage = (query: string, text: string, intent: QuestionIntent): string => {
  const sentences = unique(text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean));
  return sentences.map((text, index) => ({ text, index, score: longTextScore(query, text) }))
    .filter(item => intentEvidence[intent].test(normalizeForSearch(item.text)))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, intent === 'feature' ? 3 : 2)
    .sort((a, b) => a.index - b.index).map(item => item.text).join(' ');
};

function retrieveCoreAnswer(
  rawQuery: string,
  context: AssistantRetrievalContext = {},
): AssistantRetrievalResult {
  const query = rawQuery.trim();
  const normalizedQuery = normalizeDanangDialect(query);
  if (!query || looksLikeHelpQuestion(query)) {
    return makeResult('help', normalizedQuery, DANANG_ASSISTANT_HELP_RESPONSE, 'high');
  }
  const dialect = DANANG_ASSISTANT_LEXICON.find(entry =>
    entry.category === 'phuong-ngu' && dialectDefinitionRequested(query, entry));
  if (dialect) return makeResult('common', normalizedQuery, friendlyDefinition(dialect), 'high', {
    matchedTerm: dialect.term, matchedEntryId: dialect.id,
  });
  const intent = questionIntent(query);
  const station = context.station || undefined;
  const scope = stationScopeFromId(station?.id);
  const stations = [...new Map([...(context.stations || []), ...(station ? [station] : [])]
    .map(item => [item.id, item])).values()];
  // Vocabulary answers are appropriate for definitions only, never for location/material questions.
  const lexicon = usesDeicticReference(query) && meaningfulWords(query).length === 0 ? null
    : searchLexicon(query, entry => entry.category !== 'phuong-ngu');
  if (intent === 'definition' && lexicon && lexicon.score >= 90
    && [lexicon.entry.term, ...lexicon.entry.aliases].some(term =>
      normalizeForSearch(query) === normalizeForSearch(term) || words(term).length >= 2 && tokenScore(query, term) >= 105)) {
    const authoredRelated = stationMetaFromScope(lexicon.entry.stations.find(s => s !== 'common'));
    const actualRelated = stations.find(s => normalizeForSearch(s.titleVi).includes(normalizeForSearch(lexicon.entry.term)));
    const related = actualRelated ? { stationId: actualRelated.id, title: actualRelated.titleVi } : authoredRelated;
    const layer = lexicon.entry.stations.includes('common') ? 'common'
      : scope && lexicon.entry.stations.includes(scope) ? 'station' : 'five-stations';
    return makeResult(layer, normalizedQuery, friendlyDefinition(lexicon.entry) + (related && layer === 'five-stations' ? ` Nội dung liên quan đến trạm **${related.title}**.` : ''), 'high', {
      matchedTerm: lexicon.entry.term, matchedEntryId: lexicon.entry.id,
      relatedStationId: related?.stationId, relatedStationTitle: related?.title,
    });
  }
  const candidates = stations.flatMap(s => s.hotspots.map(h => {
    const title = h.titleVi.replace(/^\d+\.\s*/, '');
    // Titles often group several points; use subtitle and lesson text as well.
    const explicitTerms = meaningfulWords(query).filter(t => !['nguyen', 'lieu', 'vat', 'nam', 'giu', 'gin', 'tai', 'sao', 'nguoi', 'goi'].includes(t));
    const corpusWords = new Set(words([title, h.subtitleVi, h.narrationVi, h.keyFactVi].join(' ')));
    const subjectScore = explicitTerms.length && explicitTerms.every(t => corpusWords.has(t)) ? 90 : 0;
    const subject = normalizeDanangDialect(query).replace(/(?:là gì|nghĩa là gì|có nghĩa gì)[?!.]*$/u, '').trim();
    const phraseScore = intent === 'definition' && words(subject).length >= 2 && normalizeDanangDialect(title).includes(subject) ? 145 : 0;
    const score = Math.max(phraseScore, subjectScore, tokenScore(query, title), h.subtitleVi ? tokenScore(query, h.subtitleVi) : 0,
      hotspotCorpusScore(query, h));
    const text = [h.narrationVi, h.keyFactVi].filter(Boolean).join(' ');
    return { station: s, hotspot: h, score, text };
  }));
  // A named destination overrides an incidental "ở đây" reference, even when
  // the edited learning-point title contains more words than the destination.
  const explicitStation = stations.map(s => ({station:s,terms:[s.titleVi,...(DEMO_STATIONS.find(m=>m.stationId===s.id)?.aliases||[])]
    .map(normalizeForSearch).filter(term=>words(term).length>=2 && normalizeForSearch(query).includes(term))}))
    .filter(x=>x.terms.length).sort((a,b)=>Math.max(...b.terms.map(t=>t.length))-Math.max(...a.terms.map(t=>t.length)))[0]?.station;
  // General care questions must be answered before fuzzy lesson matching.
  // Words such as "em", "giữ" and "quê hương" occur in unrelated passages too.
  const namedHotspot = candidates.some(c => {
    const title = normalizeForSearch(c.hotspot.titleVi.replace(/^\d+\.\s*/, ''));
    return words(title).length >= 2 && (` ${normalizeForSearch(query)} `).includes(` ${title} `);
  });
  if (intent === 'list' && !explicitStation && !namedHotspot && !usesDeicticReference(query)) {
    return makeResult('unknown', normalizedQuery, UNKNOWN_RESPONSE, 'low');
  }
  if (intent === 'action' && !explicitStation && !namedHotspot && !usesDeicticReference(query)) {
    if (/\b(?:que huong|di san|di tich|moi truong|bai bien|cay xanh)\b/.test(normalizeForSearch(query))) {
      return makeResult('common', normalizedQuery,
        'Em có thể bỏ rác đúng nơi, giữ vệ sinh, chăm sóc cây xanh, không viết vẽ lên di tích và thực hiện nội quy khi tham quan. Em cũng có thể giới thiệu những điều đã học về quê hương với bạn bè, người thân.', 'high');
    }
    // Do not turn shared action words into evidence about an unknown subject.
    return makeResult('unknown', normalizedQuery, UNKNOWN_RESPONSE, 'low');
  }
  const relevantCandidates=explicitStation?candidates.filter(c=>c.station.id===explicitStation.id):candidates;
  const named = relevantCandidates.filter(c => c.score >= 88).sort((a, b) => b.score - a.score);
  const target = named[0] || (explicitStation ? [...relevantCandidates].sort((a,b)=>b.score-a.score)[0] : undefined) || (usesDeicticReference(query) && context.hotspot
    ? candidates.find(c => c.hotspot.id === context.hotspot?.id && c.station.id === station?.id) : undefined);
  if (target) {
    // Do not answer a specific question with a definition just because the place matches.
    const answer = concisePassage(query, target.text, intent);
    if (answer) return makeResult(context.hotspot?.id === target.hotspot.id && station?.id === target.station.id
      ? 'hotspot' : station?.id === target.station.id ? 'station' : 'five-stations', normalizedQuery,
      `**${target.hotspot.titleVi.replace(/^\d+\.\s*/, '')}**: ${answer}`, 'medium', {
        relatedStationId: target.station.id, relatedStationTitle: target.station.titleVi,
      });
    return makeResult('unknown', normalizedQuery,
      `Mình đã tìm thấy học liệu về **${target.hotspot.titleVi.replace(/^\d+\.\s*/, '')}**, nhưng chưa có thông tin đủ rõ để trả lời ý này. Bạn có thể hỏi cô giáo hoặc chọn câu hỏi về đặc điểm của điểm đến nhé!`, 'low');
  }
  // Quiz options are never a knowledge source; similar wording is not factual evidence.
  return makeResult('unknown', normalizedQuery, UNKNOWN_RESPONSE +
    (usesDeicticReference(query) && !context.hotspot ? ' Bạn đang muốn hỏi về điểm đến nào?' : ''), 'low');
}

/**
 * Source-linked editorial FAQ layer for grade 1 station 1.
 * Conservative matching prefers uncertainty to guessing a different answer.
 */
const curatedRows = grade1Research.entries.map(row => ({
  ...row, texts: [row.question, ...row.variants]
    .map(text => ({text, normalized:normalizeForSearch(text), intent:questionIntent(text)})),
}));
const curatedSources = new Map(grade1Research.sources.map(s=>[s.id,s]));
const curatedMeaningful = (query:string) => new Set(meaningfulWords(query));
const curatedCompare = (query:string, candidate:string) => {
  const a=curatedMeaningful(query), b=curatedMeaningful(candidate);
  if(a.size<2 || b.size<2)return 0;
  const common=[...a].filter(term=>b.has(term)).length;
  if(!common)return 0;
  const aCoverage=common/a.size, bCoverage=common/b.size;
  return aCoverage>=.76 && bCoverage>=.70 ? 2*common/(a.size+b.size) : 0;
};
function findCuratedAnswer(query:string, context:AssistantRetrievalContext):AssistantRetrievalResult|null {
  if (context.station?.id && context.station.id!==grade1Research.stationId) return null;
  if (!query.trim())return null;
  const nq=normalizeForSearch(query);
  const intent=questionIntent(query);
  const teacher=context.audience==='teacher';
  const ranked=curatedRows.filter(row=>row.audience==='student'||teacher).map(row=>{
    const pointBoost=context.hotspot?.id===row.pointId ? .02 : 0;
    const scores=row.texts.map(item=>{
      if(nq===item.normalized)return 2+pointBoost;
      if(item.intent!==intent)return 0;
      return curatedCompare(query,item.text)+pointBoost;
    });
    return {row,score:Math.max(0,...scores)};
  }).filter(x=>x.score>=.84).sort((a,b)=>b.score-a.score);
  if(!ranked.length)return null;
  if(ranked[0].score<1.9 && ranked[1] && ranked[0].score-ranked[1].score<.09)return null;
  const match=ranked[0].row;
  const sources=match.sources.flatMap(id=>{
    const src=curatedSources.get(id);
    return src ? [{label:src.title,url:src.url}] : [];
  });
  return makeResult(context.hotspot?.id===match.pointId?'hotspot':'station',nq,
    match.answer,'high',{
      matchedEntryId:match.id,matchedTerm:match.question,
      relatedStationId:grade1Research.stationId,
      relatedStationTitle:'Quê hương em',
      topic:match.question,sources,followUp:match.followUp,
      teachingExample:teacher && match.teacherNote ? match.teacherNote : undefined,
    });
}

// Conversational composition uses reviewed facts, never question options or invented facts.
const topicCards = (query:string) => {
  const q = ` ${normalizeForSearch(query)} `;
  return knowledge.map(card=>({card, length:Math.max(0,...[card.term,...card.aliases]
    .filter(term=>words(term).length>=2 && q.includes(` ${normalizeForSearch(term)} `)).map(term=>term.length))}))
    .filter(item=>item.length>0).sort((a,b)=>b.length-a.length);
};
const followUpRequest = (q:string) => /^(?:(?:vay|the|rua|con) )?(?:no |dieu do |cai do |noi nay |tro nay )?(?:cho vi du|vi du|noi (?:ro|them|don gian|de hieu)|giai thich (?:them|ro|don gian)|de hieu hon|day (?:the nao|ra sao)|ap dung|goi y (?:bai day|hoat dong)|co y nghia gi|o dau|cach choi|choi the nao|choi ra sao|vi sao|tai sao)\b/.test(q);

export function retrieveDanangAssistantAnswer(rawQuery:string, context:AssistantRetrievalContext={}):AssistantRetrievalResult {
  // Keep assessment protection ahead of composition and every retrieval layer.
  if(context.stage===2 && context.audience!=='teacher') return retrieveSingleAnswer(rawQuery,context);
  const query=rawQuery.trim().slice(0,context.audience==='teacher'?600:220);
  const q=normalizeForSearch(query);
  const named=topicCards(query);
  const previous=context.previousTopic || context.previousQuery;
  const previousCards=previous?topicCards(previous):[];
  // Short pronoun questions inherit only an unambiguous, supported topic.
  const inherited=!named.length && (followUpRequest(q)||/^(?:no|dieu do|cai do)\b/.test(q)) && previousCards.length===1 ? previousCards[0].card : undefined;
  const exampleCard=inherited || (named.length===1?named[0].card:undefined);
  if(exampleCard && /cho vi du|^vi du|de hieu|don gian|day the nao|day ra sao|ap dung|goi y/.test(q)) {
    return makeResult('common',normalizeDanangDialect(query),exampleCard.teachingExample,'high',{
      topic:exampleCard.term,sources:[exampleCard.source],followUp:exampleCard.followUp,
    });
  }
  // Two explicit questions are answered separately, instead of one keyword hiding the other.
  const parts=query.split(/[?？;]+/).map(s=>s.trim()).filter(Boolean);
  if(parts.length>1) {
    const results=parts.slice(0,3).map((part,index)=>retrieveDanangAssistantAnswer(part,{
      ...context,previousQuery:index?parts[index-1]:context.previousQuery,
    }));
    return makeResult(results.every(r=>r.found)?'common':'unknown',normalizeDanangDialect(query),
      results.map((r,i)=>`**${parts[i]}?**\n${r.answer}`).join('\n\n')+(parts.length>3?'\n\nBạn tách các ý còn lại thành lượt tiếp theo nhé.':''),
      results.every(r=>r.found)?'medium':'low',{
        sources:[...new Map(results.flatMap(r=>r.sources||[]).map(s=>[s.url||s.label,s])).values()],
        topic:results.at(-1)?.topic,
      });
  }
  if(questionIntent(query)==='comparison') {
    // A reviewed comparison card has priority; otherwise present the two reviewed definitions.
    const exact=knowledge.find(c=>[c.term,...c.aliases].some(t=>normalizeForSearch(t)===q));
    if(!exact && named.length===2) {
      return makeResult('common',normalizeDanangDialect(query),named.map(({card})=>`**${card.term}:** ${card.answer}`).join('\n\n'),'medium',{
        sources:[...new Map(named.map(({card})=>[card.source.url,card.source])).values()],
      });
    }
  }
  const resolved=inherited?`${inherited.term}: ${query}`:resolveLocalEducationFollowUp(query,previous);
  const result=retrieveSingleAnswer(resolved,context);
  if(result.found) result.topic=result.matchedTerm || (named.length===1?named[0].card.term:resolved!==query?resolved.split(':')[0]:undefined);
  return result;
}

/** Local retrieval only: no API key, per-account counter, or network inference. */
function retrieveSingleAnswer(rawQuery: string, context: AssistantRetrievalContext = {}): AssistantRetrievalResult {
  const teacher = context.audience === 'teacher';
  const query = resolveLocalEducationFollowUp(rawQuery.trim(), context.previousQuery).slice(0, teacher ? 600 : 220);
  // While taking a challenge, keep the student in the learning flow, not an answer service.
  if (!teacher && context.stage === 2 && query && !looksLikeHelpQuestion(query)) {
    return makeResult('help', normalizeDanangDialect(query),
      'Em thử quan sát kỹ hình và nhớ lại điều vừa khám phá nhé. Nếu còn phân vân, em có thể quay lại Chặng 1 để tìm chi tiết giúp mình lựa chọn. Mình sẽ không chọn đáp án thay em.', 'high');
  }
  const cleanQuery = query.replace(/^(?:cô|thầy|hãy|giúp tôi|giúp mình)\s+/i, '')
    .replace(/^(?:giải thích|giải nghĩa|nói rõ|cho ví dụ về)\s+(?:từ\s+)?/i, '')
    .replace(/(?:[,;]?\s*(?:giải thích|nói)\s+)?cho học sinh(?: tiểu học)?(?: lớp [1-5])?[^?]*\??$/i, '').trim();
  // Curated evidence precedes fuzzy narration; Stage 2 protection stays above.
  const curated = findCuratedAnswer(cleanQuery,context);
  if(curated)return curated;
  const q = normalizeForSearch(cleanQuery);
  const intent = questionIntent(cleanQuery);
  const candidates = knowledge.map(card => {
    const terms = [card.term, ...card.aliases];
    const exact = terms.some(t => normalizeForSearch(t) === q);
    const named = terms.some(t => (` ${q} `).includes(` ${normalizeForSearch(t)} `));
    const askedFact = terms.some(t => /nam nao|vat lieu|nguyen lieu|dong vat hay thuc vat/.test(normalizeForSearch(t)) && questionIntent(t) === intent && longTextScore(cleanQuery, t) >= 96 && (` ${q} `).includes(` ${normalizeForSearch(t).split(/ duoc | di tich | dong vat | vat lieu | nguyen lieu /)[0]} `));
    const supportedIntent=intent==='definition'||card.intents?.includes(intent);
    const namedSubject=card.subjects?.some(t=>(` ${q} `).includes(` ${normalizeForSearch(t)} `));
    return {card, score: exact ? 150 : askedFact ? 140 : named && supportedIntent ? (namedSubject?140:110) + Math.max(...terms.filter(t => (` ${q} `).includes(` ${normalizeForSearch(t)} `)).map(t=>words(t).length)) : 0};
  }).filter(item => item.score > 0).sort((a,b)=>b.score-a.score);
  const best = candidates[0]?.card;
  let result: AssistantRetrievalResult;
  if (best) {
    result = makeResult('common', normalizeDanangDialect(query), best.answer, 'high', {
      matchedEntryId: `expanded-${best.id}`, matchedTerm: best.term,
      sources: [best.source], teachingExample: teacher ? best.teachingExample : undefined,
      followUp: teacher ? best.followUp : undefined,
    });
  } else {
    const local = answerLocalEducationQuestion(cleanQuery);
    if (local) return makeResult(local.found ? 'common' : 'unknown', normalizeDanangDialect(query), local.answer, local.found ? 'high' : 'low', { sources: local.sources });
    // A known subject with an unsupported requested fact must not fall through
    // to an incidental station passage mentioning the same noun.
    if(topicCards(cleanQuery).length && ['history','quantity','actor'].includes(intent)) {
      return makeResult('unknown',normalizeDanangDialect(query),
        'Mình nhận ra chủ đề bạn hỏi, nhưng chưa có nguồn đủ rõ cho thông tin cụ thể này. Bạn muốn hỏi về đặc điểm hoặc xem ví dụ dễ hiểu của chủ đề đó không?','low');
    }
    const wantsExplanation = /^(?:(?:cô|thầy|hãy|giúp tôi|giúp mình)\s+)?(?:giải thích|giải nghĩa|cho ví dụ về)/i.test(query);
    const coreQuery = wantsExplanation && questionIntent(cleanQuery) === 'feature' ? `${cleanQuery} là gì?` : cleanQuery || query;
    result = retrieveCoreAnswer(coreQuery, context);
    if (result.matchedEntryId) {
      const entry = DANANG_ASSISTANT_LEXICON.find(e=>e.id===result.matchedEntryId);
      if(entry?.sourceUrl) result.sources=[{label:entry.sourceLabel || 'Tài liệu tham khảo',url:entry.sourceUrl}];
    }
    if (!result.sources && result.relatedStationTitle) result.sources=[{label:`Học liệu trong ứng dụng: ${result.relatedStationTitle}`}];
    const guide = guides.find(g=>g.stationId===(result.relatedStationId || context.station?.id));
    if (teacher && result.found && result.layer !== 'help' && guide) {
      result.teachingExample=guide.teachingActivity;
      result.followUp=guide.followUp;
    }
  }
  if(teacher && !result.found) result.answer='Tôi chưa có thông tin đủ rõ trong kho hiện tại để trả lời chính xác ý này. Thầy cô có thể nêu rõ thuật ngữ, địa danh hoặc đối chiếu thêm tài liệu gốc trước khi dùng để giảng nhé.';
  return result;
}

export function getDanangAssistantQuickPrompts(context: AssistantRetrievalContext = {}): string[] {
  if(context.audience !== 'teacher' && context.stage === 2) return ['Em nên quan sát gì?', 'Em ôn lại bài ở đâu?', 'Nếu phân vân thì làm gì?'];
  if(context.audience === 'teacher' && !context.station) return ['Di sản văn hóa phi vật thể là gì?', 'San hô là động vật hay thực vật?', 'Vòng tuần hoàn nước là gì?'];
  const hotspot = context.hotspot;
  if (hotspot) {
    const title = hotspot.titleVi.replace(/^\d+\.\s*/, '');
    return [
      `${title} là gì?`,
      'Nơi này có gì đặc biệt?',
      'Điều này liên quan gì đến bài học?',
    ];
  }

  const scope = stationScopeFromId(context.station?.id);
  const promptsByScope: Partial<Record<AssistantStationScope, string[]>> = {
    'bao-tang-da-nang': ['Hiện vật là gì?', 'Bảo tồn là gì?', 'Bài chòi là gì?'],
    'danh-nhan-xu-quang': ['Danh nhân là gì?', 'Duy Tân nghĩa là gì?', 'Phan Châu Trinh là ai?'],
    'thanh-dien-hai': ['Thành Điện Hải là gì?', 'Hào thành dùng để làm gì?', 'Nguyễn Tri Phương là ai?'],
    'ngu-hanh-son': ['Ngũ Hành Sơn có gì đặc biệt?', 'Ma nhai là gì?', 'Làng đá Non Nước là gì?'],
    'hoi-an': ['Hội An được UNESCO công nhận năm nào?', 'Chùa Cầu là gì?', 'Làng gốm Thanh Hà là gì?'],
  };

  if (!scope && context.station) {
    return context.station.hotspots.slice(0, 3).map(h => `${h.titleVi.replace(/^\d+\.\s*/, '')} có gì đặc biệt?`);
  }

  return (scope && promptsByScope[scope]) || [
    'Đà Nẵng có làng nghề gì?',
    'Trốn tìm có phải trò chơi dân gian không?',
    'Em nên làm gì để giữ gìn quê hương?',
  ];
}

export const DANANG_ASSISTANT_DEMO_STATIONS = DEMO_STATIONS;

