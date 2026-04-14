# VIRAL_VIDEO_COMPLETE_GUIDE.md

## 1. Mục tiêu
Tài liệu tổng hợp để Boss Edgar Son có thể:
- hiểu toàn bộ viral video pipeline hiện tại
- biết cách chạy
- biết cách dùng
- biết cách kiểm tra output
- biết cách bàn giao / review bundle

---

## 2. Trạng thái hiện tại
Pipeline hiện đã đạt mức **handoff-ready**.

Đã verify:
- Mock end-to-end
- Single-scene Runway thật
- Multi-scene Runway thật
- Final with voice
- Burned subtitle final video
- Final archive bundle

Bundle thật mới nhất đã verify:
- `q3q6lb8bukgmny49rxj`

---

## 3. Thành phần chính của pipeline

### 3.1 Discovery
- trend scan đa nguồn
- topic ranking
- monetization filters
- hybrid viral + kiếm tiền

### 3.2 Content generation
- main topics
- 20 subtopics
- bilingual content package
- prompt video bằng English
- voice/dialogue bằng Vietnamese

### 3.3 Serial consistency
- character profiles
- default voice per character
- continuity character + voice khi tạo package mới

### 3.4 Rendering
- mock render
- Runway real render
- render-next
- process-next (video + voice)
- render missing

### 3.5 Voice
- voice profiles
- scene voice generation
- Runway text-to-speech
- mock voice
- generate missing voices

### 3.6 Review and recovery
- approve scene
- approve ready scenes
- finalize package
- package status sync

### 3.7 Final outputs
- final-with-voice.mp4
- final-burned-subtitles.mp4
- subtitles.srt
- transcript.txt
- thumbnail.jpg
- manifest.json
- report.md
- bundle.html
- bundle.tar.gz

---

## 4. File quan trọng

### Core code
- `server/index.js`
- `src/App.tsx`
- `src/styles.css`

### Docs
- `VIRAL_VIDEO_INDEX.md`
- `VIRAL_VIDEO_STATUS.md`
- `VIRAL_VIDEO_HANDOFF.md`
- `VIRAL_VIDEO_HANDOFF_MESSAGE.md`
- `VIRAL_VIDEO_RELEASE_CHECKLIST.md`
- `VIRAL_VIDEO_QUICKSTART.md`
- `VIRAL_VIDEO_TODO_FINAL.md`
- `VIRAL_VIDEO_TOOLS_SPEC.md`
- `VIRAL_VIDEO_UI_UX_SPEC.md`
- `VIRAL_VIDEO_DB_API_SPEC.md`

### Scripts
- `scripts/verify-viral-bundle.mjs`
- `scripts/show-viral-bundle-links.mjs`
- `scripts/handoff-viral-bundle.mjs`
- `scripts/generate-viral-handoff-message.mjs`

---

## 5. Điều kiện để chạy
- Có `RUNWAY_API_KEY` trong `.env.local`
- `.env*` được ignore, không commit key
- Đã chạy `npm install`

---

## 6. Lệnh cơ bản

### Cài dependencies
```bash
npm install
```

### Build
```bash
npm run build
```

### Chạy server
```bash
npm run server
```

---

## 7. Cách dùng nhanh trong UI
1. Vào tab Pipeline
2. Chạy pipeline/trend scan
3. Chọn topic chính
4. Tạo 20 subtopics
5. Chọn 1 subtopic để tạo content package
6. Gắn character + voice
7. Tạo scene prompts
8. Chọn một flow chạy:
   - Render scenes
   - Render scene kế tiếp
   - Xử lý scene kế tiếp
9. Nếu thiếu:
   - Render scene thiếu
   - Tạo voice thiếu
10. Review:
   - Approve scene
   - Approve scene đủ điều kiện
11. Hoàn tất:
   - Ghép final
   - hoặc Finalize package

---

## 8. Cách dùng theo workflow serial
1. Tạo character profile
2. Gắn default voice cho character
3. Gắn character vào package
4. Khi tạo package mới, continuity character + voice sẽ được giữ
5. Dùng process-next để đi từng scene an toàn với Runway thật

---

## 9. QA / kiểm tra bundle

### Verify bundle
```bash
npm run viral:verify-bundle -- <bundle-id>
```

### Hiện summary bundle
```bash
npm run viral:show-bundle -- <bundle-id>
```

### Verify + summary cùng lúc
```bash
npm run viral:handoff-bundle -- <bundle-id>
```

### Generate handoff message
```bash
npm run viral:generate-handoff-message -- <bundle-id>
```

---

## 10. Bundle đã verify

### Bundle mock/handoff
- `mcv9xnnutlhmny0splc`

### Bundle thật mới nhất
- `q3q6lb8bukgmny49rxj`

Links:
- Final: `/runtime/q3q6lb8bukgmny49rxj/final-with-voice.mp4`
- Final burned: `/runtime/q3q6lb8bukgmny49rxj/final-burned-subtitles.mp4`
- Subtitle: `/runtime/q3q6lb8bukgmny49rxj/subtitles.srt`
- Transcript: `/runtime/q3q6lb8bukgmny49rxj/transcript.txt`
- Thumbnail: `/runtime/q3q6lb8bukgmny49rxj/thumbnail.jpg`
- Manifest: `/runtime/q3q6lb8bukgmny49rxj/manifest.json`
- Report: `/runtime/q3q6lb8bukgmny49rxj/report.md`
- Bundle Viewer: `/runtime/q3q6lb8bukgmny49rxj/bundle.html`
- Archive: `/runtime/q3q6lb8bukgmny49rxj/bundle.tar.gz`

---

## 11. Khi nào dùng mock, khi nào dùng Runway thật

### Dùng mock khi
- test flow nhanh
- test UI/recovery
- không muốn tốn credit
- verify bundle structure

### Dùng Runway thật khi
- test chất lượng output thực
- verify serial workflow thật
- chuẩn bị bàn giao/review cuối
- chạy package thật

---

## 12. Remaining polish (không còn là blocker)
- burn-in subtitle đẹp hơn nữa nếu muốn
- lip-sync nâng cao
- retry UX sâu hơn theo từng lỗi provider
- zip sạch hơn nếu muốn thêm format khác ngoài tar.gz
- preset naming cho series/episode

---

## 13. Kết luận
Tính tới hiện tại, pipeline đã đủ để:
- bàn giao
- chạy thử thật
- review output thật
- tiếp tục mở rộng sau này

Nếu Boss chỉ muốn một file để bắt đầu, hãy mở:
- `VIRAL_VIDEO_INDEX.md`
- hoặc `VIRAL_VIDEO_COMPLETE_GUIDE.md`
