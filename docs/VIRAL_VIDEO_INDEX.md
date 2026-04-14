# VIRAL_VIDEO_INDEX.md

## Docs map
- `VIRAL_VIDEO_COMPLETE_GUIDE.md` — guide tổng hợp toàn bộ tools, cách chạy, cách dùng
- `VIRAL_VIDEO_STATUS.md` — snapshot hiện trạng nhanh
- `VIRAL_VIDEO_HANDOFF.md` — tài liệu bàn giao chính
- `VIRAL_VIDEO_HANDOFF_MESSAGE.md` — bản bàn giao ngắn gọn
- `VIRAL_VIDEO_RELEASE_CHECKLIST.md` — checklist release/handoff
- `VIRAL_VIDEO_TODO_FINAL.md` — phần còn lại cuối cùng, chủ yếu là polish
- `VIRAL_VIDEO_QUICKSTART.md` — quickstart dùng nhanh
- `VIRAL_VIDEO_TOOLS_SPEC.md` — spec tools
- `VIRAL_VIDEO_UI_UX_SPEC.md` — spec UI/UX
- `VIRAL_VIDEO_DB_API_SPEC.md` — spec DB/API

## Verified bundles
- Mock/handoff bundle: `mcv9xnnutlhmny0splc`
- Real multi-scene bundle: `yc8ef93e01pmny1ul3i`

## QA commands
```bash
npm run build
npm run viral:verify-bundle -- <bundle-id>
npm run viral:show-bundle -- <bundle-id>
npm run viral:handoff-bundle -- <bundle-id>
```

## Suggested reading order
1. `VIRAL_VIDEO_STATUS.md`
2. `VIRAL_VIDEO_HANDOFF_MESSAGE.md`
3. `VIRAL_VIDEO_HANDOFF.md`
4. `VIRAL_VIDEO_RELEASE_CHECKLIST.md`
5. `VIRAL_VIDEO_QUICKSTART.md`

## Notes
- Runway is the primary real provider
- Mock flow exists for cheap testing
- Prompt video: English
- Voice/dialogue: Vietnamese
- Character + voice continuity are designed for serial workflows
