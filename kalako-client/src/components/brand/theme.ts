export const COLORS = {
  bgStart: '#1E60FF',
  bgEnd: '#2B6FFF',
  primary: '#FFD400',
  secondary: '#3B7FFF',
  success: '#10B981',
  warning: '#F59E0B',
  surface: '#2B6FFF',
  surfaceHover: '#3B7FFF',
  border: '#0A0A0A',
  text: '#FFFFFF',
  textMuted: 'rgba(255,255,255,0.65)',
  textDim: 'rgba(255,255,255,0.45)',
} as const

export const GRADIENTS = {
  bg: `linear-gradient(135deg, ${COLORS.bgStart} 0%, ${COLORS.bgStart} 50%, ${COLORS.bgStart} 100%)`,
  teal: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.warning} 100%)`,
  tealReverse: `linear-gradient(135deg, ${COLORS.warning} 0%, ${COLORS.primary} 100%)`,
  bar: `linear-gradient(90deg, ${COLORS.primary} 0%, ${COLORS.warning} 100%)`,
} as const

export const SVG_FILTERS = {
  glowTeal: 'url(#glowTeal)',
  glowMuted: 'url(#glowMuted)',
  glowWhite: 'url(#glowWhite)',
  softBlob: 'url(#softBlob)',
}

export const AVATAR_CONFIGS = [
  { id: 1, skin: '#F2C9A5', hair: '#FFD400', accent: '#3B7FFF' },
  { id: 2, skin: '#FDE2C4', hair: '#3B7FFF', accent: '#FFD400' },
  { id: 3, skin: '#E8C39E', hair: '#1E60FF', accent: '#FFD400' },
  { id: 4, skin: '#D4A574', hair: '#FFD400', accent: '#3B7FFF' },
  { id: 5, skin: '#F5D6B8', hair: '#10B981', accent: '#FFD400' },
  { id: 6, skin: '#C9956B', hair: '#3B7FFF', accent: '#1E60FF' },
  { id: 7, skin: '#F2C9A5', hair: '#FFD400', accent: '#10B981' },
  { id: 8, skin: '#E0BB95', hair: '#1E60FF', accent: '#3B7FFF' },
  { id: 9, skin: '#FDE2C4', hair: '#FFD400', accent: '#3B7FFF' },
  { id: 10, skin: '#D4A574', hair: '#3B7FFF', accent: '#FFD400' },
  { id: 11, skin: '#E8C39E', hair: '#FFD400', accent: '#3B7FFF' },
  { id: 12, skin: '#C9956B', hair: '#3B7FFF', accent: '#1E60FF' },
  { id: 13, skin: '#F5D6B8', hair: '#1E60FF', accent: '#FFD400' },
  { id: 14, skin: '#F2C9A5', hair: '#FFD400', accent: '#3B7FFF' },
  { id: 15, skin: '#E0BB95', hair: '#3B7FFF', accent: '#FFD400' },
  { id: 16, skin: '#D4A574', hair: '#FFD400', accent: '#3B7FFF' },
] as const

export type AvatarState = 'idle' | 'happy' | 'tricked'

export const CATEGORIES = [
  { id: 'celebrities', label: 'مشاهير', accent: COLORS.secondary },
  { id: 'cooking', label: 'طبخ', accent: COLORS.primary },
  { id: 'films', label: 'أفلام', accent: COLORS.secondary },
  { id: 'geography', label: 'جغرافيا', accent: COLORS.primary },
  { id: 'history', label: 'تاريخ', accent: COLORS.secondary },
  { id: 'puzzles', label: 'ألغاز', accent: COLORS.primary },
  { id: 'science', label: 'علوم', accent: COLORS.secondary },
  { id: 'sports', label: 'رياضة', accent: COLORS.primary },
] as const
