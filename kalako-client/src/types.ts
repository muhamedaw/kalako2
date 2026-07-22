export type Screen =
  | 'welcome'
  | 'create'
  | 'join'
  | 'lobby'
  | 'category_pick'
  | 'answering'
  | 'voting'
  | 'round_results'
  | 'game_over'
  | 'dev_asset_preview'
  | 'about'
  | 'how_to_play'

export const CATEGORIES = [
  { id: 'general', label: 'عامة', emoji: '🌍' },
  { id: 'science', label: 'علوم', emoji: '🔬' },
  { id: 'history', label: 'تاريخ', emoji: '📜' },
  { id: 'geography', label: 'جغرافيا', emoji: '🗺️' },
  { id: 'sports', label: 'رياضة', emoji: '⚽' },
  { id: 'movies', label: 'أفلام', emoji: '🎬' },
  { id: 'celebrities', label: 'مشاهير', emoji: '⭐' },
  { id: 'cooking', label: 'طبخ', emoji: '🍳' },
]

export function getCategoryLabel(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id
}

export function getCategoryEmoji(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.emoji ?? '❓'
}

export const AVATARS = ['🦊', '🐱', '🐶', '🦁', '🐸', '🐙', '🦄', '🐼', '🐧', '🐲', '🤖', '👾']
