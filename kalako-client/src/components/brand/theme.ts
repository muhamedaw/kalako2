export const COLORS = {
  bgStart: '#0B0C10',
  bgEnd: '#1F2833',
  primary: '#66FCF1',
  secondary: '#45A29E',
  success: '#34E4EA',
  warning: '#FFB627',
  surface: '#1F2833',
  surfaceHover: '#2A3442',
  border: '#45A29E',
  text: '#C5C6C7',
  textMuted: '#A8B2B9',
  textDim: 'rgba(255,255,255,0.45)',
} as const

export const GRADIENTS = {
  bg: `linear-gradient(135deg, ${COLORS.bgStart} 0%, #0B0C10 50%, ${COLORS.bgStart} 100%)`,
  teal: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
  tealReverse: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.primary} 100%)`,
  bar: `linear-gradient(90deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
} as const

export const SVG_FILTERS = {
  glowTeal: 'url(#glowTeal)',
  glowMuted: 'url(#glowMuted)',
  glowWhite: 'url(#glowWhite)',
  softBlob: 'url(#softBlob)',
}

export const AVATAR_CONFIGS = [
  { id: 1, skin: '#F2C9A5', hair: '#66FCF1', accent: '#45A29E' },
  { id: 2, skin: '#FDE2C4', hair: '#45A29E', accent: '#66FCF1' },
  { id: 3, skin: '#E8C39E', hair: '#3A7A76', accent: '#66FCF1' },
  { id: 4, skin: '#D4A574', hair: '#5A7B7A', accent: '#45A29E' },
  { id: 5, skin: '#F5D6B8', hair: '#66FCF1', accent: '#45A29E' },
  { id: 6, skin: '#C9956B', hair: '#45A29E', accent: '#3A7A76' },
  { id: 7, skin: '#F2C9A5', hair: '#5A7B7A', accent: '#66FCF1' },
  { id: 8, skin: '#E0BB95', hair: '#3A7A76', accent: '#45A29E' },
  { id: 9, skin: '#FDE2C4', hair: '#66FCF1', accent: '#45A29E' },
  { id: 10, skin: '#D4A574', hair: '#45A29E', accent: '#66FCF1' },
  { id: 11, skin: '#E8C39E', hair: '#66FCF1', accent: '#45A29E' },
  { id: 12, skin: '#C9956B', hair: '#45A29E', accent: '#5A7B7A' },
  { id: 13, skin: '#F5D6B8', hair: '#3A7A76', accent: '#66FCF1' },
  { id: 14, skin: '#F2C9A5', hair: '#66FCF1', accent: '#45A29E' },
  { id: 15, skin: '#E0BB95', hair: '#45A29E', accent: '#66FCF1' },
  { id: 16, skin: '#D4A574', hair: '#66FCF1', accent: '#45A29E' },
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
