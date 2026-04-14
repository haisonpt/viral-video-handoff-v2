# VIRAL_VIDEO_RELEASE_CHECKLIST.md

## 1. Environment
- [ ] `.env.local` có `RUNWAY_API_KEY`
- [ ] `.env*` vẫn được ignore
- [ ] `npm install` hoàn tất
- [ ] `npm run build` pass
- [ ] `node --check server/index.js` pass

## 2. Pipeline core
- [ ] Trend scan chạy được
- [ ] Tạo subtopics chạy được
- [ ] Tạo content package chạy được
- [ ] Tạo scene prompts chạy được
- [ ] Character profile hoạt động
- [ ] Voice profile hoạt động
- [ ] Character default voice hoạt động

## 3. Render + voice
- [ ] Mock render hoạt động
- [ ] Mock voice hoạt động
- [ ] Runway video thật hoạt động
- [ ] Runway voice thật hoạt động
- [ ] Poll render jobs hoạt động
- [ ] Poll voice jobs hoạt động
- [ ] Process-next hoạt động

## 4. Review + recovery
- [ ] Render missing hoạt động
- [ ] Voice missing hoạt động
- [ ] Approve ready scenes hoạt động
- [ ] Finalize package hoạt động
- [ ] Package status sync đúng

## 5. Final outputs
- [ ] final-with-voice.mp4 được tạo
- [ ] subtitles.srt được tạo
- [ ] transcript.txt được tạo
- [ ] thumbnail.jpg được tạo
- [ ] manifest.json được tạo
- [ ] report.md được tạo
- [ ] bundle.html được tạo

## 6. Verification
- [ ] `npm run viral:verify-bundle -- <bundle-id>` pass
- [ ] `npm run viral:show-bundle -- <bundle-id>` pass
- [ ] `npm run viral:handoff-bundle -- <bundle-id>` pass

## 7. Real-world validation
- [ ] Single-scene Runway thật đã verify
- [ ] Multi-scene Runway thật đã verify
- [ ] Final multi-scene bundle đã tạo thành công

## 8. Handoff
- [ ] `VIRAL_VIDEO_HANDOFF.md` đã cập nhật
- [ ] Bundle ID mới nhất đã ghi lại
- [ ] Boss đã nhận đủ final / subtitle / transcript / thumbnail / manifest / report / bundle viewer
