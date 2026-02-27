import { z } from 'zod'

// ─── Primitive Schemas ────────────────────────────────────────────────────────

const durationSchema = z.union([z.literal(20), z.literal(30), z.literal(60)])

const speakerStatusSchema = z.enum(['pitch', 'invited', 'confirmed', 'scheduled'])

// ─── Entity Schemas ───────────────────────────────────────────────────────────

export const categorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a hex color'),
})

export const speakerTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  categoryId: z.string().min(1),
  defaultDurationMinutes: durationSchema,
  status: speakerStatusSchema,
  notes: z.string(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
})

export const cardSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['speaker', 'qa']),
  speakerTemplateId: z.string().optional(),
  titleOverride: z.string().optional(),
  durationMinutes: durationSchema,
  categoryId: z.string().min(1),
  notes: z.string(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
})

export const episodeSchema = z.object({
  id: z.string().min(1),
  dateLabel: z.string().min(1),
  title: z.string(),
  cardIds: z.array(z.string()),
})

export const boardSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  schemaVersion: z.literal(1),
  categories: z.array(categorySchema),
  speakers: z.array(speakerTemplateSchema),
  episodes: z.array(episodeSchema),
  cards: z.record(z.string(), cardSchema),
  updatedAt: z.string().datetime({ offset: true }),
})

export type BoardExport = z.infer<typeof boardSchema>
