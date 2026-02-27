import { describe, it, expect } from 'vitest'
import { boardSchema, cardSchema, categorySchema } from '../models/schemas'

describe('categorySchema', () => {
  it('accepts valid category', () => {
    const result = categorySchema.safeParse({
      id: 'cat-1',
      name: 'Policy',
      color: '#4A90D9',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid hex color', () => {
    const result = categorySchema.safeParse({
      id: 'cat-1',
      name: 'Policy',
      color: 'blue',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing name', () => {
    const result = categorySchema.safeParse({
      id: 'cat-1',
      name: '',
      color: '#4A90D9',
    })
    expect(result.success).toBe(false)
  })
})

describe('cardSchema', () => {
  const validCard = {
    id: 'card-1',
    type: 'speaker',
    durationMinutes: 30,
    categoryId: 'cat-1',
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  it('accepts valid speaker card', () => {
    expect(cardSchema.safeParse(validCard).success).toBe(true)
  })

  it('accepts valid QA card', () => {
    expect(cardSchema.safeParse({ ...validCard, type: 'qa' }).success).toBe(true)
  })

  it('rejects invalid duration', () => {
    expect(cardSchema.safeParse({ ...validCard, durationMinutes: 45 }).success).toBe(false)
  })

  it('rejects invalid type', () => {
    expect(cardSchema.safeParse({ ...validCard, type: 'break' }).success).toBe(false)
  })
})

describe('boardSchema', () => {
  it('rejects wrong schemaVersion', () => {
    const result = boardSchema.safeParse({
      id: 'b1',
      title: 'Test',
      schemaVersion: 2,
      categories: [],
      speakers: [],
      episodes: [],
      cards: {},
      updatedAt: new Date().toISOString(),
    })
    expect(result.success).toBe(false)
  })

  it('accepts minimal valid board', () => {
    const result = boardSchema.safeParse({
      id: 'b1',
      title: 'Test Board',
      schemaVersion: 1,
      categories: [],
      speakers: [],
      episodes: [],
      cards: {},
      updatedAt: new Date().toISOString(),
    })
    expect(result.success).toBe(true)
  })
})
