import { describe, it, expect } from 'vitest'
import { resolveCategory } from '../utils/category'
import type { Category } from '../types'

const categories: Category[] = [
  { id: 'cat-policy', name: 'Policy', color: '#4A90D9' },
  { id: 'cat-other',  name: 'Other',  color: '#95A5A6' },
]

describe('resolveCategory', () => {
  it('returns the matching category', () => {
    const result = resolveCategory(categories, 'cat-policy')
    expect(result.name).toBe('Policy')
  })

  it('falls back to "Other" for unknown id', () => {
    const result = resolveCategory(categories, 'cat-deleted')
    expect(result.id).toBe('cat-other')
  })

  it('provides hardcoded fallback if Other category also missing', () => {
    const result = resolveCategory([], 'cat-anything')
    expect(result.name).toBe('Other')
    expect(result.color).toBe('#95A5A6')
  })
})
