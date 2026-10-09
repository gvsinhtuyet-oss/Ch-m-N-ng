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
}

export interface AssistantRetrievalResult {
  found: boolean;
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
    title: 'Những bảo tàng ở thành phố Đà Nẵng',
    aliases: ['bảo tàng đà nẵng', 'bảo tàng mỹ thuật', 'bảo tàng'],
  },
  {
    stationId: 'g3-station-2',
    scope: 'danh-nhan-xu-quang',
    title: 'Huỳnh Thúc Kháng – Phan Châu Trinh',
    aliases: ['danh nhân xứ quảng', 'huỳnh thúc kháng', 'phan châu trinh', 'duy tân'],
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
type QuestionIntent = 'definition' | 'location' | 'material' | 'history' | 'purpose' | 'action' | 'feature';
const questionIntent = (query: string): QuestionIntent => {
  const q = normalizeForSearch(query);
  if (/nguyen lieu|vat lieu|lam bang|lam tu/.test(q)) return 'material';
  if (/o dau|nam o|dia chi|vi tri/.test(q)) return 'location';
  if (/nam nao|bao gio|khi nao|lich su|ra doi/.test(q)) return 'history';
  if (/em .*lam gi|nen lam gi|giu gin|bao ve|ung xu/.test(q)) return 'action';
  if (/tai sao|de lam gi|y nghia|cong dung/.test(q)) return 'purpose';
  if (/nghia la|la gi|la ai/.test(q)) return 'definition';
  return 'feature';
};
const intentEvidence: Record<QuestionIntent, RegExp> = {
  definition: /./,
  location: /nam o|toa lac|dia chi|phuong|xa|huyen|pho|ben|tai |thuoc/,
  material: /coi|lac|tre|go|dat set|da|soi|nguyen lieu|vat lieu/,
  history: /[12][0-9]{3}|the ky|xay dung|ra doi|lich su/,
  purpose: /de|giup|nham|vi|tuong nho|cau mong|y nghia|bao ve/,
  action: /em|nen|can|khong|giu|bao ve|chap hanh|bo rac/,
  feature: /./,
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

export function retrieveDanangAssistantAnswer(
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
    const related = stationMetaFromScope(lexicon.entry.stations.find(s => s !== 'common'));
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
    const score = Math.max(subjectScore, tokenScore(query, title), h.subtitleVi ? tokenScore(query, h.subtitleVi) : 0,
      hotspotCorpusScore(query, h));
    const text = [h.narrationVi, h.keyFactVi].filter(Boolean).join(' ');
    return { station: s, hotspot: h, score, text };
  }));
  const named = candidates.filter(c => c.score >= 88).sort((a, b) => b.score - a.score);
  const target = named[0] || (usesDeicticReference(query) && context.hotspot
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
  // Reuse authored question/answer pairs; never treat incorrect quiz options as facts.
  const qa = stations.flatMap(s => [
    ...s.hotspots.map(h => h.interaction), ...(s.challenge?.questions || []),
  ].filter(Boolean).map(item => ({ station: s, item: item!, score: longTextScore(query, item!.questionVi) })))
    .filter(c => c.score >= 88 && questionIntent(c.item.questionVi) === intent)
    .sort((a, b) => b.score - a.score)[0];
  if (qa) {
    const answer = qa.item.options.filter(o => o.isCorrect).map(o => o.textVi).join('; ');
    if (answer) return makeResult(station?.id === qa.station.id ? 'station' : 'five-stations',
      normalizedQuery, answer, 'medium', { relatedStationId: qa.station.id, relatedStationTitle: qa.station.titleVi });
  }
  if (intent === 'action' && /que huong|di san|di tich/.test(normalizeForSearch(query))) {
    return makeResult('common', normalizedQuery,
      'Em có thể bỏ rác đúng nơi, giữ vệ sinh, không viết vẽ lên di tích và thực hiện nội quy khi tham quan. Em cũng có thể giới thiệu những điều đã học về quê hương với bạn bè, người thân.', 'high');
  }
  return makeResult('unknown', normalizedQuery, UNKNOWN_RESPONSE +
    (usesDeicticReference(query) && !context.hotspot ? ' Bạn đang muốn hỏi về điểm đến nào?' : ''), 'low');
}

export function getDanangAssistantQuickPrompts(context: AssistantRetrievalContext = {}): string[] {
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
    'Chùa Cầu có gì đặc biệt?',
    'Nguyên liệu làm chiếu là gì?',
    'Em nên làm gì để giữ gìn quê hương?',
  ];
}

export const DANANG_ASSISTANT_DEMO_STATIONS = DEMO_STATIONS;

