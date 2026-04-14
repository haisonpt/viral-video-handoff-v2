# VIRAL_VIDEO_QUICKSTART.md

## Mục tiêu
Chạy nhanh viral video pipeline trong workspace hiện tại.

## 1. Chuẩn bị
- Đảm bảo đã có `RUNWAY_API_KEY` trong `.env.local`
- Cài dependencies:

```bash
npm install
```

## 2. Chạy app
```bash
npm run server
npm run build
```

Hoặc dùng flow dev hiện có nếu cần UI đầy đủ.

## 3. Flow nhanh trong UI
1. Vào Pipeline
2. Chạy trend scan / pipeline run
3. Chọn subtopic
4. Tạo content package
5. Gắn character + voice
6. Tạo scene prompts
7. Dùng một trong các flow:
   - Render scenes
   - Render scene kế tiếp
   - Xử lý scene kế tiếp
8. Nếu thiếu:
   - Render scene thiếu
   - Tạo voice thiếu
9. Approve scene đủ điều kiện
10. Finalize package hoặc Ghép final

## 4. Output mong đợi
Một bundle hoàn chỉnh có thể gồm:
- final-with-voice.mp4
- subtitles.srt
- transcript.txt
- thumbnail.jpg
- manifest.json
- report.md
- bundle.html

## 5. QA nhanh
```bash
npm run viral:verify-bundle -- <bundle-id>
npm run viral:show-bundle -- <bundle-id>
npm run viral:handoff-bundle -- <bundle-id>
```

## 6. Bundle mẫu đã verify
- Mock bundle: `mcv9xnnutlhmny0splc`
- Multi-scene Runway thật: `yc8ef93e01pmny1ul3i`

## 7. Ghi chú
- Prompt video: English
- Voice/dialogue: Vietnamese
- Character + voice continuity dùng cho serials
- Runway là provider chính, mock dùng để test nhanh
