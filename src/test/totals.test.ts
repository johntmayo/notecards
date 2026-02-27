import { describe, it, expect } from 'vitest'
import { episodeTotalMinutes } from '../utils/totals'
import type { Board, Episode } from '../types'

function makeBoard(cards: Record<string, { durationMinutes: number }>): Board {
  return {
    id: 'b1',
    title: 'Test',
    schemaVersion: 1,
    categories: [],
    speakers: [],
    episodes: [],
    cards: Object.fromEntries(
      Object.entries(cards).map(([id, c]) => [
        id,
        {
          id,
          type: 'speaker',
          durationMinutes: c.durationMinutes as 20 | 30 | 60,
          categoryId: 'cat-other',
          notes: '',
          createdAt: '',
          updatedAt: '',
        },
      ]),
    ),
    updatedAt: '',
  }
}

describe('episodeTotalMinutes', () => {
  it('sums card durations', () => {
    const board = makeBoard({ c1: { durationMinutes: 30 }, c2: { durationMinutes: 20 } })
    const episode: Episode = { id: 'ep1', dateLabel: 'Jan 1', title: '', cardIds: ['c1', 'c2'] }
    expect(episodeTotalMinutes(board, episode)).toBe(50)
  })

  it('returns 0 for empty episode', () => {
    const board = makeBoard({})
    const episode: Episode = { id: 'ep1', dateLabel: 'Jan 1', title: '', cardIds: [] }
    expect(episodeTotalMinutes(board, episode)).toBe(0)
  })

  it('skips missing card ids gracefully', () => {
    const board = makeBoard({ c1: { durationMinutes: 60 } })
    const episode: Episode = { id: 'ep1', dateLabel: 'Jan 1', title: '', cardIds: ['c1', 'missing'] }
    expect(episodeTotalMinutes(board, episode)).toBe(60)
  })
})
