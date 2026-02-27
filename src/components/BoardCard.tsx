import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Card } from '../types'
import { useBoardStore } from '../store/boardStore'
import { resolveCategory } from '../utils/category'
import { durationToHeight } from '../utils/duration'
import { CategoryPicker } from './CategoryPicker'

interface Props {
  card: Card
  episodeId: string
}

const STATUS_ICONS: Record<string, string> = {
  pitch: '🔵',
  invited: '🟡',
  confirmed: '🟢',
  scheduled: '✅',
}

export function BoardCard({ card, episodeId }: Props) {
  const board = useBoardStore(s => s.board)
  const updateCard = useBoardStore(s => s.updateCard)
  const cycleDur = useBoardStore(s => s.cycleDuration)
  const deleteCard = useBoardStore(s => s.deleteCard)
  const duplicateCard = useBoardStore(s => s.duplicateCard)
  const addQAAfterCard = useBoardStore(s => s.addQAAfterCard)

  const [hovering, setHovering] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const category = resolveCategory(board.categories, card.categoryId)

  const template = card.speakerTemplateId
    ? board.speakers.find(s => s.id === card.speakerTemplateId)
    : undefined

  const displayTitle =
    card.titleOverride ??
    (card.type === 'qa' ? 'Q&A' : template?.name ?? 'Untitled Speaker')

  const height = durationToHeight(card.durationMinutes)

  function startEditTitle() {
    setTitleDraft(displayTitle)
    setEditingTitle(true)
  }

  function commitTitle() {
    updateCard(card.id, { titleOverride: titleDraft.trim() || undefined })
    setEditingTitle(false)
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        position: 'relative',
        minHeight: height,
        opacity: isDragging ? 0.4 : 1,
        userSelect: 'none',
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* card body */}
      <div
        style={{
          display: 'flex',
          borderRadius: 6,
          border: '1px solid #d8d4cc',
          background: card.type === 'qa' ? '#fafaf8' : '#fffef9',
          boxShadow: hovering
            ? '0 4px 12px rgba(0,0,0,0.12)'
            : '0 2px 4px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          minHeight: height - 8,
          transition: 'box-shadow 0.15s',
        }}
      >
        {/* left color stripe */}
        <div
          style={{
            width: 5,
            flexShrink: 0,
            background: category.color,
            borderRadius: '6px 0 0 6px',
          }}
        />

        {/* drag handle + content */}
        <div style={{ flex: 1, padding: '10px 12px 10px 10px' }}>
          {/* drag grip */}
          <div
            {...attributes}
            {...listeners}
            style={{
              position: 'absolute',
              top: 8,
              right: 10,
              cursor: 'grab',
              color: '#bbb',
              fontSize: 14,
              lineHeight: 1,
              display: hovering ? 'block' : 'none',
            }}
          >
            ⠿
          </div>

          {/* category pill */}
          <div style={{ marginBottom: 6 }}>
            <CategoryPicker
              currentCategoryId={card.categoryId}
              onSelect={cid => updateCard(card.id, { categoryId: cid })}
            />
          </div>

          {/* title */}
          {editingTitle ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={e => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={e => {
                if (e.key === 'Enter') commitTitle()
                if (e.key === 'Escape') setEditingTitle(false)
              }}
              style={{
                width: '100%',
                fontSize: 14,
                fontWeight: 600,
                border: 'none',
                borderBottom: '2px solid #4A90D9',
                outline: 'none',
                background: 'transparent',
                marginBottom: 4,
                boxSizing: 'border-box',
              }}
            />
          ) : (
            <div
              onDoubleClick={startEditTitle}
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#222',
                marginBottom: 4,
                lineHeight: 1.3,
                cursor: 'text',
              }}
              title="Double-click to edit"
            >
              {displayTitle}
              {template?.status && (
                <span style={{ marginLeft: 6, fontSize: 12 }}>
                  {STATUS_ICONS[template.status]}
                </span>
              )}
            </div>
          )}

          {/* notes area */}
          {notesOpen && (
            <textarea
              value={card.notes}
              onChange={e => updateCard(card.id, { notes: e.target.value })}
              placeholder="Notes…"
              rows={3}
              style={{
                width: '100%',
                fontSize: 12,
                color: '#555',
                border: '1px solid #e0e0e0',
                borderRadius: 4,
                padding: '4px 6px',
                resize: 'vertical',
                fontFamily: 'inherit',
                background: '#fafaf7',
                boxSizing: 'border-box',
                marginTop: 4,
              }}
            />
          )}
        </div>
      </div>

      {/* hover controls bar */}
      {hovering && (
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 14,
            display: 'flex',
            gap: 6,
            alignItems: 'center',
          }}
        >
          {/* duration cycle */}
          <button
            onClick={() => cycleDur(card.id)}
            title="Cycle duration"
            style={controlBtnStyle}
          >
            {card.durationMinutes}m
          </button>

          {/* notes toggle */}
          <button
            onClick={() => setNotesOpen(o => !o)}
            title="Toggle notes"
            style={{ ...controlBtnStyle, background: notesOpen ? '#e8f0fe' : undefined }}
          >
            📝
          </button>

          {/* duplicate */}
          <button
            onClick={() => duplicateCard(episodeId, card.id)}
            title="Duplicate card"
            style={controlBtnStyle}
          >
            ⧉
          </button>

          {/* delete */}
          <button
            onClick={() => deleteCard(episodeId, card.id)}
            title="Delete card"
            style={{ ...controlBtnStyle, color: '#c0392b' }}
          >
            ✕
          </button>

          {/* Q&A after (speaker cards only) */}
          {card.type === 'speaker' && (
            <button
              onClick={() => addQAAfterCard(episodeId, card.id)}
              title="Insert Q&A after"
              style={{ ...controlBtnStyle, color: '#27ae60', fontWeight: 700 }}
            >
              + Q&amp;A
            </button>
          )}
        </div>
      )}
    </div>
  )
}

const controlBtnStyle: React.CSSProperties = {
  padding: '2px 8px',
  fontSize: 11,
  border: '1px solid #ddd',
  borderRadius: 4,
  background: '#fff',
  cursor: 'pointer',
  color: '#444',
  fontFamily: 'inherit',
}
