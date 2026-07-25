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
  | 'store'
  | 'global_voting'
  | 'notifications'
  | 'profile'

const CATEGORY_LABELS: Record<string, { ar: string; en: string; he: string }> = {
  general: { ar: 'عامة', en: 'General', he: 'כללי' },
  science: { ar: 'علوم', en: 'Science', he: 'מדע' },
  history: { ar: 'تاريخ', en: 'History', he: 'היסטוריה' },
  geography: { ar: 'جغرافيا', en: 'Geography', he: 'גיאוגרפיה' },
  sports: { ar: 'رياضة', en: 'Sports', he: 'ספורט' },
  movies: { ar: 'أفلام', en: 'Movies', he: 'סרטים' },
  celebrities: { ar: 'مشاهير', en: 'Celebrities', he: 'סלבריטאים' },
  cooking: { ar: 'طبخ', en: 'Cooking', he: 'בישול' },
}

const CATEGORY_EMOJI: Record<string, string> = {
  general: '🌍',
  science: '🔬',
  history: '📜',
  geography: '🗺️',
  sports: '⚽',
  movies: '🎬',
  celebrities: '⭐',
  cooking: '🍳',
}

export const CATEGORIES = Object.keys(CATEGORY_LABELS).map((id) => ({
  id,
  label: CATEGORY_LABELS[id].ar,
  emoji: CATEGORY_EMOJI[id],
}))

export function getCategoryLabel(id: string, lang: 'ar' | 'en' | 'he' = 'ar'): string {
  return CATEGORY_LABELS[id]?.[lang] ?? id
}

export function getCategoryEmoji(id: string): string {
  return CATEGORY_EMOJI[id] ?? '❓'
}

export const AVATARS = ['🦊', '🐱', '🐶', '🦁', '🐸', '🐙', '🦄', '🐼', '🐧', '🐲', '🤖', '👾']
