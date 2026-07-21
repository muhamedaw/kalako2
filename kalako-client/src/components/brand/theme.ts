export const COLORS = {
  bgStart: '#12071F',
  bgEnd: '#1B0E2E',
  primary: '#FF5DA2',
  secondary: '#7B5CFA',
  success: '#34E4EA',
  warning: '#FFB627',
  surface: 'rgba(255,255,255,0.06)',
  surfaceHover: 'rgba(255,255,255,0.10)',
  border: 'rgba(255,255,255,0.08)',
  text: '#FFFFFF',
  textMuted: '#E6DEFF',
  textDim: 'rgba(255,255,255,0.55)',
} as const

export const GRADIENTS = {
  bg: `linear-gradient(135deg, ${COLORS.bgStart} 0%, ${COLORS.bgEnd} 50%, ${COLORS.bgStart} 100%)`,
  pinkPurple: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
  purplePink: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.primary} 100%)`,
  bar: `linear-gradient(90deg, ${COLORS.primary} 0%, ${COLORS.secondary} 50%, ${COLORS.success} 100%)`,
} as const

export const SVG_FILTERS = {
  glowPink: 'url(#glowPink)',
  glowPurple: 'url(#glowPurple)',
  glowCyan: 'url(#glowCyan)',
  glowAmber: 'url(#glowAmber)',
  softBlob: 'url(#softBlob)',
}

export const AVATAR_CONFIGS = [
  { id: 1, skin: '#F2C9A5', hair: '#FF5DA2', accent: '#34E4EA' },
  { id: 2, skin: '#FDE2C4', hair: '#7B5CFA', accent: '#FFB627' },
  { id: 3, skin: '#E8C39E', hair: '#FFB627', accent: '#FF5DA2' },
  { id: 4, skin: '#D4A574', hair: '#34E4EA', accent: '#7B5CFA' },
  { id: 5, skin: '#F5D6B8', hair: '#FF5DA2', accent: '#34E4EA' },
  { id: 6, skin: '#C9956B', hair: '#7B5CFA', accent: '#FFB627' },
  { id: 7, skin: '#F2C9A5', hair: '#34E4EA', accent: '#FF5DA2' },
  { id: 8, skin: '#E0BB95', hair: '#FFB627', accent: '#7B5CFA' },
  { id: 9, skin: '#FDE2C4', hair: '#FF5DA2', accent: '#FFB627' },
  { id: 10, skin: '#D4A574', hair: '#7B5CFA', accent: '#34E4EA' },
  { id: 11, skin: '#E8C39E', hair: '#34E4EA', accent: '#FF5DA2' },
  { id: 12, skin: '#C9956B', hair: '#FFB627', accent: '#7B5CFA' },
  { id: 13, skin: '#F5D6B8', hair: '#FF5DA2', accent: '#34E4EA' },
  { id: 14, skin: '#F2C9A5', hair: '#7B5CFA', accent: '#FFB627' },
  { id: 15, skin: '#E0BB95', hair: '#34E4EA', accent: '#FF5DA2' },
  { id: 16, skin: '#D4A574', hair: '#FFB627', accent: '#7B5CFA' },
] as const

export type AvatarState = 'idle' | 'happy' | 'tricked'

export const CATEGORIES = [
  { id: 'celebrities', label: 'مشاهير', accent: COLORS.warning },
  { id: 'cooking', label: 'طبخ', accent: COLORS.primary },
  { id: 'films', label: 'أفلام', accent: COLORS.secondary },
  { id: 'geography', label: 'جغرافيا', accent: COLORS.success },
  { id: 'history', label: 'تاريخ', accent: COLORS.warning },
  { id: 'puzzles', label: 'ألغاز', accent: COLORS.primary },
  { id: 'science', label: 'علوم', accent: COLORS.success },
  { id: 'sports', label: 'رياضة', accent: COLORS.secondary },
] as const
