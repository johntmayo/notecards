import { useRef, useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import type { SpeakerTemplate } from '../types'
import { useBoardStore } from '../store/boardStore'
import { resolveCategory } from '../utils/category'
import { CategoryPicker } from './CategoryPicker'

// ─── Draggable bank mini-card ─────────────────────────────────────────────────

function BankCard({ speaker }: { speaker: SpeakerTemplate }) {
  const board = useBoardStore(s => s.board)
  const updateSpeaker = useBoardStore(s => s.updateSpeaker)
  const removeSpeaker = useBoardStore(s => s.removeSpeaker)

  const category = resolveCategory(board.categories, speaker.categoryId)
  const [hovering, setHovering] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState('')

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `bank:${speaker.id}`,
    data: { type: 'bank-speaker', speakerId: speaker.id },
  })

  const STATUS_COLORS: Record<string, string> = {
    pitch: '#95A5A6',
    invited: '#E67E22',
    confirmed: '#3498DB',
    scheduled: '#27AE60',
  }
  const STATUS_LABELS: Record<string, string> = {
    pitch: 'Pitch',
    invited: 'Invited',
    confirmed: 'Confirmed',
    scheduled: 'Scheduled',
  }
  const STATUSES = ['pitch', 'invited', 'confirmed', 'scheduled'] as const

  return (
    <div
      ref={setNodeRef}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        display: 'flex',
        borderRadius: 6,
        border: '1px solid #ddd',
        background: '#fffef9',
        boxShadow: isDragging
          ? '0 8px 20px rgba(0,0,0,0.18)'
          : hovering
            ? '0 3px 10px rgba(0,0,0,0.1)'
            : '0 1px 3px rgba(0,0,0,0.06)',
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        overflow: 'hidden',
        transition: 'box-shadow 0.15s',
      }}
    >
      {/* color stripe */}
      <div style={{ width: 4, background: category.color, flexShrink: 0 }} />

      {/* content */}
      <div
        {...attributes}
        {...listeners}
        style={{ flex: 1, padding: '8px 10px' }}
      >
        {/* name */}
        {editingName ? (
          <input
            autoFocus
            value={nameDraft}
            onChange={e => setNameDraft(e.target.value)}
            onBlur={() => {
              updateSpeaker(speaker.id, { name: nameDraft.trim() || speaker.name })
              setEditingName(false)
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                updateSpeaker(speaker.id, { name: nameDraft.trim() || speaker.name })
                setEditingName(false)
              }
              if (e.key === 'Escape') setEditingName(false)
            }}
            onClick={e => e.stopPropagation()}
            style={{
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              borderBottom: '2px solid #4A90D9',
              outline: 'none',
              background: 'transparent',
              width: '100%',
            }}
          />
        ) : (
          <div
            onDoubleClick={e => {
              e.stopPropagation()
              setNameDraft(speaker.name)
              setEditingName(true)
            }}
            style={{ fontSize: 13, fontWeight: 600, color: '#222', marginBottom: 4 }}
          >
            {speaker.name}
          </div>
        )}

        {/* category + status row */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}
          onClick={e => e.stopPropagation()}
        >
          <CategoryPicker
            currentCategoryId={speaker.categoryId}
            onSelect={cid => updateSpeaker(speaker.id, { categoryId: cid })}
          />
          <select
            value={speaker.status}
            onChange={e => updateSpeaker(speaker.id, { status: e.target.value as typeof STATUSES[number] })}
            style={{
              fontSize: 10,
              border: 'none',
              background: `${STATUS_COLORS[speaker.status]}22`,
              color: STATUS_COLORS[speaker.status],
              fontWeight: 600,
              borderRadius: 10,
              padding: '2px 6px',
              cursor: 'pointer',
            }}
          >
            {STATUSES.map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>

          {hovering && (
            <button
              onClick={e => {
                e.stopPropagation()
                if (window.confirm(`Remove "${speaker.name}" from bank?`)) removeSpeaker(speaker.id)
              }}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                color: '#c0392b',
                cursor: 'pointer',
                fontSize: 12,
                padding: 0,
              }}
              title="Remove from bank"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── New speaker form ─────────────────────────────────────────────────────────

function NewSpeakerForm({ onDone }: { onDone: () => void }) {
  const board = useBoardStore(s => s.board)
  const addSpeaker = useBoardStore(s => s.addSpeaker)
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState(board.categories[0]?.id ?? 'cat-other')
  const inputRef = useRef<HTMLInputElement>(null)

  function submit() {
    if (!name.trim()) return
    addSpeaker(name.trim(), categoryId)
    setName('')
    onDone()
  }

  return (
    <div
      style={{
        padding: 10,
        border: '1px dashed #bbb',
        borderRadius: 8,
        background: '#fafaf7',
      }}
    >
      <input
        ref={inputRef}
        autoFocus
        placeholder="Speaker name"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') submit()
          if (e.key === 'Escape') onDone()
        }}
        style={{
          width: '100%',
          padding: '5px 8px',
          fontSize: 13,
          border: '1px solid #ddd',
          borderRadius: 5,
          marginBottom: 8,
          boxSizing: 'border-box',
          fontFamily: 'inherit',
        }}
      />
      <div style={{ marginBottom: 8 }}>
        <CategoryPicker
          currentCategoryId={categoryId}
          onSelect={setCategoryId}
        />
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          onClick={submit}
          style={{
            flex: 1,
            padding: '5px 0',
            background: '#333',
            color: '#fff',
            border: 'none',
            borderRadius: 5,
            fontSize: 12,
            cursor: 'pointer',
            fontWeight: 600,
            fontFamily: 'inherit',
          }}
        >
          Add
        </button>
        <button
          onClick={onDone}
          style={{
            padding: '5px 12px',
            background: '#eee',
            border: 'none',
            borderRadius: 5,
            fontSize: 12,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Speaker Bank ─────────────────────────────────────────────────────────────

export function SpeakerBank() {
  const board = useBoardStore(s => s.board)
  const [search, setSearch] = useState('')
  const [filterCategoryId, setFilterCategoryId] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)

  const filtered = board.speakers.filter(s => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
    if (filterCategoryId && s.categoryId !== filterCategoryId) return false
    return true
  })

  return (
    <div
      style={{
        width: 240,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#f0ede6',
        borderRight: '2px solid #ddd8cc',
        height: '100%',
      }}
    >
      {/* header */}
      <div
        style={{
          padding: '14px 14px 10px',
          borderBottom: '1px solid #ddd8cc',
          background: '#e8e4db',
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 8 }}>
          SPEAKER BANK
        </div>

        {/* search */}
        <input
          placeholder="Search…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '5px 8px',
            fontSize: 12,
            border: '1px solid #ccc',
            borderRadius: 5,
            background: '#fff',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            marginBottom: 6,
          }}
        />

        {/* category filter */}
        <select
          value={filterCategoryId ?? ''}
          onChange={e => setFilterCategoryId(e.target.value || null)}
          style={{
            width: '100%',
            padding: '4px 6px',
            fontSize: 12,
            border: '1px solid #ccc',
            borderRadius: 5,
            background: '#fff',
            fontFamily: 'inherit',
          }}
        >
          <option value="">All categories</option>
          {board.categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* speaker list */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {filtered.map(speaker => (
          <BankCard key={speaker.id} speaker={speaker} />
        ))}

        {filtered.length === 0 && !showNewForm && (
          <div style={{ fontSize: 12, color: '#aaa', textAlign: 'center', marginTop: 20 }}>
            {board.speakers.length === 0 ? 'No speakers yet.' : 'No matches.'}
          </div>
        )}

        {showNewForm && (
          <NewSpeakerForm onDone={() => setShowNewForm(false)} />
        )}
      </div>

      {/* footer */}
      <div style={{ padding: '8px 10px', borderTop: '1px solid #ddd8cc' }}>
        <button
          onClick={() => setShowNewForm(true)}
          style={{
            width: '100%',
            padding: '6px 0',
            fontSize: 12,
            border: '1px solid #c0bbb0',
            borderRadius: 6,
            background: '#fff',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontWeight: 600,
            color: '#444',
          }}
        >
          + New Speaker
        </button>
      </div>
    </div>
  )
}
