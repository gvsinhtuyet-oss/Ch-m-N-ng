import { bundledGddpCatalog } from '../../services/GddpBundledCatalog';
import type { GddpRecord } from '../../services/GddpService';
import type { TeacherWorkspace } from '../../services/TeacherWorkspaceService';
import { matchGddpResources } from '../../services/GddpResourceMatcher';
import type { Station } from '../../types';
import { publicGddpTextbookRecords, reviewGddpTextbookAddress } from '../../../gddp-textbook-review.mjs';

export const DEFAULT_SCHOOL = 'Trường Tiểu học Trần Đại Nghĩa';
export const DEFAULT_BOOK = 'Kết nối tri thức với cuộc sống';
export const DEFAULT_YEAR = '2026-2027';
export const MAX_PLAN_RECORDS = 100;

export const makeEmptyWorkspace = (grade:number):TeacherWorkspace => ({
  school:DEFAULT_SCHOOL, book:DEFAULT_BOOK, year:DEFAULT_YEAR,
  grade:grade>=1&&grade<=5?grade:2, records:[],
});

/** Never replace non-empty teacher fields or alter any existing integration rows. */
export function withWorkspaceDefaults(source:TeacherWorkspace|null|undefined,grade:number):TeacherWorkspace {
  const basis=makeEmptyWorkspace(grade);
  if(!source||typeof source!=='object')return basis;
  return {...basis,...source,
    school:source.school?.trim()||DEFAULT_SCHOOL,
    book:source.book?.trim()||DEFAULT_BOOK,
    year:source.year?.trim()||DEFAULT_YEAR,
    grade:Number.isInteger(source.grade)&&source.grade>=1&&source.grade<=5?source.grade:basis.grade,
    records:Array.isArray(source.records)?source.records.slice(0,MAX_PLAN_RECORDS):[],
  };
}

export const textbookSuggestions:ReadonlyArray<GddpRecord> = publicGddpTextbookRecords(bundledGddpCatalog.records)
  .filter(row=>reviewGddpTextbookAddress(row).status==='title_checked')
  .filter(row=>row.grade>=1&&row.grade<=5&&!!row.lesson.trim()&&!!row.subject.trim());

export const normalizeSearch=(value:string)=>value.toLocaleLowerCase('vi-VN').normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/\s+/g,' ').trim();

export function availableSuggestions(grade:number,subject:string,search:string) {
  const q=normalizeSearch(search);
  return textbookSuggestions.filter(row=>row.grade===grade
    &&(!subject||row.subject===subject)
    &&(!q||normalizeSearch(row.lesson+' '+row.content+' '+row.subject).includes(q)));
}

export function lessonResources(row:GddpRecord,stations:Station[]) {
  const matches=matchGddpResources(row,stations);
  // A link is a candidate when it points to existing, populated học liệu.
  const selected=new Map<string,typeof matches[number]>();
  for(const match of matches){
    const key=match.station.id+':'+match.hotspot.id;
    if(!selected.has(key))selected.set(key,match);
  }
  return [...selected.values()].slice(0,8);
}

export function makePrivateRecord(row:GddpRecord,stations:Station[],id:string):GddpRecord {
  const links=lessonResources(row,stations)
    .filter(m=>(row.resourceLinks||[]).some(link=>link.stationId===m.station.id&&link.hotspotId===m.hotspot.id))
    .map(m=>({stationId:m.station.id,hotspotId:m.hotspot.id}));
  return {
    id,grade:row.grade,subject:row.subject,week:row.week||'',
    lesson:row.lesson,content:row.content,activity:row.activity,
    integrationType:row.integrationType||'Liên hệ',
    outcomes:row.outcomes||'',teachingSuggestion:row.teachingSuggestion||'',
    resourceLinks:links,
  };
}
