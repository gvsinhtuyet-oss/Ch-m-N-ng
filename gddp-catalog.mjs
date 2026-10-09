// Kho địa chỉ GDĐP độc lập với học liệu trạm và dữ liệu đăng nhập.
export const GDDP_YEAR = '2026-2027';
export const GDDP_COLLECTION = 'cham_gddp_catalog';
export const GDDP_DOCUMENT = 'year-2026-2027';
export const GDDP_MAX_RECORDS = 500;
const str = (v, max = 10000) => typeof v === 'string' && v.length <= max;
export function validateGddpCatalog(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data) ||
      data.year !== GDDP_YEAR || !Array.isArray(data.records) ||
      data.records.length > GDDP_MAX_RECORDS) return false;
  const ids = new Set();
  for (const row of data.records) {
    if (!row || typeof row !== 'object' || Array.isArray(row) ||
        !str(row.id, 90) || !/^[a-zA-Z0-9_-]+$/.test(row.id) ||
        ids.has(row.id) || !Number.isInteger(row.grade) ||
        row.grade < 1 || row.grade > 5 ||
        !str(row.subject, 120) || !row.subject.trim() ||
        !str(row.week, 80) || !str(row.lesson, 450) || !row.lesson.trim() ||
        !str(row.integrationType, 100) || !str(row.activity, 800) ||
        !str(row.content, 9000) || !row.content.trim()) return false;
    ids.add(row.id);
  }
  return true;
}
export function cleanGddpCatalog(data) {
  if (!validateGddpCatalog(data)) throw Object.assign(new Error('Dữ liệu địa chỉ GDĐP không hợp lệ.'), {status:400});
  return {year:GDDP_YEAR,records:data.records.map(({id,grade,subject,week,lesson,integrationType,activity,content})=>({
    id,grade,subject:subject.trim(),week:week.trim(),lesson:lesson.trim(),
    integrationType:integrationType.trim(),activity:activity.trim(),content:content.trim()
  }))};
}
