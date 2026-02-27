import { boardSchema } from '../models/schemas'
import type { Board } from '../types'

const STORAGE_KEY = 'speakerSeriesBoard_v1'

export function loadBoard(): Board | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const result = boardSchema.safeParse(parsed)
    return result.success ? (result.data as Board) : null
  } catch {
    return null
  }
}

export function saveBoard(board: Board): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(board))
  } catch {
    console.warn('Failed to save board to localStorage')
  }
}

export function exportBoardJSON(board: Board): void {
  const blob = new Blob([JSON.stringify(board, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `speaker-series-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/** Returns parsed board or throws descriptive error */
export function importBoardJSON(json: string): Board {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new Error('Invalid JSON — could not parse file.')
  }
  const result = boardSchema.safeParse(parsed)
  if (!result.success) {
    const issues = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('\n')
    throw new Error(`Schema validation failed:\n${issues}`)
  }
  return result.data as Board
}
