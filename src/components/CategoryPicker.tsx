import { useRef, useState } from 'react'
import type { Category } from '../types'
import { useBoardStore } from '../store/boardStore'
import { resolveCategory } from '../utils/category'

interface Props {
  currentCategoryId: string
  onSelect: (categoryId: string) => void
}

export function CategoryPicker({ currentCategoryId, onSelect }: Props) {
  const categories = useBoardStore(s => s.board.categories)
  const addCategory = useBoardStore(s => s.addCategory)

  const [open, setOpen] = useState(false)
  const [newMode, setNewMode] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#4A90D9')

  const current = resolveCategory(categories, currentCategoryId)
  const triggerRef = useRef<HTMLButtonElement>(null)

  function handleSelect(cat: Category) {
    onSelect(cat.id)
    setOpen(false)
    setNewMode(false)
  }

  function handleCreate() {
    if (!newName.trim()) return
    const cat = addCategory(newName.trim(), newColor)
    onSelect(cat.id)
    setOpen(false)
    setNewMode(false)
    setNewName('')
    setNewColor('#4A90D9')
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={triggerRef}
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '2px 8px',
          borderRadius: 12,
          border: `1.5px solid ${current.color}`,
          background: `${current.color}22`,
          color: current.color,
          fontSize: 11,
          fontWeight: 600,
          cursor: 'pointer',
          letterSpacing: 0.3,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: current.color,
            flexShrink: 0,
          }}
        />
        {current.name}
      </button>

      {open && (
        <>
          {/* backdrop */}
          <div
            onClick={() => { setOpen(false); setNewMode(false) }}
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
          />
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 4,
              background: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: 8,
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              zIndex: 100,
              minWidth: 180,
              padding: 6,
            }}
          >
            {!newMode ? (
              <>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleSelect(cat)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                      padding: '6px 8px',
                      border: 'none',
                      borderRadius: 6,
                      background: cat.id === currentCategoryId ? '#f0f0f0' : 'transparent',
                      cursor: 'pointer',
                      fontSize: 13,
                      textAlign: 'left',
                    }}
                  >
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: cat.color,
                        flexShrink: 0,
                      }}
                    />
                    {cat.name}
                  </button>
                ))}
                <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #eee' }} />
                <button
                  onClick={() => setNewMode(true)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '6px 8px',
                    border: 'none',
                    borderRadius: 6,
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: 13,
                    textAlign: 'left',
                    color: '#555',
                  }}
                >
                  + New category…
                </button>
              </>
            ) : (
              <div style={{ padding: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 8 }}>
                  New Category
                </div>
                <input
                  autoFocus
                  placeholder="Name"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  style={{
                    width: '100%',
                    padding: '4px 8px',
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    fontSize: 13,
                    marginBottom: 6,
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <label style={{ fontSize: 12, color: '#555' }}>Color</label>
                  <input
                    type="color"
                    value={newColor}
                    onChange={e => setNewColor(e.target.value)}
                    style={{ width: 36, height: 28, border: 'none', cursor: 'pointer', borderRadius: 4 }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={handleCreate}
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
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setNewMode(false)}
                    style={{
                      padding: '5px 10px',
                      background: '#eee',
                      border: 'none',
                      borderRadius: 5,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
