import { useRef, useState } from 'react'
import { useBoardStore } from '../store/boardStore'
import { exportBoardJSON, importBoardJSON } from '../utils/storage'

export function TopBar() {
  const board = useBoardStore(s => s.board)
  const setBoardTitle = useBoardStore(s => s.setBoardTitle)
  const addEpisode = useBoardStore(s => s.addEpisode)
  const importBoard = useBoardStore(s => s.importBoard)
  const resetBoard = useBoardStore(s => s.resetBoard)

  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [importError, setImportError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const imported = importBoardJSON(ev.target?.result as string)
        importBoard(imported)
        setImportError(null)
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Import failed')
      }
    }
    reader.readAsText(file)
    // reset input so same file can be re-imported
    e.target.value = ''
  }

  return (
    <div
      style={{
        height: 52,
        display: 'flex',
        alignItems: 'center',
        padding: '0 18px',
        background: '#2c2a27',
        color: '#f0ede6',
        gap: 12,
        flexShrink: 0,
        borderBottom: '2px solid #1a1917',
      }}
    >
      {/* board title */}
      {editingTitle ? (
        <input
          autoFocus
          value={titleDraft}
          onChange={e => setTitleDraft(e.target.value)}
          onBlur={() => {
            setBoardTitle(titleDraft.trim() || board.title)
            setEditingTitle(false)
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              setBoardTitle(titleDraft.trim() || board.title)
              setEditingTitle(false)
            }
            if (e.key === 'Escape') setEditingTitle(false)
          }}
          style={{
            fontSize: 18,
            fontWeight: 700,
            background: 'transparent',
            border: 'none',
            borderBottom: '2px solid #7ecef4',
            color: '#f0ede6',
            outline: 'none',
            width: 280,
          }}
        />
      ) : (
        <span
          onDoubleClick={() => { setTitleDraft(board.title); setEditingTitle(true) }}
          style={{
            fontSize: 18,
            fontWeight: 700,
            cursor: 'text',
            letterSpacing: 0.2,
          }}
          title="Double-click to edit title"
        >
          {board.title}
        </span>
      )}

      <div style={{ flex: 1 }} />

      {importError && (
        <span
          style={{
            fontSize: 11,
            color: '#ff8080',
            maxWidth: 260,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={importError}
        >
          ⚠ {importError}
        </span>
      )}

      {/* controls */}
      <button onClick={addEpisode} style={barBtnStyle('#4A90D9')}>
        + Episode
      </button>

      <button
        onClick={() => exportBoardJSON(board)}
        style={barBtnStyle('#27ae60')}
      >
        Export JSON
      </button>

      <button
        onClick={() => fileRef.current?.click()}
        style={barBtnStyle('#e67e22')}
      >
        Import JSON
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        onChange={handleImportFile}
        style={{ display: 'none' }}
      />

      <button
        onClick={() => {
          if (window.confirm('Reset the board? All data will be lost.')) {
            resetBoard()
          }
        }}
        style={barBtnStyle('#888')}
      >
        Reset
      </button>
    </div>
  )
}

function barBtnStyle(color: string): React.CSSProperties {
  return {
    padding: '5px 14px',
    fontSize: 12,
    fontWeight: 600,
    border: `1.5px solid ${color}`,
    borderRadius: 6,
    background: 'transparent',
    color,
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: 0.2,
    transition: 'background 0.1s',
  }
}
