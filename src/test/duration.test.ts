import { describe, it, expect } from 'vitest'
import { cycleDuration } from '../utils/duration'

describe('cycleDuration', () => {
  it('cycles 20 → 30', () => {
    expect(cycleDuration(20)).toBe(30)
  })

  it('cycles 30 → 60', () => {
    expect(cycleDuration(30)).toBe(60)
  })

  it('cycles 60 → 20', () => {
    expect(cycleDuration(60)).toBe(20)
  })
})
