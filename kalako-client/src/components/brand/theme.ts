export const COLORS = {
  bgStart: '#241528',
  bgEnd: '#3A2143',
  primary: '#FF6B35',
  secondary: '#C6FF3D',
  success: '#FF6B35',
  warning: '#FF6B35',
  surface: '#3A2143',
  surfaceHover: '#4A2D53',
  border: '#0A0A0A',
  text: '#F5EDE4',
  textMuted: 'rgba(245,237,228,0.65)',
  textDim: 'rgba(245,237,228,0.45)',
  accentPink: '#FF4081',
  accentLime: '#C6FF3D',
} as const

export const GRADIENTS = {
  bg: `linear-gradient(135deg, ${COLORS.bgStart} 0%, ${COLORS.bgEnd} 100%)`,
  accent: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.accentPink} 100%)`,
  accentReverse: `linear-gradient(135deg, ${COLORS.accentPink} 0%, ${COLORS.primary} 100%)`,
  bar: `linear-gradient(90deg, ${COLORS.primary} 0%, ${COLORS.accentPink} 100%)`,
} as const

export const SVG_FILTERS = {
  glowCoral: 'url(#glowCoral)',
  glowLime: 'url(#glowLime)',
  glowGold: 'url(#glowGold)',
  softBlob: 'url(#softBlob)',
}

export const CATEGORIES = [
  { id: 'celebrities', label: 'مشاهير', accent: COLORS.primary },
  { id: 'cooking', label: 'طبخ', accent: COLORS.accentLime },
  { id: 'films', label: 'أفلام', accent: COLORS.accentPink },
  { id: 'geography', label: 'جغرافيا', accent: COLORS.primary },
  { id: 'history', label: 'تاريخ', accent: COLORS.primary },
  { id: 'puzzles', label: 'ألغاز', accent: COLORS.accentLime },
  { id: 'science', label: 'علوم', accent: COLORS.accentPink },
  { id: 'sports', label: 'رياضة', accent: COLORS.primary },
] as const
