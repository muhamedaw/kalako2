export type BodyId = 'body_1' | 'body_2' | 'body_3' | 'body_4'
export type EyesId = 'eyes_1' | 'eyes_2' | 'eyes_3' | 'eyes_4' | 'eyes_5' | 'eyes_6' | 'eyes_7' | 'eyes_8'
export type HatId = 'hat_none' | 'hat_party' | 'hat_cap' | 'hat_headband' | 'hat_crown' | 'hat_tophat' | 'hat_wizard' | 'hat_propeller' | 'hat_sombrero' | 'hat_viking'

export const FREE_BODIES: BodyId[] = ['body_1', 'body_2', 'body_3', 'body_4']
export const FREE_EYES: EyesId[] = ['eyes_1', 'eyes_2', 'eyes_3', 'eyes_4']
export const PREMIUM_EYES: EyesId[] = ['eyes_5', 'eyes_6', 'eyes_7', 'eyes_8']
export const FREE_HATS: HatId[] = ['hat_none', 'hat_party', 'hat_cap', 'hat_headband']
export const PREMIUM_HATS: HatId[] = ['hat_crown', 'hat_tophat', 'hat_wizard', 'hat_propeller', 'hat_sombrero', 'hat_viking']

export interface AvatarConfig {
  body: BodyId
  eyes: EyesId
  hat: HatId
}

export const DEFAULT_AVATAR: AvatarConfig = {
  body: 'body_1',
  eyes: 'eyes_1',
  hat: 'hat_none',
}

export const BODY_COLORS: Record<BodyId, string> = {
  body_1: '#3A2143',
  body_2: '#FF6B35',
  body_3: '#C6FF3D',
  body_4: '#F5EDE4',
}

export const BODY_NAMES: Record<BodyId, string> = {
  body_1: 'Plum Puff',
  body_2: 'Coral Cutie',
  body_3: 'Lime Chunk',
  body_4: 'Cream Dream',
}
