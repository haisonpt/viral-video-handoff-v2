# Viral Video Tools - Product & System Spec

## Mục tiêu
Xây bộ Tools giúp người dùng tìm chủ đề viral, chọn niche để xây kênh, sinh ý tưởng video, viết metadata song ngữ, tạo prompt video nhiều phân cảnh, render hàng loạt từng cảnh, retry cảnh lỗi, preview cảnh, rồi ghép thành video hoàn chỉnh.

## Tên gợi ý sản phẩm
- ViralForge AI
- ViralRadar Studio
- Trend2Video AI
- MillionView Builder

Khuyến nghị: **ViralRadar Studio**

---

## 1. Bộ Tools chính

### Tool 1: Viral Radar
Chức năng:
- Quét YouTube, TikTok, Facebook Reels, Instagram Reels, Google Trends, Reddit, X
- Thu thập nội dung đang viral, tăng trưởng nhanh, view cao, engagement cao
- Chuẩn hóa dữ liệu theo cùng 1 schema
- Tính điểm Viral Score, Monetization Score, Competition Score
- Gom nhóm theo chủ đề chính

Input:
- quốc gia
- ngôn ngữ
- nền tảng
- khoảng thời gian: 24h, 7 ngày, 30 ngày
- loại nội dung: shorts, long-form, reels, mixed

Output:
- danh sách video/chủ đề viral thô
- danh sách chủ đề chính đã xếp hạng từ cao xuống thấp

### Tool 2: Topic Ranker
Chức năng:
- Xếp hạng các chủ đề chính
- Loại bỏ chủ đề rủi ro cao, khó kiếm tiền, hoặc vi phạm chính sách
- Tạo danh sách 5 chủ đề chính đề xuất mỗi lần

Công thức điểm gợi ý:
- Viral Score: 35%
- Monetization Score: 30%
- Growth Speed: 15%
- Content Longevity: 10%
- Competition Gap: 10%

Output mỗi chủ đề:
- tên chủ đề
- mô tả
- hashtag
- SEO keywords
- lý do nên làm kênh
- độ khó
- tiềm năng kiếm tiền

### Tool 3: Channel Topic Builder
Chức năng:
- Với 1 chủ đề chính, sinh ra 20 chủ đề nhỏ / tiêu đề nhỏ để xây kênh
- Chia theo mục đích: kéo view, kéo follow, kéo bình luận, kéo chuyển đổi

Output:
- 20 subtopics cho 1 main topic
- mỗi subtopic có angle riêng
- tránh trùng ý

### Tool 4: Bilingual Content Writer
Khi người dùng chọn 1 chủ đề nhỏ, tool tạo đầy đủ:
- 9.1 Tiêu đề tiếng Việt + tiếng Anh
- 9.2 Mô tả tiếng Việt + tiếng Anh
- 9.3 Hashtag
- 9.4 SEO keywords tiếng Việt + tiếng Anh
- hook mở đầu
- CTA
- đối tượng khán giả
- cảm xúc chính

### Tool 5: Scene Prompt Composer
Chức năng:
- Sinh prompt video theo thời lượng người dùng chọn
- Chọn style video
- Chọn tỉ lệ 16:9 hoặc 9:16
- Tự chia thành nhiều phân cảnh ~8 giây/cảnh
- Mỗi cảnh có:
  - scene title
  - duration
  - visual prompt
  - camera prompt
  - motion prompt
  - lighting prompt
  - environment prompt
  - character prompt
  - negative prompt
  - voiceover text
  - on-screen text
  - SFX / music cue

Input:
- short dưới 1 phút hoặc long video: 1, 2, 3, 5, 10 phút
- style video
- aspect ratio
- language output

Output:
- shot list hoàn chỉnh
- prompt từng cảnh
- narration từng cảnh

