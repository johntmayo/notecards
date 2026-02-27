import type { Board, Episode } from '../types'

/** Computes total scheduled minutes for an episode */
export function episodeTotalMinutes(board: Board, episode: Episode): number {
  return episode.cardIds.reduce((sum, cardId) => {
    const card = board.cards[cardId]
    return sum + (card?.durationMinutes ?? 0)
  }, 0)
}
