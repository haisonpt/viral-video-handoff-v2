# Viral Video Tools - Database and API Spec

## Mục tiêu
Spec production-ready cho backend của hệ thống tìm trend, xây topic, sinh prompt video nhiều cảnh, render hàng loạt, rerender từng cảnh và ghép final video.

---

## 1. Kiến trúc backend khuyến nghị

### Service groups
- research-service
- topic-service
- content-service
- scene-service
- render-service
- stitch-service
- asset-service

### Runtime đề xuất
- Express hoặc Fastify cho API
- worker nền cho render jobs
- FFmpeg cho stitch
- lưu file local trước, sau nâng cấp S3-compatible storage

---

## 2. Data model tổng thể

## 2.1 trend_scans
Lưu 1 lần quét dữ liệu viral.

```json
{
  "id": "scan_001",
  "country": "VN",
  "language": "vi",
  "platforms": ["youtube", "tiktok", "facebook"],
  "window": "7d",
  "format": "mixed",
  "status": "completed",
  "startedAt": "2026-04-13T05:00:00.000Z",
  "completedAt": "2026-04-13T05:05:00.000Z"
}
```

## 2.2 trend_items
```json
{
  "id": "trend_001",
  "scanId": "scan_001",
  "platform": "youtube",
  "url": "https://...",
  "title": "...",
  "channelName": "...",
  "thumbnailUrl": "...",
  "views": 1200000,
  "likes": 56000,
  "comments": 3200,
  "shares": 2100,
  "publishedAt": "2026-04-12T08:00:00.000Z",
  "durationSec": 58,
  "language": "vi",
  "region": "VN",
  "transcript": "...",
  "topicCandidates": ["giao duc", "tam ly tre em"],
  "viralScore": 88,
  "monetizationScore": 70,
  "competitionScore": 52,
  "createdAt": "2026-04-13T05:01:00.000Z"
}
```

## 2.3 main_topics
```json
{
  "id": "topic_001",
  "scanId": "scan_001",
  "name": "Triết lý giáo dục tận gốc",
  "description": "...",
  "hashtags": ["#giaoduc", "#daycon"],
  "seoKeywords": ["triết lý giáo dục", "dạy con đúng cách"],
  "viralScore": 91,
  "monetizationScore": 78,
  "competitionScore": 44,
  "rankingScore": 84,
  "bestPlatform": "youtube",
  "rationale": "...",
  "createdAt": "2026-04-13T05:06:00.000Z"
}
```

## 2.4 subtopics
```json
{
  "id": "sub_001",
  "mainTopicId": "topic_001",
  "title": "Vì sao trẻ càng bị mắng càng lì?",
  "angle": "phân tích cơ chế phản kháng tâm lý",
  "goal": "pull_views",
  "formatType": "short",
  "score": 87,
  "createdAt": "2026-04-13T05:07:00.000Z"
}
```

## 2.5 content_packages
```json
{
  "id": "pkg_001",
  "subtopicId": "sub_001",
  "mainTopicId": "topic_001",
  "titleVi": "Vì sao trẻ càng bị mắng càng lì?",
  "titleEn": "Why do children become more stubborn when constantly scolded?",
  "descriptionVi": "...",
  "descriptionEn": "...",
  "hashtags": ["#parenting", "#childpsychology"],
  "seoVi": ["trẻ bị mắng", "dạy con tích cực"],
  "seoEn": ["positive parenting", "child stubborn after scolding"],
  "stylePreset": "edu-root-realistic-cgi",
  "aspectRatio": "9:16",
  "durationTargetSec": 60,
  "languageMode": "bilingual",
  "status": "draft",
  "createdAt": "2026-04-13T05:08:00.000Z",
  "updatedAt": "2026-04-13T05:08:00.000Z"
}
```

## 2.6 scene_prompts
```json
{
  "id": "scene_001",
  "contentPackageId": "pkg_001",
  "sceneNumber": 1,
  "durationSec": 8,
  "goal": "hook",
  "visualPrompt": "...",
  "cameraPrompt": "...",
  "motionPrompt": "...",
  "lightingPrompt": "...",
  "characterPrompt": "...",
  "environmentPrompt": "...",
  "negativePrompt": "blurry, watermark, text artifacts",
  "voiceoverVi": "...",
  "voiceoverEn": "...",
  "onscreenTextVi": "...",
  "onscreenTextEn": "...",
  "sfx": "...",
  "music": "...",
  "status": "draft",
  "version": 1,
  "createdAt": "2026-04-13T05:09:00.000Z",
  "updatedAt": "2026-04-13T05:09:00.000Z"
}
```

## 2.7 scene_renders
```json
{
  "id": "render_001",
  "scenePromptId": "scene_001",
  "provider": "kling",
  "providerJobId": "kj_001",
  "status": "queued",
  "errorMessage": null,
  "outputVideoUrl": null,
  "thumbnailUrl": null,
  "durationSec": 8,
  "version": 1,
  "createdAt": "2026-04-13T05:10:00.000Z",
  "updatedAt": "2026-04-13T05:10:00.000Z"
}
```

