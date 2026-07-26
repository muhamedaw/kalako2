import type { ComponentType } from 'react'
import type { BodyId, EyesId, HatId } from './types'
import Body1 from './bodies/Body1'
import Body2 from './bodies/Body2'
import Body3 from './bodies/Body3'
import Body4 from './bodies/Body4'
import Eyes1 from './eyes/Eyes1'
import Eyes2 from './eyes/Eyes2'
import Eyes3 from './eyes/Eyes3'
import Eyes4 from './eyes/Eyes4'
import Eyes5 from './eyes/Eyes5'
import Eyes6 from './eyes/Eyes6'
import Eyes7 from './eyes/Eyes7'
import Eyes8 from './eyes/Eyes8'
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

const BODY_MAP: Record<BodyId, ComponentType<{ size?: number; className?: string }>> = {
  body_1: Body1,
  body_2: Body2,
  body_3: Body3,
  body_4: Body4,
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
