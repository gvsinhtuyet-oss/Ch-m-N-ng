export interface LearningMeasure {
  version:1; id:string; kind:'student'; at:string; topicId:string; grade:number;
  preUnderstanding:0|1; preApplication:0|1; postUnderstanding:0|1; postApplication:0|1;
}
export interface TeacherMeasure {
  version:1; id:string; kind:'teacher'; at:string; topicId:string; grade:number;
  elapsedSeconds:number; baselineMinutes?:number; edits:'none'|'light'|'major'|'unusable';
}
export type EffectivenessMeasure=LearningMeasure|TeacherMeasure;
export interface MeasureStorage {getItem(key:string):string|null;setItem(key:string,value:string):void;}
const key=(scope:string)=>'cham-assistant-effectiveness-v1:'+encodeURIComponent(scope);
export function isEffectivenessMeasure(value:unknown):value is EffectivenessMeasure {
  if(!value||typeof value!=='object')return false;
  const row=value as EffectivenessMeasure;
  if(row.version!==1||!row.id||typeof row.id!=='string'||!row.topicId||typeof row.topicId!=='string'||!Number.isInteger(row.grade)||row.grade<1||row.grade>5||typeof row.at!=='string'||!Number.isFinite(Date.parse(row.at)))return false;
  if(row.kind==='student')return [row.preUnderstanding,row.preApplication,row.postUnderstanding,row.postApplication].every(score=>score===0||score===1);
  return row.kind==='teacher'&&Number.isFinite(row.elapsedSeconds)&&row.elapsedSeconds>=1&&row.elapsedSeconds<=86400&&['none','light','major','unusable'].includes(row.edits)&&(row.baselineMinutes===undefined||(Number.isFinite(row.baselineMinutes)&&row.baselineMinutes>0&&row.baselineMinutes<=1440));
}
export function readEffectiveness(storage:MeasureStorage,scope:string):EffectivenessMeasure[] {
  try{const rows=JSON.parse(storage.getItem(key(scope))||'[]');return Array.isArray(rows)?rows.filter(isEffectivenessMeasure).slice(-100):[];}catch{return [];}
}
export function saveEffectiveness(storage:MeasureStorage,scope:string,row:EffectivenessMeasure):void {
  if(!scope||!isEffectivenessMeasure(row))throw new Error('Kết quả ghi nhận chưa hợp lệ.');
  const previous=readEffectiveness(storage,scope).filter(item=>item.id!==row.id);
  storage.setItem(key(scope),JSON.stringify([...previous,row].slice(-100)));
}
export function summarizeEffectiveness(rows:EffectivenessMeasure[]) {
  const students=rows.filter((row):row is LearningMeasure=>row.kind==='student'&&isEffectivenessMeasure(row));
  const teachers=rows.filter((row):row is TeacherMeasure=>row.kind==='teacher'&&isEffectivenessMeasure(row));
  const sum=(field:'preUnderstanding'|'preApplication'|'postUnderstanding'|'postApplication')=>students.reduce((total,row)=>total+row[field],0);
  const seconds=teachers.map(row=>row.elapsedSeconds).sort((a,b)=>a-b);
  const mid=Math.floor(seconds.length/2);
  return {studentSessions:students.length,preUnderstanding:sum('preUnderstanding'),preApplication:sum('preApplication'),postUnderstanding:sum('postUnderstanding'),postApplication:sum('postApplication'),teacherSessions:teachers.length,medianSeconds:seconds.length?(seconds.length%2?seconds[mid]:(seconds[mid-1]+seconds[mid])/2):null,
    editCounts:Object.fromEntries(['none','light','major','unusable'].map(level=>[level,teachers.filter(row=>row.edits===level).length])) as Record<TeacherMeasure['edits'],number>};
}
// Export counts and timing only. No names, raw answers or student identifiers.
export function effectivenessCSV(rows:EffectivenessMeasure[]):string {
  const cell=(value:unknown)=>{let text=String(value??'');if(/^[=+@-]/.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"';};
  return '\uFEFF'+[['Loai','Thoi diem','Chu de','Lop','Hieu truoc','Van dung truoc','Hieu sau','Van dung sau','Giay chuan bi','Phut doi chieu tu khai','Muc chinh sua'],
    ...rows.filter(isEffectivenessMeasure).map(row=>row.kind==='student'?['student',row.at,row.topicId,row.grade,row.preUnderstanding,row.preApplication,row.postUnderstanding,row.postApplication,'','','']:['teacher',row.at,row.topicId,row.grade,'','','','',row.elapsedSeconds,row.baselineMinutes,row.edits])].map(row=>row.map(cell).join(',')).join('\r\n');
}
