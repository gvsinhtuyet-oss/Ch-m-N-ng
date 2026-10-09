// Text-only, Admin-initiated AI suggestions. Never send student records or authentication data.
export function gddpPrompt(row) {
  return [
    'Bạn là trợ lý chuyên môn giáo dục tiểu học Việt Nam.',
    'Chỉ đề xuất phần tích hợp Giáo dục địa phương Đà Nẵng, KHÔNG soạn cả tiết, KHÔNG tạo tiết GDĐP riêng.',
    'Chỉ sử dụng nguồn được cung cấp dưới đây; không tự suy đoán dữ kiện, địa danh, số liệu hay vị trí SGK.',
    'Trả về JSON gồm đúng hai khóa: outcomes (1–2 yêu cầu cần đạt ngắn), teachingSuggestion (GV hỏi – HS dự kiến – GV chốt, ngắn gọn trong hoạt động có sẵn).',
    'Giữ nguyên địa chỉ tích hợp và hình thức từ nguồn; nếu thiếu chi tiết, dùng cách diễn đạt chung an toàn.',
    'DỮ LIỆU NGUỒN:',
    JSON.stringify({grade:row.grade,subject:row.subject,week:row.week,
      lesson:row.lesson,activity:row.activity,integrationType:row.integrationType,
      content:row.content.slice(0,1800)}),
  ].join('\n');
}
export function cleanGddpAiSuggestion(result) {
  if (!result || typeof result !== 'object' || Array.isArray(result) ||
      typeof result.outcomes !== 'string' || typeof result.teachingSuggestion !== 'string')
    throw Object.assign(new Error('AI chưa trả về gợi ý đúng định dạng.'),{status:502});
  const outcomes = result.outcomes.trim().slice(0,1200);
  const teachingSuggestion = result.teachingSuggestion.trim().slice(0,2500);
  if (!outcomes || !teachingSuggestion)
    throw Object.assign(new Error('Gợi ý AI thiếu nội dung.'),{status:502});
  return {outcomes,teachingSuggestion};
}
