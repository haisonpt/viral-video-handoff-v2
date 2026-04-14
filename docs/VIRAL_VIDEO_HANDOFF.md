# VIRAL_VIDEO_HANDOFF.md

## Mục tiêu
Bàn giao pipeline viral video chạy trong app React + Express + Capacitor hiện tại, ưu tiên Runway làm video provider chính, hỗ trợ voiceover tiếng Việt, consistency theo character/voice và final bundle đầu ra.

## Trạng thái hiện tại
Pipeline đã có đủ các khối chính:
- Trend scan đa nguồn
- Main topic ranking + monetization filter
- 20 subtopics
- Bilingual content package
- Scene prompts
- Render jobs
- Voice jobs
- Character consistency
- Voice consistency theo từng nhân vật
- Final stitch với voice
- Transcript / subtitle / thumbnail / manifest / report / bundle viewer
- Đã verify cả single-scene và multi-scene Runway thật

## Core flow
1. Scan trend
2. Chọn main topic
3. Tạo subtopics
4. Tạo content package
5. Gắn character + voice
6. Tạo scene prompts
7. Render scene hoặc process-next
8. Tạo voice scene hoặc bulk voice missing
9. Approve scene hoặc approve-ready-scenes
10. Stitch / finalize package
11. Nhận final bundle

## Continuity cho serials
- Character profile lưu visual identity
- Character có thể mang default voice profile
- Package mới có thể giữ continuity character + voice từ lựa chọn hiện tại
- Scene prompts giữ consistency instruction

## Final bundle output
Mỗi final bundle hiện có thể gồm:
- final.mp4 hoặc final-with-voice.mp4
- subtitles.srt
- transcript.txt
- thumbnail.jpg
- manifest.json
- report.md
- bundle.html

## Route/API chính
- `POST /api/viral-pipeline/run`
- `POST /api/topics/main/:id/subtopics/generate`
- `POST /api/subtopics/:id/content-package`
- `POST /api/content-packages/:id/scene-prompts`
- `POST /api/content-packages/:id/render`
- `POST /api/content-packages/:id/render-next`
- `POST /api/content-packages/:id/process-next`
- `POST /api/content-packages/:id/render-missing`
- `GET /api/render-jobs/:id`
- `POST /api/render-jobs/poll-active`
- `POST /api/scenes/:id/voice-generate`
- `POST /api/content-packages/:id/voice-generate-missing`
- `GET /api/voice-jobs/:id`
- `POST /api/voice-jobs/poll-active`
- `POST /api/scenes/:id/approve`
- `POST /api/content-packages/:id/approve-ready-scenes`
- `POST /api/content-packages/:id/stitch`

## UX actions đã có
- Render scene kế tiếp
- Xử lý scene kế tiếp (video + voice)
- Render scene thiếu
- Tạo voice thiếu
- Poll render jobs
- Poll voice jobs
- Approve scene đủ điều kiện
- Finalize package

## Gợi ý bước cuối trước khi gọi là bàn giao 100%
- Review edge cases cuối cùng cho retry/recovery
- Tinh chỉnh subtitle burn-in / lip-sync nâng cao nếu cần premium workflow
- Đóng gói/tinh gọn bước bàn giao cuối nếu muốn gửi như một package sạch hơn
- Xem thêm `VIRAL_VIDEO_TODO_FINAL.md` cho phần còn lại cuối cùng

## Commit mốc gần đây
- `f63d5bb` Add handoff report for final bundles
- `cd15dea` Add bundle viewer for final outputs
- `72757d8` Preserve character and voice continuity in new packages
- `5c5716e` Add transcript and subtitle outputs for finals
- `86ce43e` Sync package status across render and voice flows
- `d8fecc3` Add combined process-next flow for scenes

## Bundle verify mới nhất
- Mock/handoff bundle đã verify: `mcv9xnnutlhmny0splc`
- Multi-scene Runway thật đã stitch thành công: `yc8ef93e01pmny1ul3i`

## Ghi chú
- Runway API key nằm local trong `.env.local`, không commit.
- `.env*` đã được ignore.
- Hệ thống hiện đã có cả nhánh mock và nhánh Runway thật.
