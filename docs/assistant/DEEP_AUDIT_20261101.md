# Kiểm định và nâng cấp chatbox — 01/11/2026

## Mục tiêu và giới hạn kết luận

Chuẩn bị một sản phẩm có thể kiểm tra trực tiếp: hiểu yêu cầu, giải thích có nguồn, hỗ trợ học sinh tự học, giúp giáo viên mở học liệu và chuẩn bị bài, ghi nhận dữ liệu thật. Không có thể lệ hoặc thang điểm chính thức của cuộc thi trong hồ sơ hiện tại; các tiêu chí dưới đây là khung kiểm định sản phẩm đề xuất, không phải thang chấm của ban giám khảo.

Chưa có dữ liệu thử nghiệm lớp học. Kết quả kiểm tra mã và trình duyệt xác nhận chức năng, chưa xác nhận tác động học tập hay mức tiết kiệm thời gian của giáo viên. Không quy đổi kết quả kiểm thử thành điểm giám khảo hoặc phần trăm hiệu quả.

## Những lỗi phát hiện và sửa

| Tình huống | Trước | Sau |
|---|---|---|
| Yêu cầu mới sau lượt hỏi chưa rõ | Có thể nối cả câu hỏi cũ, chọn sai chủ đề | Chỉ nối lượt trả lời ngắn nêu chủ đề; nhiệm vụ mới có ưu tiên |
| “Đố em…” / “Đặt 3 câu hỏi…” | Có thể bị hiểu là hỏi kiến thức | Nhận đúng luyện tập / tạo câu hỏi |
| Xin 5 câu trắc nghiệm khi ngân hàng có 4 | Chỉ xuất 4 mà không giải thích | Xuất đủ 5 câu tự luận và nêu rõ chưa đủ bộ trắc nghiệm |
| Xin 10 câu hoặc hoạt động 2 phút | Âm thầm đổi số lượng hoặc thời lượng | Nêu giới hạn 1–5 câu, 3–20 phút và yêu cầu chọn lại |
| Viết lại 4 câu | Có thể lặp ví dụ để đủ câu | Dùng các câu có căn cứ, loại trùng; báo rõ nếu thiếu ý |
| Luyện một câu nhiều lần | Lặp một câu từ ngân hàng đo trước–sau | Ba lượt nhớ ý chính, ví dụ, vận dụng; có gợi ý, tự đối chiếu, tự phản hồi và câu tiếp theo |
| Hỏi “bài đang học” sau khi trò chuyện chủ đề khác | Có thể ưu tiên chủ đề trước | Ưu tiên bài đang mở; nếu chưa định danh được thì dùng học liệu trạm |
| Đổi lớp hoặc tài khoản | Ngữ cảnh chat có thể còn từ lượt trước | Khởi tạo lại hội thoại và bộ đếm luyện tập |
| Giáo viên mang câu trả lời sang giáo án | Sao chép thủ công dễ bỏ nguồn | Nút sao chép nội dung kèm tên và liên kết nguồn; báo khi trình duyệt không cho phép |

Không lưu câu tự luận hoặc tự phản hồi của học sinh. Nút cuộc trò chuyện mới chỉ làm mới hội thoại đang mở, không xóa nhật ký đo hiệu quả.

## Căn cứ thiết kế

- IES/WWC, *Organizing Instruction and Study to Improve Student Learning*: luyện nhớ lại, phản hồi sửa sai và câu hỏi yêu cầu giải thích. https://ies.ed.gov/ncee/wwc/PracticeGuide/1
- EEF, *Metacognition and Self-Regulated Learning*: gợi ý có hỗ trợ, khuyến khích học sinh theo dõi điều đã hiểu và xác định khi cần trợ giúp trong nội dung bài cụ thể. https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/metacognition/

Đây là cơ sở chọn thiết kế. Hiệu quả được báo cáo trong tài liệu nghiên cứu không phải hiệu quả đã đo của Chạm Đà Nẵng. Câu tự luận do học sinh tự đối chiếu; app không tự nhận đã chấm đúng hiểu biết hoặc lập luận.

## Kịch bản trình diễn 6 phút

| Thời lượng | Thao tác trực tiếp | Điều cần chứng minh |
|---|---|---|
| 0:00–0:45 | Vai giáo viên: “Mở bài Em yêu quê hương lớp 2”; mở chi tiết học liệu | Đến đúng nội dung, giảm thao tác tìm và có địa chỉ tích hợp |
| 0:45–1:30 | “San hô là thực vật đúng không?”; mở nguồn | Sửa tiền đề sai trực tiếp và cho người xem đối chiếu |
| 1:30–2:15 | Cùng hỏi “San hô là gì?” ở lớp 1 và lớp 5 | Mức giải thích thay đổi theo lớp; đổi lớp khởi tạo lại ngữ cảnh |
| 2:15–3:30 | Học sinh: “Đố em một câu về san hô”; xin gợi ý, trả lời bằng lời mình, đối chiếu, hỏi câu tiếp theo | Có hoạt động học, phản hồi và vận dụng; học sinh vẫn phải suy nghĩ |
| 3:30–4:30 | Giáo viên: “Tạo 3 câu hỏi về Hội An kèm đáp án”; “Hoạt động 5 phút bảo vệ san hô”; sao chép kèm nguồn | Đầu ra dùng được, có mục tiêu/thời lượng/tiêu chí và nguồn |
| 4:30–5:15 | Hỏi “Tạo 10 câu hỏi về san hô”, sau đó đổi sang nhiệm vụ mới; hỏi dữ kiện ngoài kho | Giới hạn được nói rõ; không kéo chủ đề cũ hoặc tự thêm dữ kiện |
| 5:15–6:00 | Mở bảng đo, giải thích quy trình và nhật ký thực có; xuất CSV nếu đã có lượt đo | Phân biệt dữ liệu chức năng, dữ liệu thử nghiệm và bằng chứng lớp học |