## 2.8 final_videos
```json
{
  "id": "final_001",
  "contentPackageId": "pkg_001",
  "status": "processing",
  "outputUrl": null,
  "subtitleUrl": null,
  "transcriptUrl": null,
  "thumbnailUrl": null,
  "durationSec": 58,
  "createdAt": "2026-04-13T05:20:00.000Z",
  "updatedAt": "2026-04-13T05:20:00.000Z"
}
```

---

## 3. Enum chuẩn

### content goal
- pull_views
- pull_followers
- pull_comments
- pull_conversion

### status chuẩn
- draft
- queued
- processing
- rendering
- done
- failed
- approved
- rejected
- stitched

### aspect ratio
- 16:9
- 9:16

### duration preset
- short_under_60
- 60
- 120
- 180
- 300
- 600

---

## 4. API contract

## 4.1 Scan viral trends
### POST /api/viral/scan
Request:
```json
{
  "country": "VN",
  "language": "vi",
  "platforms": ["youtube", "tiktok", "facebook"],
  "window": "7d",
  "format": "mixed"
}
```

Response:
```json
{
  "scanId": "scan_001",
  "status": "queued"
}
```

### GET /api/viral/scan/:id
Response:
```json
{
  "id": "scan_001",
  "status": "completed",
  "summary": {
    "items": 320,
    "topics": 18
  }
}
```

---

## 4.2 Ranked main topics
### GET /api/topics/main/ranked?scanId=scan_001&limit=20
Response:
```json
{
  "items": [
    {
      "id": "topic_001",
      "name": "Triết lý giáo dục tận gốc",
      "description": "...",
      "hashtags": ["#giaoduc"],
      "seoKeywords": ["triết lý giáo dục"],
      "viralScore": 91,
      "monetizationScore": 78,
      "competitionScore": 44,
      "rankingScore": 84,
      "bestPlatform": "youtube"
    }
  ]
}
```

### POST /api/topics/main/recommendations
Request:
```json
{
  "scanId": "scan_001",
  "limit": 5
}
```

Response:
```json
{
  "items": [
    {
      "id": "topic_001",
      "name": "...",
      "description": "...",
      "hashtags": ["..."],
      "seoKeywords": ["..."],
      "reason": "..."
    }
  ]
}
```

---

## 4.3 Generate 20 subtopics
### POST /api/topics/main/:mainTopicId/subtopics/generate
Request:
```json
{
  "limit": 20,
  "goalMix": ["pull_views", "pull_followers", "pull_comments", "pull_conversion"]
}
```

Response:
```json
{
  "mainTopicId": "topic_001",
  "items": [
    {
      "id": "sub_001",
      "title": "Vì sao trẻ càng bị mắng càng lì?",
      "angle": "...",
      "goal": "pull_views",
      "formatType": "short",
      "score": 87
    }
  ]
}
```

---

## 4.4 Create content package
### POST /api/subtopics/:subtopicId/content-package
Request:
```json
{
  "stylePreset": "edu-root-realistic-cgi",
  "aspectRatio": "9:16",
  "durationTargetSec": 60,
  "languageMode": "bilingual"
}
```

Response:
```json
{
  "id": "pkg_001",
  "titleVi": "...",
  "titleEn": "...",
  "descriptionVi": "...",
  "descriptionEn": "...",
  "hashtags": ["..."],
  "seoVi": ["..."],
  "seoEn": ["..."]
}
```

### GET /api/content-packages/:id
Response:
```json
{
  "id": "pkg_001",
  "subtopicId": "sub_001",
  "mainTopicId": "topic_001",
  "titleVi": "...",
  "titleEn": "...",
  "descriptionVi": "...",
  "descriptionEn": "...",
  "hashtags": ["..."],
  "seoVi": ["..."],
  "seoEn": ["..."],
  "stylePreset": "edu-root-realistic-cgi",
  "aspectRatio": "9:16",
  "durationTargetSec": 60,
  "status": "draft"
}
```

---

## 4.5 Generate scene prompts
### POST /api/content-packages/:id/scene-prompts
Request:
```json
{
  "sceneDurationSec": 8,
  "overwrite": true
}
```

Response:
```json
{
  "contentPackageId": "pkg_001",
  "sceneCount": 8,
  "items": [
    {
      "id": "scene_001",
      "sceneNumber": 1,
      "durationSec": 8,
      "goal": "hook",
      "visualPrompt": "...",
      "voiceoverVi": "...",
      "voiceoverEn": "...",
      "status": "draft"
    }
  ]
}
```

### PUT /api/scenes/:sceneId
Request:
```json
{
  "visualPrompt": "updated prompt",
  "voiceoverVi": "updated line",
  "onscreenTextVi": "updated text"
}
```

Response:
```json
{
  "id": "scene_001",
  "version": 2,
  "status": "draft"
}
```

---

## 4.6 Render scenes
### POST /api/content-packages/:id/render
Request:
```json
{
  "provider": "kling",
  "sceneIds": ["scene_001", "scene_002"],
  "mode": "batch"
}
```