### Tool 6: Batch Scene Video Generator
Chức năng:
- Lấy prompt từng cảnh và render hàng loạt video clip
- Mỗi cảnh là 1 job riêng
- Theo dõi trạng thái: queued, rendering, done, failed
- Retry từng cảnh riêng lẻ
- Re-render riêng cảnh người dùng chưa ưng

Output:
- bảng danh sách các cảnh
- link preview từng clip
- trạng thái từng clip
- lỗi nếu có

### Tool 7: Scene Reviewer
Chức năng:
- Cho người dùng xem từng cảnh sau khi render xong
- Nút: OK, chạy lại, sửa prompt rồi chạy lại, duplicate, delete
- Ghi version cho từng cảnh

### Tool 8: Video Stitcher
Chức năng:
- Khi user xác nhận các cảnh đều OK, tool ghép video
- Có thể thêm:
  - voiceover
  - subtitles
  - background music
  - logo/watermark
  - intro/outro
- Xuất ra bản cuối

Output:
- final mp4
- subtitle file .srt
- transcript
- thumbnail prompt

---

## 2. Nguồn dữ liệu viral nên quét

### Bắt buộc
- YouTube Trending / Search / Shorts discovery
- TikTok trend discovery
- Facebook public video/reels pages
- Google Trends

### Nên có thêm
- Reddit communities theo niche
- X trending posts
- Instagram Reels discovery
- AnswerThePublic / keyword APIs

### Dữ liệu cần lưu cho mỗi item viral
- platform
- url
- title
- channel/account
- views
- likes
- comments
- shares
- published_at
- duration
- language
- region
- transcript hoặc caption nếu lấy được
- topic candidates
- monetization tags
- ai_summary
- viral_score

---

## 3. Taxonomy chủ đề chính

Hệ thống nên tự map nội dung viral về các main topics như:
- Sức khỏe
- Tâm lý, chữa lành
- Quan hệ, hôn nhân, gia đình
- Giáo dục con cái
- Triết lý sống
- Tài chính cá nhân
- Kinh doanh, marketing
- AI, công nghệ
- Mystery / facts / lịch sử
- Tôn giáo / tâm linh
- Survival / kỹ năng sinh tồn
- Thời sự phân tích
- Động lực sống
- Làm đẹp
- Fitness
- Nội dung trẻ em
- Pet
- Drama / storytime

Mỗi main topic cần có:
- total viral items
- avg viral score
- avg RPM estimate
- competition density
- recommended formats
- suitable styles

---

## 4. Output đúng theo yêu cầu Boss

## A. Rà soát viral đa nền tảng
Kết quả bảng:
- Chủ đề
- Nền tảng mạnh nhất
- Tổng view ước tính
- Tăng trưởng
- Mức kiếm tiền
- Độ cạnh tranh
- Viral score

## B. Sắp xếp chủ đề chính từ cao đến thấp
Trả ra danh sách xếp hạng.

## C. Đề xuất 5 chủ đề chính để xây kênh
Mỗi chủ đề gồm:
1. Tên chủ đề
2. Mô tả chủ đề
3. Hashtag
4. SEO
5. Lý do đề xuất

## D. Với 1 chủ đề chính, đề xuất 20 chủ đề nhỏ
Mỗi subtopic gồm:
- tiêu đề ngắn
- angle nội dung
- mục tiêu video
- định dạng phù hợp

## E. Khi chọn 1 chủ đề nhỏ, sinh full package
1. Tiêu đề tiếng Việt
2. Tiêu đề tiếng Anh
3. Mô tả tiếng Việt
4. Mô tả tiếng Anh
5. Hashtag
6. SEO keyword tiếng Việt
7. SEO keyword tiếng Anh
8. Prompt video nhiều cảnh
9. Voiceover / narration
10. On-screen text

---

## 5. Thư viện style video

Cần lưu style dưới dạng preset để người dùng chọn nhanh.

### Schema preset
- id
- label_vi
- label_en
- visual_direction
- camera_language
- lighting_style
- pacing_style
- sound_direction
- suitable_topics
- prompt_template

