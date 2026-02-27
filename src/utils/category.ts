import type { Category } from '../types'
import { FALLBACK_CATEGORY_ID } from '../models/defaults'

/** Returns category by id, falling back to "Other" if not found */
export function resolveCategory(categories: Category[], categoryId: string): Category {
  return (
    categories.find(c => c.id === categoryId) ??
    categories.find(c => c.id === FALLBACK_CATEGORY_ID) ??
    { id: FALLBACK_CATEGORY_ID, name: 'Other', color: '#95A5A6' }
  )
}
