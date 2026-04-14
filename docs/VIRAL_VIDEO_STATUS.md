# VIRAL_VIDEO_STATUS.md

## Current status snapshot

### Overall
- Viral video pipeline is near handoff-ready
- Mock flow: verified end-to-end
- Single-scene Runway real flow: verified
- Multi-scene Runway real flow: verified

### Verified bundle ids
- Mock/handoff bundle: `mcv9xnnutlhmny0splc`
- Real multi-scene bundle: `yc8ef93e01pmny1ul3i`

### Real multi-scene verified outputs
- `/runtime/yc8ef93e01pmny1ul3i/final-with-voice.mp4`
- `/runtime/yc8ef93e01pmny1ul3i/subtitles.srt`
- `/runtime/yc8ef93e01pmny1ul3i/transcript.txt`
- `/runtime/yc8ef93e01pmny1ul3i/thumbnail.jpg`
- `/runtime/yc8ef93e01pmny1ul3i/manifest.json`
- `/runtime/yc8ef93e01pmny1ul3i/report.md`
- `/runtime/yc8ef93e01pmny1ul3i/bundle.html`

### Main capabilities done
- Trend scan and ranking
- Topic monetization filters
- Bilingual content package generation
- Scene prompt generation
- Character continuity
- Voice continuity per character
- Runway video generation
- Runway voice generation
- Mock render/voice fallback
- Bulk recovery actions
- Final stitch with voice
- Transcript / subtitle / thumbnail / manifest / report / bundle viewer
- Bundle QA and handoff helpers

### Useful commands
```bash
npm run build
npm run viral:verify-bundle -- yc8ef93e01pmny1ul3i
npm run viral:show-bundle -- yc8ef93e01pmny1ul3i
npm run viral:handoff-bundle -- yc8ef93e01pmny1ul3i
```

### Docs to read
- `VIRAL_VIDEO_HANDOFF.md`
- `VIRAL_VIDEO_RELEASE_CHECKLIST.md`
- `VIRAL_VIDEO_QUICKSTART.md`
- `VIRAL_VIDEO_TOOLS_SPEC.md`
- `VIRAL_VIDEO_UI_UX_SPEC.md`
- `VIRAL_VIDEO_DB_API_SPEC.md`
