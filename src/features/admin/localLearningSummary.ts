type Row = {id:string;name:string;started:number;completed:number;stamps:number;checkIns:number;lastVisitedAt:string};
export function summarizeLocalProgress(raw: unknown, profile?: {id?:string;name?:string}) {
  const rows = new Map<string,Row>();
  const seen = new Set<string>();
  if (raw && typeof raw==='object' && !Array.isArray(raw)) for(const value of Object.values(raw)) {
    if(!value || typeof value!=='object')continue;
    const p=value as Record<string,unknown>;
    if(typeof p.studentId!=='string' || !p.studentId || p.studentId==='guest' || p.studentId.endsWith('-demo') || typeof p.stationId!=='string' || !p.stationId)continue;
    const key=p.studentId+':::'+p.stationId;
    if(seen.has(key))continue; seen.add(key);
    // Empty records created while inspecting a summary are not participation.
    const participated=!!p.startedAt || p.stage1Completed===true || p.stage2Completed===true || p.stage3Completed===true || p.stage4Completed===true || p.stationCompleted===true;
    if(!participated)continue;
    const row=rows.get(p.studentId)||{id:p.studentId,name:profile?.id===p.studentId && profile.name ? profile.name : p.studentId,started:0,completed:0,stamps:0,checkIns:0,lastVisitedAt:''};
    row.started++; row.completed+=Number(p.stationCompleted===true);row.stamps+=Number(p.stampReceived===true);row.checkIns+=Number(!!p.checkInResponse);
    if(typeof p.lastVisitedAt==='string' && Number.isFinite(Date.parse(p.lastVisitedAt)) && (!row.lastVisitedAt || Date.parse(p.lastVisitedAt)>Date.parse(row.lastVisitedAt)))row.lastVisitedAt=p.lastVisitedAt;
    rows.set(row.id,row);
  }
  const students=[...rows.values()];
  const started=students.reduce((n,s)=>n+s.started,0),completed=students.reduce((n,s)=>n+s.completed,0);
  return {students,started,completed,rate:started ? Math.round(completed/started*100) : 0,error:''};
}
export function localLearningSummary() {
  try {
    const raw=JSON.parse(localStorage.getItem('cham_danang_progress_v2')||'{}');
    let profile;try{profile=JSON.parse(localStorage.getItem('cham_danang_student_profile_v1')||'null');}catch{}
    return summarizeLocalProgress(raw,profile);
  }catch{return {...summarizeLocalProgress({}),error:'Không đọc được tiến độ trên thiết bị. Chưa thể tính số liệu.'};}
}
