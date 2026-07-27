export type Screen =
  | 'auth'
  | 'recover'
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
  | 'admin_dashboard'
  | 'about'
  | 'how_to_play'
  | 'store'
  | 'global_voting'
  | 'notifications'
  | 'profile'
  | 'premium'
  | 'legal_privacy'
  | 'legal_terms'
  | 'legal_refund'

const CATEGORY_LABELS: Record<string, { ar: string; en: string; he: string }> = {
  general: { ar: 'عامة', en: 'General', he: 'כללי' },
  science: { ar: 'علوم', en: 'Science', he: 'מדע' },
  history: { ar: 'تاريخ', en: 'History', he: 'היסטוריה' },
  geography: { ar: 'جغرافيا', en: 'Geography', he: 'גיאוגרפיה' },
  sports: { ar: 'رياضة', en: 'Sports', he: 'ספורט' },
  movies: { ar: 'أفلام', en: 'Movies', he: 'סרטים' },
  celebrities: { ar: 'مشاهير', en: 'Celebrities', he: 'סלבריטאים' },
  cooking: { ar: 'طبخ', en: 'Cooking', he: 'בישול' },
  music: { ar: 'موسيقى', en: 'Music', he: 'מוזיקה' },
  tech: { ar: 'تكنولوجيا', en: 'Technology', he: 'טכנולוגיה' },
  mythology: { ar: 'أساطير', en: 'Mythology', he: 'מיתולוגיה' },
  picture: { ar: 'جولة الصور', en: 'Picture Round', he: 'סיבוב תמונות' },
  space: { ar: 'الفضاء والفلك', en: 'Space & Astronomy', he: 'חלל ואסטרונומיה' },
}

// Categories requiring an unlock (active Premium or a one-time coin purchase) — kept in sync
// with server/src/game/categoryAccess.mts's PREMIUM_CATEGORIES. Every category NOT in this
// set is free forever, no gating.
export const PREMIUM_CATEGORY_IDS = new Set<string>(['space'])

const CATEGORY_EMOJI: Record<string, string> = {
  general: '🌍',
  science: '🔬',
  history: '📜',
  geography: '🗺️',
  sports: '⚽',
  movies: '🎬',
  celebrities: '⭐',
  cooking: '🍳',
  music: '🎵',
  tech: '💻',
  mythology: '🏛️',
  picture: '🖼️',
  space: '🪐',
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

// ─── Economy Types ───

export interface InventoryItem {
  itemId: string
  equipped: boolean
}

export interface EconomyProfile {
  deviceId: string
  nickname: string
  avatarConfig: { body: string; eyes: string; hat: string }
  coins: number
  email?: string | null
  inventory: InventoryItem[]
  isPremium: boolean
  premiumExpiresAt: string | null
}

export interface StoreItem {
  id: string
  type: 'avatar' | 'sound_pack' | 'frame' | 'avatar_part' | 'categoryUnlock' | 'categoryExpansion'
  name: string
  description: string
  price: number
  previewId: string
  premium?: boolean
}

export interface StoreSection {
  type: 'avatar' | 'sound_pack' | 'frame' | 'avatar_part' | 'categoryUnlock' | 'categoryExpansion'
  title: string
  description: string
  items: StoreItem[]
}

export interface HallOfFameEntry {
  id: string
  answerText: string
  questionText: string
  category: string
  voteCount: number
  playerName: string
  rank: number
}

export interface NotificationItem {
  id: string
  type: 'coins_earned'
  payload: { amount: number }
  read: boolean
  createdAt: string
}
