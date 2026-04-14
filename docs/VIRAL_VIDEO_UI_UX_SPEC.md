# Viral Video Tools - UI UX Spec

## Mục tiêu UX
Tạo trải nghiệm đơn giản theo đúng tư duy người dùng phổ thông:
1. Xem cái gì đang viral
2. Chọn chủ đề lớn
3. Chọn chủ đề nhỏ
4. Tạo nội dung đầy đủ
5. Tạo video từng cảnh
6. Xem lại từng cảnh
7. Ghép thành video cuối

Nguyên tắc:
- ít nhập tay, nhiều chọn sẵn
- flow tuyến tính, dễ hiểu
- luôn có nút quay lại bước trước
- trạng thái job rõ ràng
- mobile-first, Android-first

---

## Kiến trúc điều hướng

## Tab chính
- Dashboard
- Viral Radar
- Topic Builder
- Render Studio
- Library
- Settings

### Khuyến nghị giai đoạn 1
Chỉ cần 4 tab:
- Dashboard
- Viral Radar
- Render Studio
- Library

---

## Màn 1: Dashboard

## Mục tiêu
Cho người dùng thấy ngay hôm nay nên làm gì.

## Khối giao diện
### 1. Quick summary cards
- Top chủ đề hôm nay
- Chủ đề kiếm tiền tốt nhất
- Nền tảng đang nóng nhất
- Số video đang render

### 2. CTA chính
- Quét viral ngay
- Xem 5 chủ đề đề xuất
- Tiếp tục video đang làm dở

### 3. Recent projects
- danh sách content package gần đây
- trạng thái: draft, rendering, approved, stitched

### 4. Alerts
- cảnh báo scene lỗi
- cảnh nào cần duyệt lại
- final video đã xong

---

## Màn 2: Viral Radar

## Mục tiêu
Hiển thị dữ liệu viral đa nền tảng, lọc và sắp hạng dễ hiểu.

## Header filters
- Quốc gia
- Ngôn ngữ
- Nền tảng
- Khoảng thời gian: 24h, 7 ngày, 30 ngày
- Định dạng: short, long, mixed

## Khu vực chính
### A. Top main topics
Card mỗi chủ đề gồm:
- Tên chủ đề
- Viral score
- Monetization score
- Competition
- Nền tảng mạnh nhất
- nút: Xem chi tiết
- nút: Tạo 20 chủ đề nhỏ

### B. Rising viral items
List / cards gồm:
- thumbnail
- title
- platform
- views
- growth
- topic mapped
- url nguồn

### C. 5 chủ đề đề xuất để xây kênh
Mỗi card gồm:
- tên chủ đề
- mô tả ngắn
- hashtag
- SEO keywords
- lý do đề xuất
- nút: Chọn chủ đề này

---

## Màn 3: Main Topic Detail

## Mục tiêu
Đi sâu vào 1 chủ đề lớn.

## Khu vực giao diện
### 1. Topic hero card
- tên chủ đề
- mô tả
- viral score
- monetization score
- recommended platform
- recommended format
- recommended styles

### 2. Data evidence
- top video tham chiếu
- keywords đang tăng
- hashtag mạnh
- kiểu hook đang hoạt động tốt

### 3. CTA
- Sinh 20 chủ đề nhỏ
- Lưu chủ đề
- So sánh với chủ đề khác

---

## Màn 4: Subtopic Generator

## Mục tiêu
Hiện 20 chủ đề nhỏ rõ ràng, dễ chọn.

## Bố cục
### Filter row
- mục tiêu: kéo view, kéo follow, kéo comment, kéo chuyển đổi
- định dạng: short, long, both

### List 20 subtopics
Mỗi item gồm:
- tiêu đề chủ đề nhỏ
- angle nội dung
- target audience
- mục tiêu video
- style phù hợp
- độ mạnh hook
- nút: Tạo package

### Bulk actions
- tạo lại 20 chủ đề nhỏ
- trộn góc nhìn mới
- lọc theo cảm xúc

---

## Màn 5: Content Package Builder

## Mục tiêu
Cho người dùng xem và chỉnh nội dung chi tiết trước khi sang prompt video.

## Layout
### Section A. Nội dung song ngữ
- Title VI
- Title EN
- Description VI
- Description EN
- Hashtags
- SEO keywords VI
- SEO keywords EN

### Section B. Cấu hình video
- thời lượng: < 1 phút, 1, 2, 3, 5, 10 phút
- style video
- ratio: 16:9 hoặc 9:16
- tone voice
- target platform

### Section C. CTA
- Generate Scene Prompts
- Save Draft
- Duplicate package