### Danh sách preset ban đầu
- aggressive-expert
- emotional-trauma
- healing-duo
- edu-root-3d-cartoon
- edu-root-3d-cgi-realistic
- edu-root-3d-pixar
- edu-root-realistic
- edu-root-realistic-cgi
- cartoon-3d
- cgi-3d-realistic
- pixar-3d
- anime-japan
- cctv-found-footage
- documentary
- epic-survival
- experimental-art-film
- live-action
- music-video-aesthetic
- noir
- pixel-art-8bit
- pov
- realistic
- realistic-cgi
- theatrical
- vintage-retro

---

## 6. Logic chia cảnh theo thời lượng

### Quy tắc
- Mỗi cảnh mặc định 8 giây
- Video 30 giây => 4 cảnh
- Video 60 giây => 8 cảnh
- Video 2 phút => 15 cảnh
- Video 3 phút => 23 cảnh
- Video 5 phút => 38 cảnh
- Video 10 phút => 75 cảnh

Hệ thống nên cho phép:
- auto-calc số cảnh
- merge/split cảnh thủ công
- chỉnh duration riêng từng cảnh

---

## 7. Prompt schema cho mỗi cảnh

```json
{
  "sceneNumber": 1,
  "durationSec": 8,
  "goal": "Hook mạnh ngay 3 giây đầu",
  "visualPrompt": "...",
  "cameraPrompt": "...",
  "motionPrompt": "...",
  "lightingPrompt": "...",
  "characterPrompt": "...",
  "environmentPrompt": "...",
  "negativePrompt": "blurry, low quality, watermark, text artifacts, deformed hands",
  "voiceoverVi": "...",
  "voiceoverEn": "...",
  "onscreenTextVi": "...",
  "onscreenTextEn": "...",
  "sfx": "...",
  "music": "...",
  "status": "draft"
}
```

---

## 8. Video generation pipeline đề xuất

### Phase 1: Research
- collect trends
- normalize
- score
- cluster topics

### Phase 2: Planning
- pick main topic
- generate subtopics
- choose one subtopic
- create bilingual package
- create shot list

### Phase 3: Generation
- render scene clips
- retry failed scenes
- approve scenes

### Phase 4: Assembly
- stitch clips
- add VO / subtitles / music
- export final

---

## 9. Kiến trúc hệ thống khuyến nghị

## Frontend modules
- Dashboard
- Viral Explorer
- Topic Ranking
- Channel Builder
- Subtopic Generator
- Content Detail
- Prompt Editor
- Scene Render Queue
- Scene Preview Grid
- Final Stitcher

## Backend services
- trend-collector-service
- topic-clustering-service
- monetization-scoring-service
- content-generation-service
- prompt-composer-service
- scene-render-orchestrator
- asset-storage-service
- stitcher-service

## Queue / jobs
Nên dùng hàng đợi nền:
- BullMQ / Redis
hoặc
- database jobs + worker riêng

Job types:
- scan_trends
- cluster_topics
- generate_main_topics
- generate_subtopics
- generate_content_package
- compose_scene_prompts
- render_scene
- rerender_scene
- stitch_video
- generate_subtitles
- generate_thumbnail

---

## 10. Database schema tối thiểu

## tables: trend_items
- id
- platform
- url
- title
- views
- likes
- comments
- shares
- transcript
- published_at
- language
- region
- viral_score
- monetization_score
- competition_score
- topic_main
- topic_sub
- created_at

## tables: main_topics
- id
- name
- description
- hashtags_json
- seo_keywords_json
- ranking_score
- rationale
- created_at

## tables: subtopics
- id
- main_topic_id
- title
- angle
- format_type
- score
- created_at

## tables: content_packages
- id
- subtopic_id
- title_vi
- title_en
- description_vi
- description_en
- hashtags_json
- seo_vi_json
- seo_en_json
- selected_style
- aspect_ratio
- duration_target_sec
- created_at

