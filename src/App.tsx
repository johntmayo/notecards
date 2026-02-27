import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useState } from 'react'
import { useBoardStore } from './store/boardStore'
import { TopBar } from './components/TopBar'
import { SpeakerBank } from './components/SpeakerBank'
import { EpisodeColumn } from './components/EpisodeColumn'
import { BoardCard } from './components/BoardCard'
import type { Card } from './types'

// ─── Drag helpers ─────────────────────────────────────────────────────────────

/** Returns the episodeId whose cardIds list contains the given cardId */
function findEpisodeForCard(
  episodes: { id: string; cardIds: string[] }[],
  cardId: string,
): string | null {
  return episodes.find(ep => ep.cardIds.includes(cardId))?.id ?? null
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const board = useBoardStore(s => s.board)
  const addCardToEpisode = useBoardStore(s => s.addCardToEpisode)
  const moveCardWithinEpisode = useBoardStore(s => s.moveCardWithinEpisode)
  const moveCardBetweenEpisodes = useBoardStore(s => s.moveCardBetweenEpisodes)

  const [activeCard, setActiveCard] = useState<Card | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id)
    // only set overlay for board cards (not bank drags)
    if (!id.startsWith('bank:')) {
      setActiveCard(board.cards[id] ?? null)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleDragOver(_event: DragOverEvent) {
    // live preview handled by sortable context
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null)
    const { active, over } = event
    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)

    // ── Case 1: Drag from Speaker Bank into an Episode ──────────────────────
    if (activeId.startsWith('bank:')) {
      const speakerId = activeId.replace('bank:', '')
      // over can be an episode column or a card inside one
      let targetEpisodeId = board.episodes.find(ep => ep.id === overId)?.id
      if (!targetEpisodeId) {
        targetEpisodeId = findEpisodeForCard(board.episodes, overId) ?? undefined
      }
      if (targetEpisodeId) {
        addCardToEpisode(targetEpisodeId, 'speaker', speakerId)
      }
      return
    }

    // ── Case 2: Reorder within same episode ────────────────────────────────
    const sourceEpisodeId = findEpisodeForCard(board.episodes, activeId)
    if (!sourceEpisodeId) return

    // over is another card
    const targetEpisodeForCard = findEpisodeForCard(board.episodes, overId)
    if (targetEpisodeForCard) {
      if (sourceEpisodeId === targetEpisodeForCard) {
        // same episode reorder
        const ep = board.episodes.find(e => e.id === sourceEpisodeId)!
        const fromIndex = ep.cardIds.indexOf(activeId)
        const toIndex = ep.cardIds.indexOf(overId)
        if (fromIndex !== toIndex) {
          const newOrder = arrayMove(ep.cardIds, fromIndex, toIndex)
          moveCardWithinEpisode(sourceEpisodeId, fromIndex, newOrder.indexOf(activeId))
        }
      } else {
        // cross-episode move
        const toEp = board.episodes.find(e => e.id === targetEpisodeForCard)!
        const toIndex = toEp.cardIds.indexOf(overId)
        moveCardBetweenEpisodes(sourceEpisodeId, targetEpisodeForCard, activeId, toIndex)
      }
      return
    }

    // over is an episode droppable (empty column or end of column)
    const targetEpisodeId = board.episodes.find(ep => ep.id === overId)?.id
    if (targetEpisodeId && targetEpisodeId !== sourceEpisodeId) {
      const toIndex = board.episodes.find(e => e.id === targetEpisodeId)!.cardIds.length
      moveCardBetweenEpisodes(sourceEpisodeId, targetEpisodeId, activeId, toIndex)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
          fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
          background: '#e8e3d9',
        }}
      >
        <TopBar />

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <SpeakerBank />

          {/* Main board */}
          <div
            style={{
              flex: 1,
              overflowX: 'auto',
              overflowY: 'hidden',
              padding: 20,
              display: 'flex',
              gap: 16,
              alignItems: 'flex-start',
            }}
          >
            {board.episodes.map(ep => (
              <EpisodeColumn key={ep.id} episodeId={ep.id} />
            ))}

            {board.episodes.length === 0 && (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#aaa',
                  fontSize: 15,
                }}
              >
                Click &quot;+ Episode&quot; to get started.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drag overlay — ghost card during drag */}
      <DragOverlay>
        {activeCard ? (
          <div style={{ opacity: 0.85, pointerEvents: 'none' }}>
            <BoardCard card={activeCard} episodeId="__overlay__" />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
