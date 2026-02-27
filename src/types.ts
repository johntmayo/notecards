// ─── Core Domain Types ───────────────────────────────────────────────────────
// All entities use stable nanoid strings as IDs.
// Cards store categoryId references — never raw color values.

export type CardType = 'speaker' | 'qa'

export type SpeakerStatus = 'pitch' | 'invited' | 'confirmed' | 'scheduled'

export interface Category {
  id: string
  name: string
  color: string // hex, e.g. "#4A90D9"
}

export interface SpeakerTemplate {
  id: string
  name: string
  categoryId: string
  defaultDurationMinutes: 20 | 30 | 60
  status: SpeakerStatus
  notes: string
  createdAt: string // ISO 8601
  updatedAt: string
}

export interface Card {
  id: string
  type: CardType
  speakerTemplateId?: string // only for speaker cards
  titleOverride?: string     // custom title; falls back to template name
  durationMinutes: 20 | 30 | 60
  categoryId: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface Episode {
  id: string
  dateLabel: string  // user-controlled string, e.g. "March 14"
  title: string
  cardIds: string[]  // ordered
}

export interface Board {
  id: string
  title: string
  schemaVersion: 1
  categories: Category[]
  speakers: SpeakerTemplate[]
  episodes: Episode[]
  cards: Record<string, Card> // keyed by card id
  updatedAt: string
}

// ─── Duration Presets ─────────────────────────────────────────────────────────
export const DURATION_PRESETS = [20, 30, 60] as const
export type DurationPreset = (typeof DURATION_PRESETS)[number]

// ─── UI State (not persisted) ─────────────────────────────────────────────────
export interface BankFilters {
  search: string
  categoryId: string | null
}
