export type BodyId = 'body_1' | 'body_2' | 'body_3' | 'body_4'
  | 'body_5' | 'body_6' | 'body_7' | 'body_8' | 'body_9' | 'body_10' | 'body_11' | 'body_12' | 'body_13' | 'body_14'
export type EyesId = 'eyes_1' | 'eyes_2' | 'eyes_3' | 'eyes_4' | 'eyes_5' | 'eyes_6' | 'eyes_7' | 'eyes_8'
  | 'eyes_9' | 'eyes_10' | 'eyes_11' | 'eyes_12' | 'eyes_13' | 'eyes_14' | 'eyes_15' | 'eyes_16' | 'eyes_17' | 'eyes_18'
export type HatId = 'hat_none' | 'hat_party' | 'hat_cap' | 'hat_headband' | 'hat_crown' | 'hat_tophat' | 'hat_wizard' | 'hat_propeller' | 'hat_sombrero' | 'hat_viking'
  | 'hat_beret' | 'hat_cowboy' | 'hat_hood' | 'hat_bandana' | 'hat_helmet' | 'hat_fez' | 'hat_flower' | 'hat_antenna' | 'hat_crown_flower' | 'hat_headwrap'

// The 10 new bodies (body_5-14), 10 new eyes (eyes_9-18), and 10 new hats below are
// all FREE — no coin gating, no premium lock. Only the original eyes_5-8/hat_crown-etc.
// set stay premium (see PREMIUM_EYES/PREMIUM_HATS).
export const FREE_BODIES: BodyId[] = ['body_1', 'body_2', 'body_3', 'body_4', 'body_5', 'body_6', 'body_7', 'body_8', 'body_9', 'body_10', 'body_11', 'body_12', 'body_13', 'body_14']
export const FREE_EYES: EyesId[] = ['eyes_1', 'eyes_2', 'eyes_3', 'eyes_4', 'eyes_9', 'eyes_10', 'eyes_11', 'eyes_12', 'eyes_13', 'eyes_14', 'eyes_15', 'eyes_16', 'eyes_17', 'eyes_18']
export const PREMIUM_EYES: EyesId[] = ['eyes_5', 'eyes_6', 'eyes_7', 'eyes_8']
export const FREE_HATS: HatId[] = ['hat_none', 'hat_party', 'hat_cap', 'hat_headband', 'hat_beret', 'hat_cowboy', 'hat_hood', 'hat_bandana', 'hat_helmet', 'hat_fez', 'hat_flower', 'hat_antenna', 'hat_crown_flower', 'hat_headwrap']
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
  body_5: '#3DDC97',
  body_6: '#B39DDB',
  body_7: '#FFB48A',
  body_8: '#2EC4B6',
  body_9: '#FF8FA3',
  body_10: '#FFC94D',
  body_11: '#9CAF88',
  body_12: '#E8607D',
  body_13: '#7EC8E3',
  body_14: '#8B5E3C',
}

export const BODY_NAMES: Record<BodyId, string> = {
  body_1: 'Plum Puff',
  body_2: 'Coral Cutie',
  body_3: 'Lime Chunk',
  body_4: 'Cream Dream',
  body_5: 'Mint Munch',
  body_6: 'Lilac Bop',
  body_7: 'Peach Smirk',
  body_8: 'Teal Boop',
  body_9: 'Blush Plop',
  body_10: 'Amber Nudge',
  body_11: 'Sage Wink',
  body_12: 'Rose Bump',
  body_13: 'Sky Doodle',
  body_14: 'Cocoa Bounce',
}

// Display names for eyes/hats — previously these fell back to the raw id (e.g. "eyes 9",
// "beret") in ProfileScreen. Adding real names here for all ids, old and new, matching the
// existing BODY_NAMES pattern (and the i18n avatarEyesXX/avatarHatXxx keys' English source).
export const EYES_NAMES: Record<EyesId, string> = {
  eyes_1: 'Round Blink',
  eyes_2: 'Wide Wonder',
  eyes_3: 'Sleepy Squint',
  eyes_4: 'Big Sparkle',
  eyes_5: 'Heart Eyes',
  eyes_6: 'Star Eyes',
  eyes_7: 'Fire Eyes',
  eyes_8: 'Spiral Eyes',
  eyes_9: 'Star Gaze',
  eyes_10: 'Dreamy Drop',
  eyes_11: 'Pixel Peep',
  eyes_12: 'Moon Peek',
  eyes_13: 'Fizzy Blink',
  eyes_14: 'Neon Squint',
  eyes_15: 'Cosmic Stare',
  eyes_16: 'Jelly Glint',
  eyes_17: 'Vapor Drift',
  eyes_18: 'Spark Dart',
}

export const HAT_NAMES: Record<HatId, string> = {
  hat_none: 'No Hat',
  hat_party: 'Party Hat',
  hat_cap: 'Cap',
  hat_headband: 'Headband',
  hat_crown: 'Crown',
  hat_tophat: 'Top Hat',
  hat_wizard: 'Wizard Hat',
  hat_propeller: 'Propeller Beanie',
  hat_sombrero: 'Sombrero',
  hat_viking: 'Viking Helmet',
  hat_beret: 'Beret Babe',
  hat_cowboy: 'Cowboy Cutie',
  hat_hood: 'Cozy Hood',
  hat_bandana: 'Bandana Buddy',
  hat_helmet: 'Safety first!',
  hat_fez: 'Fez Fella',
  hat_flower: 'Bloom Top',
  hat_antenna: 'Signal Boost',
  hat_crown_flower: 'Petal Crown',
  hat_headwrap: 'Wrap Star',
}
