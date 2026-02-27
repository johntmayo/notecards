import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type {
  Board, Card, CardType, Category,
  DurationPreset, Episode, SpeakerStatus, SpeakerTemplate,
} from '../types'
import { makeInitialBoard, FALLBACK_CATEGORY_ID } from '../models/defaults'
import { loadBoard, saveBoard } from '../utils/storage'
import { cycleDuration } from '../utils/duration'

// ─── Store Shape ──────────────────────────────────────────────────────────────

interface BoardStore {
  board: Board

  // Board meta
  setBoardTitle: (title: string) => void

  // Episodes
  addEpisode: () => void
  updateEpisode: (id: string, patch: Partial<Pick<Episode, 'dateLabel' | 'title'>>) => void
  removeEpisode: (id: string) => void

  // Cards
  addCardToEpisode: (episodeId: string, type: CardType, templateId?: string) => string
  addQAAfterCard: (episodeId: string, afterCardId: string) => void
  updateCard: (cardId: string, patch: Partial<Pick<Card, 'titleOverride' | 'notes' | 'categoryId'>>) => void
  cycleDuration: (cardId: string) => void
  deleteCard: (episodeId: string, cardId: string) => void
  duplicateCard: (episodeId: string, cardId: string) => void
  moveCardWithinEpisode: (episodeId: string, fromIndex: number, toIndex: number) => void
  moveCardBetweenEpisodes: (fromEpisodeId: string, toEpisodeId: string, cardId: string, toIndex: number) => void

  // Speaker templates
  addSpeaker: (name: string, categoryId: string) => void
  updateSpeaker: (id: string, patch: Partial<Omit<SpeakerTemplate, 'id' | 'createdAt'>>) => void
  removeSpeaker: (id: string) => void

  // Categories
  addCategory: (name: string, color: string) => Category
  updateCategory: (id: string, patch: Partial<Pick<Category, 'name' | 'color'>>) => void

