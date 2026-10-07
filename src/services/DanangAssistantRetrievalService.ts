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

const normalizeForSearch = (value: string) =>
  removeDiacritics(normalizeDanangDialect(value))
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const words = (value: string) =>
  normalizeForSearch(value)
    .split(' ')
    .filter(word => word.length >= 2);

const unique = <T,>(items: T[]) => [...new Set(items)];

const QUESTION_STOPWORDS = new Set([
  'la', 'gi', 'o', 'dau', 'tai', 'sao', 'vi', 'co', 'khong', 'ai',
  'cai', 'nay', 'do', 'ay', 'dung', 'de', 'lam', 'nhu', 'the', 'nao',
  'cho', 'minh', 'em', 'ban', 'noi', 'ke', 've',
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
  if (q.includes(c) && c.length >= 4) return 95;
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

const currentHotspotAnswer = (hotspot: ExplorationHotspot): string => {
  const title = hotspot.titleVi.replace(/^\d+\.\s*/, '');
  return `Bạn đang khám phá **${title}** đó 😊 ${hotspot.narrationVi} ${hotspot.keyFactVi}`;
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

const stationCorpusScore = (query: string, station: Station): number => {
  const corpus = [
    station.titleVi,
    station.subtitleVi,
    station.openingMessageVi,
    station.pedagogyGoals.knowGoalVi,
    station.pedagogyGoals.understandGoalVi,
    station.pedagogyGoals.behaviorGoalVi,
    ...station.hotspots.flatMap(h => [h.titleVi, h.subtitleVi || '', h.narrationVi, h.keyFactVi]),
  ].join(' ');
  return longTextScore(query, corpus);
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

/**
 * Bộ máy tra cứu cục bộ của “Trợ lý khám phá Đà Nẵng”.
 *
 * Thứ tự bắt buộc:
 * 1. hotspot đang xem;
 * 2. trạm hiện tại;
 * 3. 5 trạm demo;
 * 4. kho kiến thức chung;
 * 5. không có dữ liệu -> không đoán.
 *
 * Không gọi Gemini/API, không giới hạn số lượt hỏi.
 */
export function retrieveDanangAssistantAnswer(
  rawQuery: string,
  context: AssistantRetrievalContext = {},
): AssistantRetrievalResult {
  const query = rawQuery.trim();
  const normalizedQuery = normalizeDanangDialect(query);

  if (!query) {
    return makeResult('help', normalizedQuery, DANANG_ASSISTANT_HELP_RESPONSE, 'high');
  }

  if (looksLikeHelpQuestion(query)) {
    return makeResult('help', normalizedQuery, DANANG_ASSISTANT_HELP_RESPONSE, 'high');
  }

  const currentStation = context.station || undefined;
  const currentHotspot = context.hotspot || undefined;
  const currentScope = stationScopeFromId(currentStation?.id);

  // 1) HOTSPOT đang xem: hiểu cả “cái này/nơi này/điều này”.
  if (currentHotspot) {
    if (usesDeicticReference(query)) {
      return makeResult(
        'hotspot',
        normalizedQuery,
        currentHotspotAnswer(currentHotspot),
        'high',
      );
    }

    const hotspotScore = hotspotCorpusScore(query, currentHotspot);
    const hotspotLexicon = searchLexicon(
      query,
      entry =>
        Boolean(currentScope) &&
        entry.stations.includes(currentScope as AssistantStationScope) &&
        scoreEntry(currentHotspot.titleVi + ' ' + query, entry) >= 60,
    );

    if (hotspotLexicon && hotspotLexicon.score >= 72) {
      return makeResult(
        'hotspot',
        normalizedQuery,
        friendlyDefinition(hotspotLexicon.entry),
        hotspotLexicon.score >= 90 ? 'high' : 'medium',
        {
          matchedTerm: hotspotLexicon.entry.term,
          matchedEntryId: hotspotLexicon.entry.id,
        },
      );
    }

    if (hotspotScore >= 72) {
      return makeResult(
        'hotspot',
        normalizedQuery,
        currentHotspotAnswer(currentHotspot),
        hotspotScore >= 90 ? 'high' : 'medium',
      );
    }
  }

  // 2) TRẠM hiện tại: chỉ tìm trong từ vựng của đúng trạm trước.
  if (currentStation && currentScope) {
    const local = searchLexicon(
      query,
      entry => entry.stations.includes(currentScope),
    );

    if (local && local.score >= 68) {
      return makeResult(
        'station',
        normalizedQuery,
        friendlyDefinition(local.entry),
        local.score >= 90 ? 'high' : 'medium',
        {
          matchedTerm: local.entry.term,
          matchedEntryId: local.entry.id,
        },
      );
    }

    // Nếu câu hỏi nhắc trực tiếp nội dung trong bài nhưng chưa có mục từ riêng,
    // dùng chính nội dung đã được giáo viên duyệt của trạm.
    const stationScore = stationCorpusScore(query, currentStation);
    const bestHotspot = currentStation.hotspots
      .map(hotspot => ({ hotspot, score: hotspotCorpusScore(query, hotspot) }))
      .sort((a, b) => b.score - a.score)[0];

    if (stationScore >= 72 && bestHotspot?.score >= 64) {
      const title = bestHotspot.hotspot.titleVi.replace(/^\d+\.\s*/, '');
      return makeResult(
        'station',
        normalizedQuery,
        `Có nè 😊 **${title}**: ${bestHotspot.hotspot.narrationVi} ${bestHotspot.hotspot.keyFactVi}`,
        bestHotspot.score >= 85 ? 'high' : 'medium',
      );
    }
  }

  // 3) TOÀN BỘ 5 TRẠM DEMO.
  const crossStation = searchLexicon(
    query,
    entry => entry.stations.some(scope => scope !== 'common'),
  );

  if (crossStation && crossStation.score >= 72) {
    const relatedScope = crossStation.entry.stations.find(scope => scope !== 'common');
    const related = stationMetaFromScope(relatedScope);
    const relationText =
      related && related.stationId !== currentStation?.id
        ? ` Nội dung này còn liên quan đến trạm **${related.title}** đó 🌟`
        : '';

    return makeResult(
      'five-stations',
      normalizedQuery,
      friendlyDefinition(crossStation.entry) + relationText,
      crossStation.score >= 90 ? 'high' : 'medium',
      {
        matchedTerm: crossStation.entry.term,
        matchedEntryId: crossStation.entry.id,
        relatedStationId: related?.stationId,
        relatedStationTitle: related?.title,
      },
    );
  }

  // 4) KHO CHUNG: phương ngữ + từ nền dùng cho mọi trạm.
  const common = searchLexicon(
    query,
    entry => entry.stations.includes('common'),
  );

  if (common && common.score >= 70) {
    return makeResult(
      'common',
      normalizedQuery,
      friendlyDefinition(common.entry),
      common.score >= 90 ? 'high' : 'medium',
      {
        matchedTerm: common.entry.term,
        matchedEntryId: common.entry.id,
      },
    );
  }

  // 5) KHÔNG ĐOÁN.
  return makeResult('unknown', normalizedQuery, UNKNOWN_RESPONSE, 'low');
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
    'hoi-an': ['Thương cảng là gì?', 'Hội quán là gì?', 'Sông Hoài ở đâu?'],
  };

  return (scope && promptsByScope[scope]) || [
    'Từ này nghĩa là gì?',
    'Nơi này ở đâu?',
    'Kể mình nghe một chuyện lịch sử nhé!',
  ];
}

export const DANANG_ASSISTANT_DEMO_STATIONS = DEMO_STATIONS;