## tables: scene_prompts
- id
- content_package_id
- scene_number
- duration_sec
- visual_prompt
- negative_prompt
- voiceover_vi
- voiceover_en
- onscreen_text_vi
- onscreen_text_en
- status
- version
- created_at

## tables: render_jobs
- id
- scene_prompt_id
- provider
- status
- error_message
- output_video_url
- version
- created_at
- updated_at

## tables: final_videos
- id
- content_package_id
- status
- output_url
- subtitle_url
- thumbnail_url
- created_at

---

## 11. API design khuyến nghị

### Research
- POST /api/viral/scan
- GET /api/viral/items
- GET /api/topics/main/ranked
- POST /api/topics/main/recommendations

### Topics
- GET /api/topics/main/:id
- POST /api/topics/:id/subtopics/generate
- GET /api/subtopics/:id

### Content package
- POST /api/subtopics/:id/content-package
- GET /api/content-packages/:id

### Scene prompts
- POST /api/content-packages/:id/scene-prompts
- GET /api/content-packages/:id/scenes
- PUT /api/scenes/:id

### Render
- POST /api/content-packages/:id/render
- POST /api/scenes/:id/render
- POST /api/scenes/:id/rerender
- GET /api/render-jobs/:id

### Final assembly
- POST /api/content-packages/:id/stitch
- GET /api/final-videos/:id

---

## 12. Giao diện người dùng đề xuất

## Màn 1: Viral Dashboard
- filter theo quốc gia, nền tảng, thời gian
- top main topics
- top rising videos
- top monetization topics

## Màn 2: Main Topic Recommendations
- mỗi lần hiện 5 chủ đề chính
- nút: xem 20 subtopics

## Màn 3: Subtopic List
- hiển thị 20 chủ đề nhỏ
- chọn 1 chủ đề để tạo package

## Màn 4: Content Package
- title vi/en
- description vi/en
- hashtag
- seo vi/en
- chọn duration
- chọn style
- chọn aspect ratio
- nút Generate Scene Prompts

## Màn 5: Scene Prompt Board
- bảng các cảnh
- preview text prompt
- edit từng cảnh
- render all
- render selected

## Màn 6: Scene Review
- xem clip từng cảnh
- approve / rerender / edit prompt

## Màn 7: Final Stitcher
- kéo thả thứ tự cảnh nếu cần
- add subtitle / voice / music
- export final video

---

## 13. Công nghệ render đề xuất

## Model generation
- text: OpenAI / Claude / Gemini cho research + viết nội dung
- video: Kling, Runway, Pika, Luma, Wan, Veo nếu có quyền truy cập
- image fallback: Flux / GPT Image / Imagen

## Stitching
- FFmpeg

Các tác vụ FFmpeg:
- nối clip
- scale ratio 16:9 hoặc 9:16
- burn subtitle
- mix audio
- insert transition nhẹ

---

## 14. Logic retry đúng theo yêu cầu Boss

### User có thể:
- chọn 1 subtopic
- tool tự lấy prompt ở mục 9.5
- render toàn bộ scene
- xuất bảng clip nhỏ từng scene
- xem từng clip
- clip nào không ưng thì rerender riêng clip đó
- clip lỗi thì rerender riêng clip đó
- khi tất cả OK thì bấm nối video

Trạng thái đề xuất:
- draft
- queued
- rendering
- done
- failed
- approved
- rejected
- stitched

---

## 15. Output format mẫu cho 1 main topic

```json
{
  "mainTopic": "Triết lý giáo dục tận gốc",
  "description": "Nội dung phân tích gốc rễ giáo dục, cách dạy con, tâm lý và hệ quả lâu dài.",
  "hashtags": ["#giaoduc", "#daycon", "#trietlysong"],
  "seoKeywords": ["triết lý giáo dục", "dạy con đúng cách", "root cause parenting"],
  "subtopics": 20
}
```