  // Persistence
  importBoard: (board: Board) => void
  resetBoard: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function now(): string {
  return new Date().toISOString()
}

function touch(board: Board): Board {
  return { ...board, updatedAt: now() }
}

function makeCard(
  type: CardType,
  categoryId: string,
  duration: DurationPreset = 30,
  templateId?: string,
  titleOverride?: string,
): Card {
  const t = now()
  return {
    id: nanoid(),
    type,
    speakerTemplateId: templateId,
    titleOverride,
    durationMinutes: duration,
    categoryId,
    notes: '',
    createdAt: t,
    updatedAt: t,
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useBoardStore = create<BoardStore>((set, get) => {
  const persist = (board: Board) => {
    saveBoard(board)
    return board
  }

  const mutate = (fn: (board: Board) => Board) => {
    set(state => {
      const next = persist(touch(fn(state.board)))
      return { board: next }
    })
  }

  return {
    board: loadBoard() ?? makeInitialBoard(),

    // ── Board meta ────────────────────────────────────────────────────────────
    setBoardTitle: (title) => mutate(b => ({ ...b, title })),

    // ── Episodes ──────────────────────────────────────────────────────────────
    addEpisode: () =>
      mutate(b => ({
        ...b,
        episodes: [
          ...b.episodes,
          {
            id: nanoid(),
            dateLabel: 'New Date',
            title: '',
            cardIds: [],
          },
        ],
      })),

    updateEpisode: (id, patch) =>
      mutate(b => ({
        ...b,
        episodes: b.episodes.map(ep => (ep.id === id ? { ...ep, ...patch } : ep)),
      })),

    removeEpisode: (id) =>
      mutate(b => {
        const ep = b.episodes.find(e => e.id === id)
        if (!ep) return b
        const cards = { ...b.cards }
        ep.cardIds.forEach(cid => delete cards[cid])
        return {
          ...b,
          episodes: b.episodes.filter(e => e.id !== id),
          cards,
        }
      }),

    // ── Cards ─────────────────────────────────────────────────────────────────
    addCardToEpisode: (episodeId, type, templateId) => {
      const board = get().board
      const template = templateId
        ? board.speakers.find(s => s.id === templateId)
        : undefined
      const categoryId = template?.categoryId ?? FALLBACK_CATEGORY_ID
      const duration: DurationPreset = template?.defaultDurationMinutes ?? 30
      const card = makeCard(type, categoryId, duration, templateId)

      mutate(b => ({
        ...b,
        episodes: b.episodes.map(ep =>
          ep.id === episodeId
            ? { ...ep, cardIds: [...ep.cardIds, card.id] }
            : ep,
        ),
        cards: { ...b.cards, [card.id]: card },
      }))

      return card.id
    },

    addQAAfterCard: (episodeId, afterCardId) =>
      mutate(b => {
        const qaCard = makeCard('qa', FALLBACK_CATEGORY_ID, 20)
        const ep = b.episodes.find(e => e.id === episodeId)
        if (!ep) return b
        const idx = ep.cardIds.indexOf(afterCardId)
        const newCardIds = [...ep.cardIds]
        newCardIds.splice(idx + 1, 0, qaCard.id)
        return {
          ...b,
          episodes: b.episodes.map(e =>
            e.id === episodeId ? { ...e, cardIds: newCardIds } : e,
          ),
          cards: { ...b.cards, [qaCard.id]: qaCard },
        }
      }),

    updateCard: (cardId, patch) =>
      mutate(b => ({
        ...b,
        cards: {
          ...b.cards,
          [cardId]: { ...b.cards[cardId]!, ...patch, updatedAt: now() },
        },
      })),

    cycleDuration: (cardId) =>
      mutate(b => {
        const card = b.cards[cardId]
        if (!card) return b
        return {
          ...b,
          cards: {
            ...b.cards,
            [cardId]: {
              ...card,
              durationMinutes: cycleDuration(card.durationMinutes),
              updatedAt: now(),
            },
          },
        }
      }),

    deleteCard: (episodeId, cardId) =>
      mutate(b => {
        const cards = { ...b.cards }
        delete cards[cardId]
        return {
          ...b,
          episodes: b.episodes.map(ep =>
            ep.id === episodeId
              ? { ...ep, cardIds: ep.cardIds.filter(id => id !== cardId) }
              : ep,
          ),
          cards,
        }
      }),

    duplicateCard: (episodeId, cardId) =>
      mutate(b => {
        const src = b.cards[cardId]
        if (!src) return b
        const t = now()
        const copy: Card = { ...src, id: nanoid(), createdAt: t, updatedAt: t }
        const ep = b.episodes.find(e => e.id === episodeId)
        if (!ep) return b
        const idx = ep.cardIds.indexOf(cardId)
        const newCardIds = [...ep.cardIds]
        newCardIds.splice(idx + 1, 0, copy.id)
        return {
          ...b,
          episodes: b.episodes.map(e =>
            e.id === episodeId ? { ...e, cardIds: newCardIds } : e,
          ),
          cards: { ...b.cards, [copy.id]: copy },
        }
      }),

    moveCardWithinEpisode: (episodeId, fromIndex, toIndex) =>
      mutate(b => ({
        ...b,
        episodes: b.episodes.map(ep => {
          if (ep.id !== episodeId) return ep
          const ids = [...ep.cardIds]
          const [moved] = ids.splice(fromIndex, 1)
          if (!moved) return ep
          ids.splice(toIndex, 0, moved)
          return { ...ep, cardIds: ids }
        }),
      })),

    moveCardBetweenEpisodes: (fromEpisodeId, toEpisodeId, cardId, toIndex) =>
      mutate(b => ({
        ...b,
        episodes: b.episodes.map(ep => {
          if (ep.id === fromEpisodeId) {
            return { ...ep, cardIds: ep.cardIds.filter(id => id !== cardId) }
          }
          if (ep.id === toEpisodeId) {
            const ids = [...ep.cardIds]
            ids.splice(toIndex, 0, cardId)
            return { ...ep, cardIds: ids }
          }
          return ep
        }),
      })),

    // ── Speakers ──────────────────────────────────────────────────────────────
    addSpeaker: (name, categoryId) => {
      const t = now()
      mutate(b => ({
        ...b,
        speakers: [
          ...b.speakers,
          {
            id: nanoid(),
            name,
            categoryId,
            defaultDurationMinutes: 30,
            status: 'pitch' as SpeakerStatus,
            notes: '',
            createdAt: t,
            updatedAt: t,
          },
        ],
      }))
    },

    updateSpeaker: (id, patch) =>
      mutate(b => ({
        ...b,
        speakers: b.speakers.map(s =>
          s.id === id ? { ...s, ...patch, updatedAt: now() } : s,
        ),
      })),

    removeSpeaker: (id) =>
      mutate(b => ({
        ...b,
        speakers: b.speakers.filter(s => s.id !== id),
      })),

    // ── Categories ────────────────────────────────────────────────────────────
    addCategory: (name, color) => {
      const cat: Category = { id: nanoid(), name, color }
      mutate(b => ({ ...b, categories: [...b.categories, cat] }))
      return cat
    },

    updateCategory: (id, patch) =>
      mutate(b => ({
        ...b,
        categories: b.categories.map(c => (c.id === id ? { ...c, ...patch } : c)),
      })),

    // ── Persistence ───────────────────────────────────────────────────────────
    importBoard: (board) => {
      persist(board)
      set({ board })
    },

    resetBoard: () => {
      const fresh = makeInitialBoard()
      persist(fresh)
      set({ board: fresh })
    },
  }
})
