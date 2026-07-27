import type { ComponentType } from 'react'
import type { BodyId, EyesId, HatId } from './types'
import Body1 from './bodies/Body1'
import Body2 from './bodies/Body2'
import Body3 from './bodies/Body3'
import Body4 from './bodies/Body4'
import Body5 from './bodies/Body5'
import Body6 from './bodies/Body6'
import Body7 from './bodies/Body7'
import Body8 from './bodies/Body8'
import Body9 from './bodies/Body9'
import Body10 from './bodies/Body10'
import Body11 from './bodies/Body11'
import Body12 from './bodies/Body12'
import Body13 from './bodies/Body13'
import Body14 from './bodies/Body14'
import Eyes1 from './eyes/Eyes1'
import Eyes2 from './eyes/Eyes2'
import Eyes3 from './eyes/Eyes3'
import Eyes4 from './eyes/Eyes4'
import Eyes5 from './eyes/Eyes5'
import Eyes6 from './eyes/Eyes6'
import Eyes7 from './eyes/Eyes7'
import Eyes8 from './eyes/Eyes8'
import Eyes9 from './eyes/Eyes9'
import Eyes10 from './eyes/Eyes10'
import Eyes11 from './eyes/Eyes11'
import Eyes12 from './eyes/Eyes12'
import Eyes13 from './eyes/Eyes13'
import Eyes14 from './eyes/Eyes14'
import Eyes15 from './eyes/Eyes15'
import Eyes16 from './eyes/Eyes16'
import Eyes17 from './eyes/Eyes17'
import Eyes18 from './eyes/Eyes18'
import HatNone from './hats/HatNone'
import HatParty from './hats/HatParty'
import HatCap from './hats/HatCap'
import HatHeadband from './hats/HatHeadband'
import HatCrown from './hats/HatCrown'
import HatTophat from './hats/HatTophat'
import HatWizard from './hats/HatWizard'
import HatPropeller from './hats/HatPropeller'
import HatSombrero from './hats/HatSombrero'
import HatViking from './hats/HatViking'
import HatBeret from './hats/HatBeret'
import HatCowboy from './hats/HatCowboy'
import HatHood from './hats/HatHood'
import HatBandana from './hats/HatBandana'
import HatHelmet from './hats/HatHelmet'
import HatFez from './hats/HatFez'
import HatFlower from './hats/HatFlower'
import HatAntenna from './hats/HatAntenna'
import HatCrownFlower from './hats/HatCrownFlower'
import HatHeadwrap from './hats/HatHeadwrap'

const BODY_MAP: Record<BodyId, ComponentType<{ size?: number; className?: string }>> = {
  body_1: Body1,
  body_2: Body2,
  body_3: Body3,
  body_4: Body4,
  body_5: Body5,
  body_6: Body6,
  body_7: Body7,
  body_8: Body8,
  body_9: Body9,
  body_10: Body10,
  body_11: Body11,
  body_12: Body12,
  body_13: Body13,
  body_14: Body14,
}

const EYES_MAP: Record<EyesId, ComponentType<{ size?: number; className?: string }>> = {
  eyes_1: Eyes1,
  eyes_2: Eyes2,
  eyes_3: Eyes3,
  eyes_4: Eyes4,
  eyes_5: Eyes5,
  eyes_6: Eyes6,
  eyes_7: Eyes7,
  eyes_8: Eyes8,
  eyes_9: Eyes9,
  eyes_10: Eyes10,
  eyes_11: Eyes11,
  eyes_12: Eyes12,
  eyes_13: Eyes13,
  eyes_14: Eyes14,
  eyes_15: Eyes15,
  eyes_16: Eyes16,
  eyes_17: Eyes17,
  eyes_18: Eyes18,
}

const HAT_MAP: Record<HatId, ComponentType<{ size?: number; className?: string }>> = {
  hat_none: HatNone,
  hat_party: HatParty,
  hat_cap: HatCap,
  hat_headband: HatHeadband,
  hat_crown: HatCrown,
  hat_tophat: HatTophat,
  hat_wizard: HatWizard,
  hat_propeller: HatPropeller,
  hat_sombrero: HatSombrero,
  hat_viking: HatViking,
  hat_beret: HatBeret,
  hat_cowboy: HatCowboy,
  hat_hood: HatHood,
  hat_bandana: HatBandana,
  hat_helmet: HatHelmet,
  hat_fez: HatFez,
  hat_flower: HatFlower,
  hat_antenna: HatAntenna,
  hat_crown_flower: HatCrownFlower,
  hat_headwrap: HatHeadwrap,
}

interface Props {
  body: BodyId
  eyes: EyesId
  hat: HatId
  size?: number
  className?: string
}

export default function ComposedAvatar({ body, eyes, hat, size = 720, className }: Props) {
  const Body = BODY_MAP[body]
  const Eyes = EYES_MAP[eyes]
  const Hat = HAT_MAP[hat]
  if (!Body || !Eyes || !Hat) return null

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 720 720"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`Composed avatar ${body} ${eyes} ${hat}`}
    >
      <Body />
      <Eyes />
      <Hat />
    </svg>
  )
}
