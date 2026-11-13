/** Local navigation answers. Never queries protected school data. */
export type StaffAssistantPage='assistant-qa'|'effectiveness'|'reports';
const norm=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase();
export async function staffAssistantAnswer(question:string,experience:boolean):Promise<{answer:string;adminPage:StaffAssistantPage}|null>{
 const q=norm(question);
 if(/kiem dinh|kiem tra.*chatbot|chatbot.*(?:chat luong|25 tram)/.test(q))return {answer:'Mở Cài đặt → Kiểm định chatbot để chạy bộ tình huống cho các trạm và xem câu cần kiểm tra lại. '+(experience?'Trong chế độ trải nghiệm, phép kiểm chạy cục bộ, không ghi Firestore. Kết quả kỹ thuật không thay thế việc giáo viên đối chiếu nội dung.':'Chỉ kết luận chất lượng sau khi chạy kiểm định và xem các trường hợp chưa đạt.'),adminPage:'assistant-qa'};
 if(/ket qua.*lop|lop.*ket qua|bao cao.*(?:lop|hoc sinh)/.test(q))return {answer:'Chọn Dạy và học → Kết quả theo lớp. '+(experience?'Trang này hiển thị các lớp và kết quả trong dữ liệu trải nghiệm trên thiết bị, không phải kết quả học tập chính thức.':'Chọn lớp cần xem để đọc kết quả đã đồng bộ; không suy đoán dữ liệu khi chưa tải được báo cáo.'),adminPage:'reports'};
 if(/hieu qua|tong quan|luot truy cap|bao nhieu.*(?:nguoi|danh gia)|diem.*trung binh/.test(q)){
  if(!experience)return {answer:'Mở Báo cáo → Hiệu quả sử dụng để xem số liệu đã xác thực và chọn kỳ báo cáo. Tôi không tự lấy hoặc suy đoán số liệu học sinh từ câu hỏi này.',adminPage:'effectiveness'};
  const {getExperienceShowcase}=await import('../features/teacher/adminExperienceAnalyticsData');
  const data=getExperienceShowcase({month:'all',grade:0,audience:'all'});
  return {answer:`Bộ số liệu giả định phục vụ trải nghiệm có ${data.people.length} người, ${data.visits} lượt truy cập, ${data.ratings.length} đánh giá và điểm trung bình ${data.average?.toFixed(1).replace('.',',')}/5. Đây không phải số liệu thu thập thực tế. Mở Báo cáo → Hiệu quả sử dụng để lọc theo thời gian, khối lớp và đối tượng; các bộ lọc xử lý cục bộ.`,adminPage:'effectiveness'};
 }
 return null;
}
