import { useState } from 'react'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { useBoardStore } from '../store/boardStore'
import { episodeTotalMinutes } from '../utils/totals'
import { BoardCard } from './BoardCard'

interface Props {
  episodeId: string
}

// Grid lines every 20 minutes — purely decorative
const GRID_UNIT_PX = 120  // 20min in pixels (same as durationToHeight(20))
const GRID_LINES = 6       // show up to 120 min of guides

export function EpisodeColumn({ episodeId }: Props) {
  const board = useBoardStore(s => s.board)
  const updateEpisode = useBoardStore(s => s.updateEpisode)
  const removeEpisode = useBoardStore(s => s.removeEpisode)
  const addCardToEpisode = useBoardStore(s => s.addCardToEpisode)

  const episode = board.episodes.find(e => e.id === episodeId)!
  const cards = episode.cardIds
    .map(id => board.cards[id])
    .filter(Boolean) as NonNullable<(typeof board.cards)[string]>[]

  const total = episodeTotalMinutes(board, episode)

  const [editingDate, setEditingDate] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [dateDraft, setDateDraft] = useState('')
  const [titleDraft, setTitleDraft] = useState('')

  const { setNodeRef, isOver } = useDroppable({ id: episodeId })

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: 260,
        flexShrink: 0,
        background: isOver ? '#f0f4ff' : '#f5f3ee',
        borderRadius: 10,
        border: '1px solid #e0dbd0',
        overflow: 'hidden',
      }}
    >
      {/* ── Column header ── */}
      <div
        style={{
          padding: '12px 14px 10px',
          borderBottom: '1px solid #e0dbd0',
          background: '#ede9df',
        }}
      >
        {/* date label */}
        {editingDate ? (
          <input
            autoFocus
            value={dateDraft}
            onChange={e => setDateDraft(e.target.value)}
            onBlur={() => {
              updateEpisode(episodeId, { dateLabel: dateDraft.trim() || episode.dateLabel })
              setEditingDate(false)
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                updateEpisode(episodeId, { dateLabel: dateDraft.trim() || episode.dateLabel })
                setEditingDate(false)
              }
              if (e.key === 'Escape') setEditingDate(false)
            }}
            style={{
              fontSize: 15,
              fontWeight: 700,
              border: 'none',
              borderBottom: '2px solid #4A90D9',
              outline: 'none',
              background: 'transparent',
              width: '100%',
              marginBottom: 4,
            }}
          />
        ) : (
          <div
            onDoubleClick={() => { setDateDraft(episode.dateLabel); setEditingDate(true) }}
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: '#333',
              cursor: 'text',
              marginBottom: 2,
            }}
            title="Double-click to edit date"
          >
            {episode.dateLabel}
          </div>
        )}

        {/* episode title */}
        {editingTitle ? (
          <input
            autoFocus
            value={titleDraft}
            placeholder="Episode title…"
            onChange={e => setTitleDraft(e.target.value)}
            onBlur={() => {
              updateEpisode(episodeId, { title: titleDraft.trim() })
              setEditingTitle(false)
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                updateEpisode(episodeId, { title: titleDraft.trim() })
                setEditingTitle(false)
              }
              if (e.key === 'Escape') setEditingTitle(false)
            }}
            style={{
              fontSize: 12,
              border: 'none',
              borderBottom: '1px solid #aaa',
              outline: 'none',
              background: 'transparent',
              width: '100%',
              color: '#666',
            }}
          />
        ) : (
          <div
            onDoubleClick={() => { setTitleDraft(episode.title); setEditingTitle(true) }}
            style={{
              fontSize: 12,
              color: episode.title ? '#666' : '#bbb',
              cursor: 'text',
              minHeight: 16,
            }}
            title="Double-click to edit episode title"
          >
            {episode.title || 'Untitled episode'}
          </div>
        )}

        {/* totals */}
        <div
          style={{
            marginTop: 8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 11, color: '#888' }}>
            {cards.length} card{cards.length !== 1 ? 's' : ''}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: total > 60 ? '#c0392b' : '#27ae60',
              background: total > 60 ? '#fdecea' : '#eafbea',
              padding: '2px 8px',
              borderRadius: 10,
            }}
          >
            {total}m
          </span>
        </div>
      </div>

      {/* ── Card lane ── */}
      <div
        ref={setNodeRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 10,
          position: 'relative',
          minHeight: 200,
        }}
      >
        {/* reference grid lines */}
        {Array.from({ length: GRID_LINES }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 10,
              right: 10,
              top: (i + 1) * GRID_UNIT_PX + 10,
              height: 1,
              background: '#e0dbd0',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        ))}

        <SortableContext
          items={episode.cardIds}
          strategy={verticalListSortingStrategy}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              position: 'relative',
              zIndex: 1,
            }}
          >
            {cards.map(card => (
              <BoardCard key={card.id} card={card} episodeId={episodeId} />
            ))}
          </div>
        </SortableContext>

        {cards.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              color: '#bbb',
              fontSize: 13,
              marginTop: 40,
              pointerEvents: 'none',
            }}
          >
            Drop speakers here
          </div>
        )}
      </div>

      {/* ── Column footer ── */}
      <div
        style={{
          padding: '8px 10px',
          borderTop: '1px solid #e0dbd0',
          display: 'flex',
          gap: 6,
        }}
      >
        <button
          onClick={() => addCardToEpisode(episodeId, 'speaker')}
          style={footerBtnStyle}
        >
          + Speaker
        </button>
        <button
          onClick={() => addCardToEpisode(episodeId, 'qa')}
          style={footerBtnStyle}
        >
          + Q&amp;A
        </button>
        <button
          onClick={() => {
            if (window.confirm('Remove this episode and all its cards?')) {
              removeEpisode(episodeId)
            }
          }}
          style={{ ...footerBtnStyle, marginLeft: 'auto', color: '#c0392b' }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}

const footerBtnStyle: React.CSSProperties = {
  padding: '4px 10px',
  fontSize: 11,
  border: '1px solid #d0cbc0',
  borderRadius: 5,
  background: '#fff',
  cursor: 'pointer',
  color: '#444',
  fontFamily: 'inherit',
}
