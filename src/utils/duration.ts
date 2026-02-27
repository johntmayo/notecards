import { DURATION_PRESETS, type DurationPreset } from '../types'

/** Cycles to next duration preset: 20→30→60→20 */
export function cycleDuration(current: DurationPreset): DurationPreset {
  const idx = DURATION_PRESETS.indexOf(current)
  return DURATION_PRESETS[(idx + 1) % DURATION_PRESETS.length]!
}

/** Returns approximate card height in pixels based on duration */
export function durationToHeight(minutes: DurationPreset): number {
  // Base: 20min = 120px, 30min = 160px, 60min = 280px
  switch (minutes) {
    case 20: return 120
    case 30: return 160
    case 60: return 280
  }
}