Response:
```json
{
  "contentPackageId": "pkg_001",
  "jobs": [
    {
      "id": "render_001",
      "scenePromptId": "scene_001",
      "status": "queued"
    }
  ]
}
```

### POST /api/scenes/:sceneId/render
Render 1 cảnh riêng.

### POST /api/scenes/:sceneId/rerender
Request:
```json
{
  "provider": "kling",
  "reason": "failed_or_not_good_enough"
}
```

Response:
```json
{
  "jobId": "render_010",
  "status": "queued"
}
```

### GET /api/scenes/:sceneId/renders
Response:
```json
{
  "items": [
    {
      "id": "render_001",
      "version": 1,
      "status": "done",
      "outputVideoUrl": "https://..."
    },
    {
      "id": "render_002",
      "version": 2,
      "status": "failed",
      "errorMessage": "provider timeout"
    }
  ]
}
```

---

## 4.7 Scene review actions
### POST /api/scenes/:sceneId/approve
Response:
```json
{
  "id": "scene_001",
  "status": "approved"
}
```

### POST /api/scenes/:sceneId/reject
Request:
```json
{
  "reason": "camera motion not good"
}
```

Response:
```json
{
  "id": "scene_001",
  "status": "rejected"
}
```

---

## 4.8 Stitch final video
### POST /api/content-packages/:id/stitch
Request:
```json
{
  "sceneIds": ["scene_001", "scene_002", "scene_003"],
  "addVoiceover": true,
  "addSubtitles": true,
  "addMusic": true,
  "watermark": true,
  "outputFormat": "mp4"
}
```

Response:
```json
{
  "finalVideoId": "final_001",
  "status": "queued"
}
```

### GET /api/final-videos/:id
Response:
```json
{
  "id": "final_001",
  "status": "done",
  "outputUrl": "https://.../final.mp4",
  "subtitleUrl": "https://.../final.srt",
  "thumbnailUrl": "https://.../thumb.jpg",
  "durationSec": 58
}
```

---

## 5. Validation rules

### scan request
- platforms không được rỗng
- window chỉ nhận 24h, 7d, 30d
- format chỉ nhận short, long, mixed

### content package
- stylePreset bắt buộc
- aspectRatio bắt buộc
- durationTargetSec > 0

### scene prompt generation
- sceneDurationSec từ 4 đến 12 giây
- nếu overwrite=false mà scenes đã có thì trả 409 hoặc require confirm

### stitch
- chỉ stitch các scenes đã approved
- nếu còn failed scenes thì không cho stitch

---

## 6. Job orchestration

## Queue jobs
- trend_scan_job
- topic_rank_job
- subtopic_generation_job
- content_package_job
- scene_prompt_job
- scene_render_job
- final_stitch_job

## Retry policy
- trend scan: retry 2
- content generation: retry 1
- scene render: retry 3
- stitch: retry 2

## Error categories
- provider_unavailable
- timeout
- invalid_prompt
- invalid_asset
- stitch_failed
- rate_limited

---

## 7. File storage layout

```text
storage/
  trends/
  packages/
  scenes/
    {sceneId}/
      v1.mp4
      v2.mp4
      thumb.jpg
  finals/
    {finalVideoId}/
      final.mp4
      final.srt
      thumbnail.jpg
```

---

## 8. FFmpeg stitch pipeline

### Step 1
Chuẩn hóa toàn bộ scene clips:
- cùng resolution
- cùng fps
- cùng codec
- cùng audio layout

### Step 2
Tạo concat list

### Step 3
Nối video

### Step 4
Burn subtitles nếu bật

### Step 5
Mix music / voiceover nếu bật

### Step 6
Xuất final + thumbnail

---

## 9. Provider abstraction

Để dễ thay provider, cần adapter thống nhất.

### Interface gợi ý
```ts
interface VideoRenderProvider {
  submitSceneRender(input: SceneRenderInput): Promise<{ providerJobId: string }>;
  getRenderStatus(providerJobId: string): Promise<RenderStatusPayload>;
  cancelRender?(providerJobId: string): Promise<void>;
}
```

Provider có thể cắm:
- Kling
- Runway
- Pika
- Luma
- Veo
- local fallback image-to-video pipeline

---

## 10. Security and limits
- rate limit scan APIs
- sanitize prompt input
- giới hạn số scene render đồng thời
- lưu audit log với actions approve/reject/rerender/stitch
- quota theo user / plan

---

## 11. MVP implementation order
1. JSON storage schemas
2. main topic endpoints
3. subtopic endpoints
4. content package endpoints
5. scene prompt endpoints
6. render queue endpoints
7. stitch endpoint
8. provider adapters

---

## 12. Tương thích app hiện tại

Vì app hiện đang là React + Express, em khuyến nghị phase đầu dùng:
- `server/data/viral-db.json`
- `server/data/render-db.json`
- route mới trong `server/index.js`
- frontend state cục bộ trước

Khi ổn định mới tách service hoặc chuyển SQLite/Postgres.