Dùng URL phiên bản đã kiểm tra. Thử trên thiết bị, mạng và màn chiếu sẽ dùng tại buổi chấm. Không nhập sẵn số liệu hoặc dùng dữ liệu kiểm tra của người phát triển để minh họa thành tích lớp học. Không tuyên bố AI tổng quát: kho có nguồn hoạt động độc lập; AI mở rộng chỉ xuất hiện khi dịch vụ được cấu hình sẵn.

## Khung kiểm định chức năng và chất lượng đề xuất

| Tiêu chí | Cách kiểm tra | Điều kiện đạt |
|---|---|---|
| Đúng nhiệm vụ | Kiến thức, so sánh, soạn câu hỏi, hoạt động, viết lại, luyện tập; đổi nhiệm vụ sau lượt chưa rõ | Đúng loại đầu ra và chủ đề; không bị nhiệm vụ cũ chi phối |
| Đúng ràng buộc | 1–5 câu, số bằng chữ, 3–20 phút, thiếu ngân hàng trắc nghiệm | Đủ số lượng hoặc nêu giới hạn rõ; không âm thầm thay đổi |
| Đúng và có căn cứ | Kiểm tra định nghĩa, tiền đề sai, nguồn; hỏi năm/số lượng chưa có dữ liệu | Nguồn hỗ trợ nội dung; thiếu dữ liệu phải nói rõ |
| Phù hợp người học | Cùng chủ đề lớp 1–2 và 3–5 | Câu ngắn và ví dụ gần gũi ở lớp nhỏ; câu hỏi vận dụng ở lớp lớn |
| Học chủ động | Gợi ý trước, trả lời, tự đối chiếu, câu tiếp theo | Đáp án không hiện trước khi học sinh thực hiện lượt tự trả lời |
| Hỗ trợ giáo viên | Tìm bài, mở đúng mục, soạn câu hỏi và hoạt động; sao chép | Ít bước, nội dung cụ thể và giữ nguồn khi sao chép |
| Giữ công bằng | Học sinh trong Chặng 2 hỏi đáp án hoặc tạo câu hỏi | Giữ cơ chế tự làm; không cung cấp đáp án thay |
| Khả dụng | Màn hình 390 px và máy tính; phím Enter/Escape; nút rõ | Không tràn ngang; các luồng chính thao tác được |
| Trung thực bằng chứng | Chưa có dữ liệu, đã gặp câu hỏi, lượt lặp, dữ liệu tự khai | Không coi số lượt là số học sinh hoặc suy luận tác động nhân quả |

## Thử nghiệm thực địa tiếp theo

1. Giáo viên và học sinh dùng một nhiệm vụ cụ thể trong bài; ghi rõ lớp, chủ đề, thời lượng, điều kiện thiết bị và sự trợ giúp của người lớn. Không thu tên học sinh trong chatbox.
2. Kiểm tra hiểu và vận dụng trước khi học, ngay sau học và sau 7–14 ngày bằng các bộ câu tương đương đã được giáo viên duyệt. Bộ 4 câu hiện tại chỉ là quan sát ngắn, chưa có độ tin cậy hoặc định chuẩn. Luyện tập mới không dùng câu của bộ đo; tuy nhiên chức năng giáo viên tạo trắc nghiệm và những lượt đo trước vẫn có thể làm người học đã gặp câu đo. Phải ghi nhận sự tiếp xúc này, không coi lượt lặp là bằng chứng độc lập.
3. Với giáo viên, đo thời gian thực cho hai nhiệm vụ chuẩn bị tương đương, một nhiệm vụ dùng cách thường làm và một nhiệm vụ dùng chatbox; đổi thứ tự giữa các giáo viên. Mời một giáo viên khác kiểm tra tính đúng, mức chỉnh sửa và khả năng sử dụng sản phẩm. Thời gian đối chiếu tự khai trong app chỉ là tham khảo.
4. Báo cáo số người tham gia, số lượt, kết quả từng chiều hiểu/vận dụng, phân bố thời gian và mức chỉnh sửa, cả trường hợp không cải thiện. Chỉ tuyên bố điều dữ liệu hỗ trợ; so sánh có đối chứng cần một thiết kế nghiên cứu riêng.

## Kiểm chứng trong đợt nâng cấp

Kiểm tra tự động bổ sung: yêu cầu mới sau pending task, số câu bằng chữ/số, ngoài giới hạn, thiếu bộ trắc nghiệm, câu viết lại không lặp và ba lượt luyện tập trên toàn bộ 51 chủ đề. CI kiểm tra TypeScript, hồi quy trợ lý, build và đóng gói. Kiểm tra trình duyệt thực hiện trên URL preview trước khi hợp nhất; kết quả chi tiết được ghi trong PR.
