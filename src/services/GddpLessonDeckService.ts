import {GRADE1_LESSON_DECKS} from '../data/teacher/grade1LessonDecks';
import type { GddpRecord } from './GddpService';
import { GRADE2_LESSON_DECKS, type LessonDeckDefinition } from '../data/teacher/grade2LessonDecks';

const normalized = (text: string) => text.normalize('NFC').replace(/\s+/g, ' ').trim();
const fields = ['id', 'subject', 'week', 'lesson', 'integrationType', 'activity', 'content'] as const;

// A stable ID alone is insufficient: a server-edited lesson must never inherit
// an old deck about a different topic. Outcomes/notes/links may be edited safely.
export function getGddpLessonDeck(record: GddpRecord): LessonDeckDefinition | null {
  const decks=record.grade===1?GRADE1_LESSON_DECKS:record.grade===2?GRADE2_LESSON_DECKS:[];
  const deck = decks.find(item => item.recordId === record.id);
  const original = deck?.sourceRecord;
  if (!original || original.grade!==record.grade || fields.some(field => typeof record[field] !== 'string' || normalized(record[field]) !== normalized(original[field]))) return null;
  return deck || null;
}

// Use corrected teaching text without mutating the source catalog or saved records.
export function getGddpTeachingRecord(record:GddpRecord):GddpRecord {
  const deck=getGddpLessonDeck(record);
  return deck?.teachingContent?{...record,content:deck.teachingContent}:record;
}
