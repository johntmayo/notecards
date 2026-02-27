import type { Board, Category } from '../types'
import { nanoid } from 'nanoid'

// ─── Default Categories ───────────────────────────────────────────────────────

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-policy',    name: 'Policy',    color: '#4A90D9' },
  { id: 'cat-local',     name: 'Local',     color: '#7ED321' },
  { id: 'cat-tech',      name: 'Tech',      color: '#9B59B6' },
  { id: 'cat-culture',   name: 'Culture',   color: '#E67E22' },
  { id: 'cat-other',     name: 'Other',     color: '#95A5A6' },
]

export const FALLBACK_CATEGORY_ID = 'cat-other'

// ─── Initial Board ────────────────────────────────────────────────────────────

export function makeInitialBoard(): Board {
  const now = new Date().toISOString()
  return {
    id: nanoid(),
    title: 'Speaker Series',
    schemaVersion: 1,
    categories: DEFAULT_CATEGORIES,
    speakers: [],
    episodes: [],
    cards: {},
    updatedAt: now,
  }
}