---

## Màn 6: Scene Prompt Board

## Mục tiêu
Biến 1 content package thành nhiều cảnh có thể render.

## Dạng hiển thị
Dùng card list hoặc bảng.

### Mỗi scene card gồm
- Scene number
- duration
- goal
- visual prompt
- negative prompt
- voiceover
- on-screen text
- status
- version

### Actions
- edit
- render scene
- rerender scene
- duplicate scene
- split scene
- merge next scene

### Bulk actions
- Render all
- Render selected
- Approve selected
- Export prompt JSON

---

## Màn 7: Render Studio

## Mục tiêu
Theo dõi job render hàng loạt.

## Bố cục
### Job summary row
- total scenes
- done
- rendering
- failed
- approved

### Scene table
Cột:
- Scene
- Prompt version
- Status
- Provider
- Duration
- Preview
- Error
- Actions

### Status colors
- draft: xám
- queued: xanh nhạt
- rendering: xanh dương
- done: xanh lá
- failed: đỏ
- approved: tím

### Actions mỗi dòng
- xem clip
- chạy lại
- sửa prompt
- approve
- reject

---

## Màn 8: Scene Review

## Mục tiêu
Giúp user quyết nhanh cảnh nào đạt, cảnh nào cần làm lại.

## Layout mobile-first
- video preview lớn phía trên
- thông tin prompt phía dưới theo accordion
- 3 nút nổi bật:
  - OK cảnh này
  - Chạy lại cảnh này
  - Sửa prompt rồi chạy lại

### Thêm tính năng
- swipe trái phải qua các scene
- compare version cũ / mới
- note lý do rerender

---

## Màn 9: Final Stitcher

## Mục tiêu
Ghép thành video cuối.

## Khối giao diện
### 1. Scene sequence
- danh sách cảnh đã approved
- kéo thả sắp xếp lại nếu cần

### 2. Final options
- thêm voiceover
- thêm subtitle
- thêm nhạc nền
- thêm watermark/logo
- intro/outro
- transition nhẹ

### 3. Export
- export mp4
- export subtitle srt
- export transcript
- export thumbnail prompt

### 4. Final preview
- video hoàn chỉnh
- thời lượng cuối
- dung lượng file
- nút tải xuống

---

## Màn 10: Library

## Mục tiêu
Quản lý toàn bộ dự án video đã tạo.

## Tabs con
- Drafts
- Rendering
- Approved Scenes
- Final Videos
- Failed Jobs

### Mỗi project card
- project name
- main topic
- subtopic
- style
- ratio
- updated time
- progress bar

---

## Component system đề xuất

## Reusable components
- TopicCard
- ViralItemCard
- RecommendationCard
- SubtopicCard
- ContentFieldGroup
- StylePresetSelector
- DurationSelector
- RatioToggle
- SceneCard
- RenderStatusBadge
- VideoPreviewModal
- FinalExportCard

---

## Mobile UX quan trọng
- bottom tabs cố định
- CTA luôn nằm dưới cùng dễ bấm
- text area prompt có collapse/expand
- preview scene mở full-screen
- loading states rõ ràng
- tránh bảng quá rộng, chuyển sang card stack trên mobile

---

## Flow chuẩn user

### Flow A: từ trend tới video
1. vào Viral Radar
2. lọc thị trường và nền tảng
3. chọn 1 trong 5 chủ đề chính
4. mở 20 chủ đề nhỏ
5. chọn 1 chủ đề nhỏ
6. xem content package
7. chọn thời lượng, style, aspect ratio
8. generate scene prompts
9. render all scenes
10. duyệt từng scene
11. stitch final video
12. lưu Library

### Flow B: làm lại cảnh lỗi
1. mở project trong Render Studio
2. lọc failed scenes
3. bấm rerender
4. review lại
5. approve
6. stitch lại final

---

## Trạng thái UX cần có
- empty state
- loading state
- partial success
- failed scene state
- no trending data state
- provider unavailable state

---

## Microcopy gợi ý
- Quét chủ đề đang viral
- Đề xuất 5 chủ đề đáng làm nhất
- Tạo 20 chủ đề nhỏ
- Tạo nội dung song ngữ
- Tạo prompt từng phân cảnh
- Render toàn bộ cảnh
- Xem lại cảnh lỗi
- Ghép video hoàn chỉnh

---

## Ưu tiên build UI phase 1
1. Viral Radar
2. Main Topic Recommendations
3. Subtopic List
4. Content Package Builder
5. Scene Prompt Board
6. Render Studio
7. Final Stitcher
