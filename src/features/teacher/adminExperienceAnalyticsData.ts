import { ALL_25_STATIONS } from '../../data/allStations';

export type ExperienceMonth = 'all' | '2026-10' | '2026-11';
export type ExperienceAudience = 'all' | 'student' | 'guest';
export type ExperienceFilters = {
  month: ExperienceMonth;
  grade: number;
  audience: ExperienceAudience;
};

type Person = {
  id: string;
  grade: number;
  audience: Exclude<ExperienceAudience, 'all'>;
  visits: string[];
  completedStage: number;
  stars: number;
  stationId: string;
};

const GRADES = [46, 58, 53, 56, 54] as const;
const GRADE_POOL = GRADES.flatMap((count, grade) => Array.from({ length: count }, () => grade + 1));
const oneDay = (month: number, day: number) => '2026-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');

/**
 * Reproducible, entirely fictitious 2026 showcase. Do not send this dataset to
 * production analytics endpoints or present it as live analytics.
 *
 * 267 fictional distinct participants; 45 repeat visits => 312 visits;
 * exactly 210 fictional ratings. November has more first-time participants.
 */
export const EXPERIENCE_SHOWCASE_PEOPLE: ReadonlyArray<Person> = Array.from({ length: 267 }, (_, i) => {
  const grade = GRADE_POOL[(i * 59) % GRADE_POOL.length];
  const audience: Person['audience'] = (i * 71) % 267 < 58 ? 'guest' : 'student';
  const month = i < 85 ? 10 : 11;
  const maxDay = month === 10 ? 31 : 13;
  const firstDay = ((i * (month === 10 ? 11 : 7) + 7) % maxDay) + 1;
  const visits = [oneDay(month, firstDay)];
  if (i % 6 === 0) visits.push(oneDay(month, (firstDay + (month === 10 ? 10 : 4) - 1) % maxDay + 1));
  const stageRank = (i * 43) % 267;
  const completedStage = stageRank < 165 ? 4 : stageRank < 199 ? 3 : stageRank < 229 ? 2 : stageRank < 252 ? 1 : 0;
  const ratingRank = (i * 17) % 267;
  const stars = ratingRank < 155 ? 5 : ratingRank < 199 ? 4 : ratingRank < 207 ? 3 : ratingRank < 210 ? 2 : 0;
  const gradeStations = ALL_25_STATIONS.filter(station => station.grade === grade);
  const stationId = gradeStations[(i * 7) % gradeStations.length]?.id || '';
  return { id: 'showcase-person-' + String(i + 1).padStart(3, '0'), grade, audience, visits, completedStage, stars, stationId };
});

export const EXPERIENCE_SHOWCASE_DATES = [
  ...Array.from({ length: 31 }, (_, day) => oneDay(10, day + 1)),
  ...Array.from({ length: 13 }, (_, day) => oneDay(11, day + 1)),
];

export const EXPERIENCE_SHOWCASE_FEEDBACK = [
  'Em thích tìm hiểu các địa điểm qua hình ảnh.',
  'Phần nghe thuyết minh giúp em nhớ kiến thức hơn.',
  'Trò chơi thử thách hấp dẫn và dễ thao tác.',
  'Em muốn khám phá thêm nhiều địa danh ở Đà Nẵng.',
  'Bản đồ và hộ chiếu khám phá rất trực quan.',
  'Em thích nhận dấu sau mỗi lần hoàn thành.',
];

export function getExperienceShowcase(filters: ExperienceFilters) {
  const people = EXPERIENCE_SHOWCASE_PEOPLE.filter(person =>
    (!filters.grade || person.grade === filters.grade) &&
    (filters.audience === 'all' || person.audience === filters.audience) &&
    person.visits.some(day => filters.month === 'all' || day.startsWith(filters.month))
  );
  const days = EXPERIENCE_SHOWCASE_DATES.filter(day => filters.month === 'all' || day.startsWith(filters.month));
  const daily = days.map(day => ({
    day,
    visits: people.reduce((total, person) => total + person.visits.filter(visit => visit === day).length, 0),
    unique: people.filter(person => person.visits.includes(day)).length,
  }));
  const visits = daily.reduce((total, day) => total + day.visits, 0);
  const ratings = people.filter(person => person.stars > 0);
  const ratingCounts = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: ratings.filter(person => person.stars === stars).length,
  }));
  const average = ratings.length ? ratings.reduce((sum, person) => sum + person.stars, 0) / ratings.length : null;
  const byGrade = [1, 2, 3, 4, 5].map(grade => ({
    grade, count: people.filter(person => person.grade === grade).length,
  }));
  const byAudience = {
    student: people.filter(person => person.audience === 'student').length,
    guest: people.filter(person => person.audience === 'guest').length,
  };
  const funnel = [1, 2, 3, 4].map(stage => ({
    stage, count: people.filter(person => person.completedStage >= stage).length,
  }));
  const stationRanking = ALL_25_STATIONS.map(station => ({
    id: station.id, title: station.titleVi, grade: station.grade,
    count: people.filter(person => person.stationId === station.id).length,
  })).sort((a, b) => b.count - a.count).slice(0, 5);
  return {
    people, daily, visits, ratings, ratingCounts, average,
    byGrade, byAudience, funnel, stationRanking,
    start: days[0], end: days[days.length - 1],
  };
}
