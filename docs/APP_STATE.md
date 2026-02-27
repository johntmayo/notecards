# APP_STATE.md — Speaker Series Planner

## Current Feature Set

- **Speaker Bank** (left rail): searchable/filterable list of speaker templates. Drag-to-board creates an independent card instance.
- **Episode Columns**: horizontal columns with a date label, optional title, and live totals (minutes + card count).
- **Board Cards**: two types — Speaker and Q&A. 3×5 note-card visual style with left color stripe.
  - Duration cycling (20 / 30 / 60 min) affects visual card height.
  - "+ Q&A after" one-click affordance on Speaker cards.
  - Inline title editing (double-click).
  - Expandable notes field.
  - Duplicate and delete controls.
- **Category System**: stable-id categories with hex color. CategoryPicker on every card and bank entry. Inline "New category" flow with color picker. Cards fall back to "Other" if category is deleted.
- **Drag and Drop**: bank → episode, within episode (reorder), between episodes. Powered by @dnd-kit.
- **Persistence**: localStorage (key: `speakerSeriesBoard_v1`). Auto-saves on every state change.
- **Export / Import JSON**: validated against zod schema on import.
- **Speaker status**: pitch / invited / confirmed / scheduled (dropdown per bank card).
- **Board title**: double-click to edit in TopBar.

---

## Known Limitations

- No undo/redo.
- No multi-board support (single board per browser origin).
- No real-time collaboration.
- No print-friendly export.
- No time slot alignment — durations are visual only; cards don't snap to a timeline grid.
- Category deletion does not currently scrub deleted category from bank speaker templates (falls back correctly for cards).
- DnD overlay ghost card doesn't render in the bank (bank drags use native useDraggable, not sortable).

---

## Data Model Summary

### schemaVersion: 1

```
Board
├── id: string (nanoid)
├── title: string
├── schemaVersion: 1 (literal)
├── categories: Category[]
│   ├── id: string
│   ├── name: string
│   └── color: string (#rrggbb)
├── speakers: SpeakerTemplate[]
│   ├── id, name, categoryId
│   ├── defaultDurationMinutes: 20 | 30 | 60
│   ├── status: pitch | invited | confirmed | scheduled
│   ├── notes: string
│   └── createdAt / updatedAt: ISO 8601
├── episodes: Episode[]
│   ├── id, dateLabel, title
│   └── cardIds: string[] (ordered)
├── cards: Record<string, Card>
│   ├── id, type: speaker | qa
│   ├── speakerTemplateId? (speaker cards only)
│   ├── titleOverride?
│   ├── durationMinutes: 20 | 30 | 60
│   ├── categoryId
│   ├── notes
│   └── createdAt / updatedAt: ISO 8601
└── updatedAt: ISO 8601
```

Cards are stored flat in `board.cards` (keyed by id). Episodes reference cards by ID in `cardIds[]` (ordered).

---

## Roadmap (Next 5 Likely Improvements)

1. **Undo / redo** — use zustand-middleware or a history ring on the board state.
2. **Duplicate episode column** — copy all cards with new IDs into a new episode.
3. **Global zoom level** — CSS `transform: scale()` on the board container.
4. **Read-only public view** — route `/view/:boardId` that loads from localStorage (read-only).
5. **Google Calendar sync** — export episode dates as .ics or push via Calendar API.

---

## How to Run

```bash
npm install
npm run dev
# → http://localhost:5173
```

## How to Deploy

```bash
npm run build
# Outputs to /dist — deploy as a static site (Vercel, Netlify, GitHub Pages, etc.)
```

No backend required. All state is in the browser.

---

## How to Safely Edit the Data Model

1. **Bump schemaVersion** in `src/types.ts` (e.g., `1` → `2`) and in `src/models/schemas.ts` (change `z.literal(1)` → `z.literal(2)`).
2. **Write a migration function** in `src/models/migrations.ts` that transforms v1 → v2 shape.
3. **Call the migration** in `src/utils/storage.ts` `loadBoard()` before returning the board.
4. **Update zod schemas** in `src/models/schemas.ts` to reflect the new shape.
5. **Update `src/types.ts`** TypeScript interfaces.
6. **Log the change** in `docs/CHANGELOG.md` under the new date.
7. **Run tests**: `npm test` — fix any schema test failures.

Never remove fields from exported data without a migration. Always validate imports.

---

## Maintenance Rules

- **Always update this file** when behavior or structure changes.
- **Always update CHANGELOG.md** for user-visible changes.
- **Bump schemaVersion and add a migration** when the data shape changes.
- **Never ship without validating imported JSON** — the zod schema in `importBoardJSON()` is the gate.
