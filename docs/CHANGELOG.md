# CHANGELOG

All user-visible changes are logged here. Format: `[date] Summary. Migration notes if applicable.`

---

## [2026-02-26] Initial MVP

- Speaker Bank with drag-to-episode, search, category filter, status picker.
- Episode columns with date/title editing, live minute totals, card count.
- Speaker Cards and Q&A Cards with duration cycling (20/30/60 min), category picker, inline notes, duplicate, delete.
- "+ Q&A after" one-click button on Speaker Cards.
- Category system: default categories seeded, inline creation with color picker, fallback to "Other".
- Drag and drop: bank → episode (copy-on-drop), within episode (reorder), between episodes.
- Export JSON / Import JSON with zod schema validation.
- localStorage auto-persistence (key: `speakerSeriesBoard_v1`).
- schemaVersion: 1 established.
- `/docs/APP_STATE.md` and `/docs/CHANGELOG.md` created.
