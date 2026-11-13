import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  EXPERIENCE_SHOWCASE_DATES, EXPERIENCE_SHOWCASE_PEOPLE, getExperienceShowcase,
} from './src/features/teacher/adminExperienceAnalyticsData';

const all = {month:'all' as const,grade:0,audience:'all' as const};
const total = getExperienceShowcase(all);
const count = (xs:ReadonlyArray<{count:number}>)=>xs.reduce((sum,x)=>sum+x.count,0);

test('267 distinct fictional visitors and internally consistent experience totals',()=>{
  assert.equal(EXPERIENCE_SHOWCASE_PEOPLE.length,267);
  assert.equal(new Set(EXPERIENCE_SHOWCASE_PEOPLE.map(p=>p.id)).size,267);
  assert.equal(total.people.length,267);
  assert.equal(total.visits,312);
  assert.equal(total.ratings.length,210);
  assert.equal(EXPERIENCE_SHOWCASE_DATES.length,44);
  assert.equal(count(total.ratingCounts),210);
  assert.equal(count(total.byGrade),267);
  assert.equal(total.byAudience.student+total.byAudience.guest,267);
  assert.equal(total.daily.reduce((sum,d)=>sum+d.visits,0),total.visits);
  assert.ok(total.average!==null && total.average>=4.6 && total.average<=4.8);
  assert.equal(total.start,'2026-10-01');
  assert.equal(total.end,'2026-11-13');
  assert.ok(total.funnel.every((entry,index,arr)=>!index||entry.count<=arr[index-1].count));
  assert.ok(total.stationRanking.every(s=>s.count>0 && s.title.length>0));
});

test('October to November split, grade and role filters preserve coherent counts',()=>{
  const oct = getExperienceShowcase({...all,month:'2026-10'});
  const nov = getExperienceShowcase({...all,month:'2026-11'});
  assert.equal(oct.people.length+nov.people.length,267);
  assert.ok(nov.people.length>oct.people.length);
  assert.equal(oct.visits+nov.visits,total.visits);
  for(const month of ['all','2026-10','2026-11'] as const){
    const base=getExperienceShowcase({...all,month});
    const selectedGrades=[1,2,3,4,5].map(grade=>getExperienceShowcase({...all,month,grade}));
    const students=getExperienceShowcase({...all,month,audience:'student'});
    const guests=getExperienceShowcase({...all,month,audience:'guest'});
    assert.equal(selectedGrades.reduce((sum,g)=>sum+g.people.length,0),base.people.length);
    assert.equal(selectedGrades.reduce((sum,g)=>sum+g.visits,0),base.visits);
    assert.equal(students.people.length+guests.people.length,base.people.length);
    assert.equal(students.visits+guests.visits,base.visits);
    assert.equal(base.daily.reduce((sum,d)=>sum+d.visits,0),base.visits);
  }
});

test('Showcase is explicitly labelled fictional and does not query or mutate real analytics',()=>{
  const visualization=readFileSync('src/features/teacher/AdminExperienceAnalytics.tsx','utf8');
  const data=readFileSync('src/features/teacher/adminExperienceAnalyticsData.ts','utf8');
  const workspace=readFileSync('src/features/teacher/ExperienceWorkspace.tsx','utf8');
  assert.match(visualization,/DỮ LIỆU MÔ PHỎNG/);
  assert.match(visualization,/Không gửi API, không ghi Firestore/);
  assert.match(data,/entirely fictitious/);
  assert.match(workspace,/AdminExperienceAnalytics mode="overview"/);
  assert.match(workspace,/AdminExperienceAnalytics mode="ratings"/);
  assert.match(workspace,/AdminExperienceAnalytics mode="effectiveness"/);
  assert.doesNotMatch(data+visualization,/\bfetch\s*\(|authService|\/api\/effectiveness|firebase\/|\.firestore\(/);
});
