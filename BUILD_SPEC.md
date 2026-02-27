# Build Spec: Corkboard Speaker Series Planner (Firebrain Gizmo)

## Goal
Create a super-simple, highly visual corkboard planner for a guest speaker series.
- Columns are episode dates.
- Cards are scheduled program blocks inside an episode.
- Left rail is a speaker bank (templates).
- The board should look good zoomed out and be screenshot-friendly.
- Prioritize clean, coherent code, strong data hygiene, and clear docs for future maintainers.

## Non-goals (for MVP)
- No Google Calendar sync yet.
- No backend required.
- No permissions model.
- No complex time math or guardrails (it can exceed 60 minutes).

---

## Core Concepts and Terms
- Episode: one date column on the board. Represents one episode.
- Speaker Template: an entry in the Speaker Bank. Reusable.
- Card Instance: a scheduled block inside an Episode column. Created from a template, then independent.
- Q&A Card: a special card type that represents a Q&A block. Can follow one speaker or be joint after multiple speakers.

---

## Layout
### Main Regions
1) Left rail: Speaker Bank
2) Main board: Episode columns laid out horizontally
3) Top bar: Board title, controls (Add Episode, Export, Import)

### Episode Column
- Header:
  - Date label (editable)
  - Episode title (optional, editable)
  - Live totals:
    - Total minutes scheduled in this episode (sum of card durations)
    - Optional: count of cards
- Body:
  - Vertical stacking lane
  - Light reference grid lines every 20 minutes (purely visual)
  - No max height constraint. Content can scroll within the column.

---

## Cards

### Card Types
1) Speaker Card
2) Q&A Card

### Shared Card UI
- 3x5 note card vibe:
  - Neutral paper background
  - Subtle border + slight shadow
  - Left color stripe for category
- Header area on card:
  - Primary line: Name (speaker name or Q&A label)
  - Small text or pill: Category name (ex: "Policy", "Local", "Other")
- Controls on card (compact, appear on hover):
  - Duration button (cycles presets)
  - Category picker
  - Notes expand/collapse
  - Delete
  - Duplicate (optional)

### Duration
- Duration presets for MVP: 20, 30, 60
- Duration affects visual height of card.
- Duration also stored as a number (minutes) for totals and export.
- No proportional segmenting inside a card.

### Q&A Handling
- Q&A is a separate card type.
- For "Q&A immediately after speaker", add a one-click affordance:
  - On Speaker Card hover: button "+ Q&A after"
  - Clicking inserts a Q&A Card directly below with default duration 20 minutes.
- Joint Q&A:
  - User manually places a Q&A Card after multiple speakers.
  - Q&A Card title is editable, suggested default: "Joint Q&A (A + B)".

### Notes
- Each card can have a short notes field.
- Notes are collapsed by default, expandable on click.
- Notes must persist in data.

### Status (Optional in MVP, recommended)
For Speaker Templates and Speaker Cards:
- Status enum: pitch, invited, confirmed, scheduled
- Display as a small tag or icon, editable.

---

## Speaker Bank

### Speaker Templates
Fields:
- name (required)
- categoryId (required)
- defaultDurationMinutes (optional, default 30)
- status (optional)
- notes (optional)

### Bank Behavior
- Dragging a template into an episode creates a new Card Instance.
- Template remains in bank. This is copy-on-drop.

### Bank UX
- Search filter by name
- Filter by category
- Button: "New Speaker"
- Speakers shown as mini cards

---

## Categories

### Requirements
- Category is represented by:
  - name (string)
  - color (hex string)
- Card must show category in two ways:
  - left color stripe
  - category name text near the top of card
- Must support:
  - Default categories seed
  - "Other" always available
  - Creating a new custom category inline with custom color picker
  - Editing existing categories later (nice to have, not required for MVP)

### Category Picker
- Clicking category pill opens a small menu:
  - list existing categories
  - "New category..." flow:
    - name input
    - color picker
    - save and apply

Data hygiene:
- Use stable IDs for categories.
- Cards store categoryId, not raw color.
- If a category is deleted, cards fallback to "Other".

---

## Drag and Drop
- Drag from bank into any episode.
- Drag within an episode to reorder cards vertically.
- Drag between episodes.
- Dragging should snap into an ordered list, not free-floating placement.
- Episode lane can scroll if long.

Implementation suggestion:
- Use a proven DnD library (React: dnd-kit recommended).

---

## Persistence and Export
### MVP Storage
- Store everything in localStorage keyed by boardId.
- Provide "Export JSON" and "Import JSON" actions.
- Import should validate schema and reject invalid payloads.

### Data Model (Versioned)
- Add `schemaVersion: 1` at root.
- Include `updatedAt` timestamp.

Example shape:
- Board
  - id
  - title
  - schemaVersion
  - categories[]
  - speakers[] (templates)
  - episodes[]
  - updatedAt

Episodes:
- id
- dateLabel (string, user-controlled)
- title (string)
- cardIds[] ordered list

Cards:
- id
- type: "speaker" | "qa"
- speakerTemplateId (optional, for speaker cards)
- titleOverride (optional)
- durationMinutes
- categoryId
- notes
- createdAt
- updatedAt

---

## Code Quality and Hygiene Requirements
- TypeScript required.
- Use a central `types.ts` defining all schemas.
- Add runtime validation for imported JSON (zod recommended).
- Never mutate state directly. Use immutable updates.
- Keep UI components pure. Put data logic in a store layer.
- Add a small test suite for:
  - schema validation
  - duration cycling
  - totals calculation
  - category fallback behavior

Suggested structure:
- /src
  - /components
  - /store
  - /models (zod schemas + migrations)
  - /utils
  - /docs
  - types.ts

---

## Logging and Maintainership Docs (Required)
Create /docs/APP_STATE.md with:
1) Current feature set (what exists)
2) Known limitations
3) Data model summary (schemas, version)
4) Roadmap section (next 5 likely improvements)
5) "How to run" and "How to deploy" notes
6) "How to safely edit the data model" instructions

Create /docs/CHANGELOG.md:
- Keep entries short.
- Every change that affects data model, storage, or UI behavior must be logged.
- Include date, summary, and migration notes if relevant.

Add a "Maintenance Rules" section in APP_STATE.md:
- Always update APP_STATE.md when behavior changes.
- Always update CHANGELOG.md for user-visible changes.
- Bump schemaVersion and add a migration when data shape changes.
- Never ship without validating imported JSON.

---

## Accessibility and UX
- Keyboard support for:
  - moving cards up/down within episode
  - editing titles and notes
- High contrast mode is not required, but ensure legibility.
- Avoid visual noise. No full-card category fills.

---

## Deliverables
1) Working board with:
  - speaker bank
  - episode columns
  - drag and drop
  - duration cycling
  - category system with custom categories and colors
  - Q&A card type and "+ Q&A after" button
  - live totals per episode
  - localStorage persistence
  - export/import JSON
2) /docs/APP_STATE.md
3) /docs/CHANGELOG.md

---

## Nice-to-haves (Do not block MVP)
- Duplicate episode column
- Global zoom level
- Read-only "public view" route
- Print-friendly export
- Firebrain auth integration