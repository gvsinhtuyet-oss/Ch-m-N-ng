import type { GddpRecord } from './GddpService';
import { GRADE2_LESSON_DECKS, type LessonDeckDefinition } from '../data/teacher/grade2LessonDecks';

const normalized = (text: string) => text.normalize('NFC').replace(/\s+/g, ' ').trim();
const fields = ['id', 'subject', 'week', 'lesson', 'integrationType', 'activity', 'content'] as const;

// A stable ID alone is insufficient: a server-edited lesson must never inherit
// an old deck about a different topic. Outcomes/notes/links may be edited safely.
export function getGddpLessonDeck(record: GddpRecord): LessonDeckDefinition | null {
  if (record.grade !== 2) return null;
  const deck = GRADE2_LESSON_DECKS.find(item => item.recordId === record.id);
  const original = deck?.sourceRecord;
  if (!original || fields.some(field => typeof record[field] !== 'string' || normalized(record[field]) !== normalized(original[field]))) return null;
  return deck || null;
}