## Output format mẫu cho 1 subtopic package

```json
{
  "titleVi": "Vì sao trẻ càng bị mắng càng lì?",
  "titleEn": "Why do children become more stubborn when constantly scolded?",
  "descriptionVi": "Phân tích cơ chế tâm lý khiến việc quát mắng liên tục làm trẻ kháng cự mạnh hơn.",
  "descriptionEn": "An analysis of the psychological mechanism behind why repeated scolding increases resistance in children.",
  "hashtags": ["#daycon", "#parenting", "#childpsychology"],
  "seoVi": ["trẻ bị mắng", "dạy con không quát mắng"],
  "seoEn": ["child stubborn after scolding", "positive parenting"],
  "duration": 60,
  "style": "edu-root-realistic-cgi",
  "aspectRatio": "9:16"
}
```

---

## 16. Khuyến nghị triển khai theo giai đoạn

### Giai đoạn 1, nhanh nhất để chạy được MVP
- Quét Google Trends + YouTube + TikTok sources khả dụng
- Xếp hạng 5 chủ đề chính
- Sinh 20 subtopics
- Sinh full content package song ngữ
- Sinh scene prompts
- Render scene bằng 1 provider video
- Ghép final bằng FFmpeg

### Giai đoạn 2
- Thêm nhiều nguồn social
- Thêm score kiếm tiền thông minh hơn
- Thêm nhiều preset style
- Thêm subtitles tự động và voiceover

### Giai đoạn 3
- Auto publish scheduler
- AB test title/hashtag
- Theo dõi hiệu quả kênh
- Tự học từ video hiệu suất cao

---

## 17. Khuyến nghị thực tế để ra sản phẩm mạnh

Nếu Boss muốn sản phẩm thật sự dùng được và scale tốt, em khuyên chia thành 3 lớp:

1. **Trend Intelligence**
quét viral + xếp hạng chủ đề

2. **Content Intelligence**
viết full package song ngữ + prompt scenes

3. **Render Studio**
render, retry, preview, stitch

Tách 3 lớp này ra thì dễ nâng cấp, dễ debug, dễ thay model/provider.

---

## 18. Kế hoạch build ngay trên app hiện tại

Vì workspace hiện đang là app React + Express + Capacitor, có thể mở rộng theo hướng:

### Frontend thêm tab mới
- Viral Radar
- Topic Builder
- Render Studio

### Backend thêm routes
- /api/viral/*
- /api/topics/*
- /api/subtopics/*
- /api/content-packages/*
- /api/scenes/*
- /api/render/*
- /api/stitch/*

### Data storage mới
- server/data/viral-db.json
hoặc chuyển sang SQLite/Postgres khi lớn hơn

---

## 19. Ưu tiên build đầu tiên

Nếu phải chọn thứ tự làm, nên làm đúng thứ tự này:
1. Main topic ranking
2. 20 subtopics generator
3. Full bilingual content package
4. Scene prompt composer
5. Scene batch renderer
6. Rerender scene riêng lẻ
7. Final stitcher
8. Trend scan nâng cao đa nền tảng

Lý do: làm vậy có bản chạy được sớm, rồi nâng cấp nguồn trend sau.

---

## 20. Chốt đề xuất của em

Bộ Tools Boss cần không nên làm như 1 tool đơn lẻ, mà nên làm thành **1 hệ thống 8 tools trong 1 pipeline**:
- Viral Radar
- Topic Ranker
- Channel Topic Builder
- Bilingual Content Writer
- Scene Prompt Composer
- Batch Scene Video Generator
- Scene Reviewer
- Video Stitcher

Nếu Boss muốn, bước tiếp theo em có thể làm ngay 1 trong 3 việc:
1. **Thiết kế UI/UX chi tiết từng màn hình**
2. **Thiết kế database + API contract production-ready**
3. **Code luôn MVP phase 1 vào app hiện tại**
