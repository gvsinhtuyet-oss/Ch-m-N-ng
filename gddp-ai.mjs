// Text-only, Admin-initiated AI suggestions. Never send student records or authentication data.
export function gddpPrompt(row) {
  return [
    'Bạn là trợ lý chuyên môn giáo dục tiểu học Việt Nam.',
    'Chỉ đề xuất phần tích hợp Giáo dục địa phương Đà Nẵng, KHÔNG soạn cả tiết, KHÔNG tạo tiết GDĐP riêng.',
    'Chỉ sử dụng nguồn được cung cấp dưới đây; không tự suy đoán dữ kiện, địa danh, số liệu hay vị trí SGK.',
    'Trả về JSON gồm đúng hai khóa: outcomes (1–2 yêu cầu cần đạt ngắn), teachingSuggestion (kịch bản cụ thể, ngắn gọn).',
    'Trong teachingSuggestion, trình bày lần lượt: (1) Vị trí tích hợp theo nguồn; (2) Khởi động/quan sát khoảng 2 phút: giáo viên nói gì, học sinh làm gì; (3) Tương tác khoảng 2 phút: 2 câu hỏi và câu trả lời dự kiến; (4) Vận dụng khoảng 1 phút: nhiệm vụ, lời chốt và cách quay lại bài học chính; (5) Học liệu cần dùng: chỉ nêu học liệu được xác nhận trong dữ liệu nguồn, nếu không có thì ghi cần giáo viên chọn.',
    'Tên bài, tuần và hoạt động trong dữ liệu là bảng địa chỉ tích hợp, CHƯA phải bằng chứng đã kiểm chứng toàn văn SGK hiện hành. Không khẳng định số trang, yêu cầu cần đạt SGK, lời văn SGK hay mức độ khớp SGK nếu nguồn không có.',
    'Không thêm kiến thức địa phương, mốc thời gian, danh nhân hoặc chi tiết lịch sử ngoài dữ liệu. Nếu dữ liệu quá sơ lược, nêu rõ phần cần giáo viên kiểm tra, không tự điền.',
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
