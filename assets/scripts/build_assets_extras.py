"""
build_assets_extras.py — Round-2 Neon Party asset factories for "تحدي الإجابات".

Sibling to build_assets.py. Reuses palette, defs, face/eye/mouth/hair/accessory
helpers and AVATAR_CONFIGS from build_assets so visual language stays identical.

Outputs (all under assets/svg/):
    avatars-state/  avatar-{01..16}-{normal,happy,fooled}.svg   (animated)
    og/og-image.svg                                           (1200x630)
    share-card/result-card.svg                                (1080x1920)
    pwa/{favicon-16,favicon-32,apple-touch-180,android-512,android-192,maskable-512}.svg
    categories/{sports,history,geography,films,science,celebrities,cooking,puzzles}.svg
    splash/splash.svg                                         (1080x1920)

Run:
    python assets/scripts/build_assets_extras.py
"""

from __future__ import annotations

from pathlib import Path
import sys

# Windows cp1252 hardening
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

# Reuse palette + helpers from round-1 script.
sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_assets import (
    BG_DEEP, BG_MID, BG_ELEV,
    NEON_PINK, NEON_PURPLE, NEON_CYAN, NEON_AMBER,
    WHITE, WHITE_SOFT,
    FONT_STACK,
    AVATAR_CONFIGS,
    defs, font_face,
    _face_block, _eye, _eyes, _mouth, _hair, _hijab, _accessory, _hat,
)

ROOT = Path(__file__).resolve().parents[1]
SVG  = ROOT / "svg"
(SVG / "avatars-state").mkdir(parents=True, exist_ok=True)
(SVG / "og").mkdir(parents=True, exist_ok=True)
(SVG / "share-card").mkdir(parents=True, exist_ok=True)
(SVG / "pwa").mkdir(parents=True, exist_ok=True)
(SVG / "categories").mkdir(parents=True, exist_ok=True)
(SVG / "splash").mkdir(parents=True, exist_ok=True)


def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.strip() + "\n", encoding="utf-8")
    print(f"  wrote  {path.relative_to(ROOT)}  ({len(content)} bytes)")


# ═════════════════════════════════════════════════════════════════════════════
# 1. ANIMATED 3-STATE AVATARS — normal / happy / fooled (CSS @keyframes)
# ═════════════════════════════════════════════════════════════════════════════

# A state bag per mood — keeps the three avatar variants visually coherent.
STATE_BAGS = {
    "normal": {
        "expr":     "smirk",
        "ring":     "accent",
        "halo":     "",
        "anim":     "bob",
        "dur":      "2s",
        "shadow":   "",
    },
    "happy": {
        "expr":     "laugh",
        "ring":     NEON_CYAN,
        "halo":     "sparkle",
        "anim":     "hop",
        "dur":      "0.55s",
        "shadow":   "cyan",
    },
    "fooled": {
        "expr":     "surprised",
        "ring":     NEON_AMBER,
        "halo":     "stun",
        "anim":     "shake",
        "dur":      "0.18s",
        "shadow":   "amber",
    },
}

def _sparkles_halo(cx=360, cy=370, r=180) -> str:
    """Four cyan plus-sign sparkles parked around the head for the happy state."""
    ptops = []
    coords = [
        (cx - r - 30, cy - r + 30),
        (cx + r + 30, cy - r + 30),
        (cx - r - 20, cy + r + 40),
        (cx + r + 20, cy + r + 40),
    ]
    for x, y in coords:
        ptops.append(
            f'<g transform="translate({x},{y})" filter="url(#glowCyan)" '
            f'class="sparkle">'
            f'<rect x="-2" y="-14" width="4" height="28" rx="2" fill="{NEON_CYAN}"/>'
            f'<rect x="-14" y="-2" width="28" height="4" rx="2" fill="{NEON_CYAN}"/>'
            f'<circle cx="0" cy="0" r="3" fill="{WHITE}"/>'
            f'</g>'
        )
    return "\n  ".join(ptops)

def _stun_halo(cx=360, cy=370, r=180) -> str:
    """Three amber lightning bolts + a dizzy star cluster = classic 'I was fooled'."""
    bolts = []
    # Big thunder-bolt left
    bolts.append(
        f'<path d="M{cx-200},{cy-110} L{cx-170},{cy-150} L{cx-185},{cy-110} '
        f'L{cx-155},{cy-160} L{cx-200},{cy-80} L{cx-185},{cy-115} L{cx-205},{cy-115} Z" '
        f'fill="{NEON_AMBER}" stroke="{WHITE}" stroke-width="2" stroke-linejoin="round" '
        f'filter="url(#glowAmber)" class="bolt b1"/>'
    )
    # Smaller bolt right
    bolts.append(
        f'<path d="M{cx+165},{cy-180} L{cx+195},{cy-220} L{cx+180},{cy-185} '
        f'L{cx+210},{cy-230} L{cx+165},{cy-150} L{cx+180},{cy-185} L{cx+160},{cy-185} Z" '
        f'fill="{NEON_AMBER}" stroke="{WHITE}" stroke-width="2" stroke-linejoin="round" '
        f'filter="url(#glowAmber)" class="bolt b2"/>'
    )
    # Dizzy stars at the very top of head
    bolts.append(
        f'<g transform="translate({cx},{cy-220})" filter="url(#glowAmber)" class="dizzy">'
        f'<circle cx="-22" cy="0" r="4" fill="{WHITE}"/>'
        f'<circle cx="22"  cy="0" r="4" fill="{WHITE}"/>'
        f'<rect x="-3" y="-15" width="6" height="14" rx="2" fill="{NEON_AMBER}"/>'
        f'<rect x="-3" y="2"   width="6" height="14" rx="2" fill="{NEON_AMBER}"/>'
        f'<rect x="-15" y="-3" width="14" height="6" rx="2" fill="{NEON_AMBER}"/>'
        f'<rect x="2"   y="-3" width="14" height="6" rx="2" fill="{NEON_AMBER}"/>'
        f'</g>'
    )
    return "\n  ".join(bolts)

def avatar_state_svg(avatar_cfg, state: str) -> str:
    avatar_id, hair, style_, skin, accent, _orig_expr, acc, hat, gender = avatar_cfg
    bag = STATE_BAGS[state]
    cx, cy, r = 360, 360, 180

    ring_color = accent if bag["ring"] == "accent" else bag["ring"]
    ring_glow  = "glowCyan" if ring_color == NEON_CYAN else \
                 "glowAmber" if ring_color == NEON_AMBER else "glowPurple"
    if state == "normal":
        ring_glow = "glowPurple"

    bg = (
        f'<circle cx="{cx}" cy="{cy+10}" r="{r+18}" fill="none" '
        f'stroke="{ring_color}" stroke-width="6" opacity="0.9" filter="url(#{ring_glow})"/>'
    )

    if style_ == "hijab":
        hair_back = _hijab(hair, cx)
    else:
        hair_back = _hair(style_, hair, cx)
    face  = _face_block(cx, cy, r, skin=skin)
    eyes_ = _eyes(bag["expr"], cx)
    mouth_= _mouth(bag["expr"], cx)
    acc_  = _accessory(acc, accent) if state == "normal" else \
            _accessory(acc, ring_color) if acc in ("headphones","headband","earphones","earbuds") else _accessory(acc, accent)
    hat_  = _hat(hat, cx) if hat else ""

    halo = ""
    if bag["halo"] == "sparkle":
        halo = _sparkles_halo(cx, cy, r)
    elif bag["halo"] == "stun":
        halo = _stun_halo(cx, cy, r)

    # Per-state animation grammar — locked in spec
    if state == "normal":
        anim = """
  @keyframes bob {
    0%,100% { transform: translate(0,0); }
    50%     { transform: translate(0,-4px); }
  }
  .avatar-body { animation: bob 2s ease-in-out infinite alternate;
                 transform-box: fill-box; transform-origin: center; }
  .ring { animation: pulseRing 2.4s ease-in-out infinite alternate; }
  @keyframes pulseRing {
    0%,100% { stroke-opacity: 0.85; }
    50%     { stroke-opacity: 1; }
  }"""
    elif state == "happy":
        anim = """
  @keyframes hop {
    0%,100% { transform: translate(0,0); }
    20%     { transform: translate(0,-22px) scale(1.04,0.96); }
    40%     { transform: translate(0,0)    scale(0.98,1.02); }
    60%     { transform: translate(0,-10px) scale(1.02,0.98); }
    80%     { transform: translate(0,0); }
  }
  .avatar-body { animation: hop 1.1s cubic-bezier(.5,1.6,.4,1) infinite;
                 transform-box: fill-box; transform-origin: center; }
  @keyframes twinkleS { 0%,100% { opacity:0.3 } 50% { opacity:1 } }
  .sparkle { animation: twinkleS 0.7s ease-in-out infinite; }
  .sparkle:nth-child(2) { animation-delay: 0.18s; }
  .sparkle:nth-child(3) { animation-delay: 0.36s; }
  .sparkle:nth-child(4) { animation-delay: 0.54s; }"""
    else:  # fooled
        anim = """
  @keyframes shake {
    0%,100% { transform: translate(0,0); }
    20%     { transform: translate(-6px, -2px) rotate(-3deg); }
    40%     { transform: translate( 5px,  3px) rotate( 3deg); }
    60%     { transform: translate(-4px,  1px) rotate(-2deg); }
    80%     { transform: translate( 4px, -2px) rotate( 2deg); }
  }
  .avatar-body { animation: shake 0.7s linear infinite;
                 transform-box: fill-box; transform-origin: center; }
  @keyframes flash { 0%,100% { opacity:0.5 } 50% { opacity:1 } }
  .bolt { animation: flash 0.4s ease-in-out infinite; }
  .bolt.b1 { animation-delay: 0.0s; }
  .bolt.b2 { animation-delay: 0.2s; }
  @keyframes spinSlow { to { transform: translate({cx}px,{cy-220}px) rotate(360deg); } }
  .dizzy   { animation: spinSlow 1.6s linear infinite;
             transform-box: fill-box; transform-origin: center; }"""

    style_block = f"""<style>
{anim}
  </style>"""

    return f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" role="img"
     aria-label="تحدي الإجابات player avatar {avatar_id} — {state} state">
{style_block}
{defs()}
{halo}
<g class="avatar-body">
{bg.replace('stroke-width="6"', 'class="ring" stroke-width="6"')}
{hair_back}
{face}
{eyes_}
{mouth_}
{acc_}
{hat_}
</g>
</svg>
"""


# ═════════════════════════════════════════════════════════════════════════════
# 2. OG SHARE IMAGE — 1200×630, brand-strict, dashed room-code slot
# ═════════════════════════════════════════════════════════════════════════════

def og_image_svg() -> str:
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" role="img"
     aria-label="تحدي الإجابات — invite preview">
{font_face()}
{defs(extra="""
    <linearGradient id="gradCode" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#1B0E2E"/>
      <stop offset="100%" stop-color="#2A1758"/>
    </linearGradient>
    <pattern id="diagStripe" patternUnits="userSpaceOnUse" width="14" height="14"
             patternTransform="rotate(45)">
      <rect width="7" height="14" fill="#FF5DA2" opacity="0.55"/>
      <rect x="7" width="7" height="14" fill="#7B5CFA" opacity="0.0"/>
    </pattern>
""")}
  <!-- Strict safe zone 100..1100 x, 65..565 y -->
  <rect x="0" y="0" width="1200" height="630" fill="url(#gradBg)"/>
  <!-- Corner neon blobs (low density — OG doesn't carry the full lobby mood) -->
  <g filter="url(#softBlob)" opacity="0.55">
    <ellipse cx="160"  cy="100" rx="220" ry="160" fill="{NEON_PINK}"/>
    <ellipse cx="1080" cy="540" rx="240" ry="180" fill="{NEON_PURPLE}"/>
    <ellipse cx="980"  cy="90"  rx="160" ry="120" fill="{NEON_CYAN}"/>
  </g>
  <!-- Subtle grid -->
  <g opacity="0.05" stroke="{WHITE}" stroke-width="1">
    {''.join(f'<line x1="0" y1="{y}" x2="1200" y2="{y}"/>' for y in range(80, 630, 80))}
    {''.join(f'<line x1="{x}" y1="0" x2="{x}" y2="630"/>' for x in range(80, 1200, 80))}
  </g>

  <!-- LEFT: brand mark + headline -------------------------------------------- -->
  <g transform="translate(80,180)" filter="url(#glowPink)">
    <rect x="0" y="0" width="180" height="180" rx="34" ry="34"
          fill="url(#gradPurplePink)" stroke="{NEON_PINK}" stroke-width="2"/>
    <rect x="8" y="8" width="164" height="164" rx="26" ry="26"
          fill="none" stroke="{WHITE}" stroke-opacity="0.14"/>
    <text x="90" y="128" text-anchor="middle" font-family="{FONT_STACK}"
          font-weight="900" font-size="135" fill="{WHITE}" letter-spacing="-4">؟</text>
  </g>
  <g transform="translate(120,80)" filter="url(#glowAmber)">
    <path d="M0,30 L14,0 L28,22 L42,0 L56,30 Z M0,30 L56,30 L56,38 L0,38 Z"
          fill="{NEON_AMBER}" stroke="{WHITE}" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="14" cy="0"  r="4" fill="{NEON_PINK}"/>
    <circle cx="28" cy="14" r="3" fill="{NEON_CYAN}"/>
    <circle cx="42" cy="0"  r="4" fill="{NEON_PURPLE}"/>
  </g>

  <g filter="url(#glowPink)">
    <text x="80" y="420" font-family="{FONT_STACK}" font-weight="900"
          font-size="86" fill="url(#gradPinkPurple)" letter-spacing="-2">تحدي الإجابات</text>
  </g>
  <text x="80" y="476" font-family="{FONT_STACK}" font-weight="600"
        font-size="28" fill="{WHITE_SOFT}" opacity="0.85">لعبة خداع جماعية • ادعُ ربعك!</text>
  <rect x="80" y="510" width="120" height="6" rx="3" fill="{NEON_CYAN}" filter="url(#glowCyan)"/>
  <rect x="210" y="510" width="60"  height="6" rx="3" fill="{NEON_PINK}" opacity="0.7"/>

  <!-- RIGHT: dashed empty room-code slot ------------------------------------- -->
  <g transform="translate(640,180)">
    <text x="0" y="0" font-family="{FONT_STACK}" font-weight="900"
          font-size="34" fill="{NEON_AMBER}" filter="url(#glowAmber)">كود الغرفة</text>

    <!-- dashed pink-purple rect — strictly the rectangle where the JS layer
         inside React will inject the live room code at copy-invite time.        -->
    <g filter="url(#glowPink)">
      <rect x="0" y="30" width="480" height="200" rx="28" ry="28"
            fill="url(#gradCode)" stroke="{NEON_PINK}" stroke-width="3"
            stroke-dasharray="14 10"/>
    </g>
    <!-- subtle hatched overlay so the slot is visibly empty even at thumbnail size -->
    <rect x="14" y="44" width="452" height="172" rx="20" ry="20"
          fill="url(#diagStripe)" opacity="0.08"/>
    <!-- placeholder dashes (a visible "------" the front-end will overwrite) -->
    <text x="240" y="155" text-anchor="middle" font-family="{FONT_STACK}"
          font-weight="900" font-size="84" fill="{WHITE}" opacity="0.45"
          letter-spacing="6">------</text>

    <!-- url line where the invite link is crudely shown -->
    <text x="0" y="278" font-family="{FONT_STACK}" font-weight="700"
          font-size="22" fill="{WHITE_SOFT}" opacity="0.9">kalako.app/join</text>
    <g filter="url(#glowCyan)">
      <rect x="0" y="295" width="160" height="5" rx="2.5" fill="{NEON_CYAN}"/>
    </g>
    <rect x="170" y="295" width="80"  height="5" rx="2.5" fill="{NEON_PINK}" opacity="0.7"/>
  </g>

  <!-- bottom glitter -->
  <circle cx="60"   cy="600" r="4" fill="{NEON_CYAN}"  filter="url(#glowCyan)"/>
  <circle cx="1130" cy="50"  r="4" fill="{NEON_PINK}"  filter="url(#glowPink)"/>
  <circle cx="110"  cy="55"  r="3" fill="{WHITE}"      opacity="0.85"/>
  <circle cx="1110" cy="600" r="3" fill="{NEON_AMBER}" filter="url(#glowAmber)"/>
</svg>
"""


# ═════════════════════════════════════════════════════════════════════════════
# 3. RESULTS SHARE CARD — 1080×1920 transparent frame, exact empty zones
# ═════════════════════════════════════════════════════════════════════════════

def result_card_svg() -> str:
    """Transparent canvas — the React UI overlays player name + score via
    html-to-image. The <g id="safe-zones"> layer is documentation only —
    the design-time guides are NOT rendered into the exported PNG."""
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" role="img"
     aria-label="تحدي الإجابات — results share card frame">
{font_face()}
{defs(extra="""
    <linearGradient id="gradFrame" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"  stop-color="#FF5DA2"/>
      <stop offset="50%" stop-color="#7B5CFA"/>
      <stop offset="100%" stop-color="#34E4EA"/>
    </linearGradient>
    <linearGradient id="gradCrownRibbon" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"  stop-color="#FFB627"/>
      <stop offset="100%" stop-color="#FF5DA2"/>
    </linearGradient>
""")}
  <!-- Outer transparent rounded frame — rx=28 = --r-xl design token             -->
  <rect x="40" y="40" width="1000" height="1840" rx="28" ry="28"
        fill="none" stroke="url(#gradFrame)" stroke-width="12"
        filter="url(#glowPink)"/>
  <!-- Inner thin lavender hairline -->
  <rect x="78" y="78" width="924" height="1764" rx="20" ry="20"
        fill="none" stroke="#E6DEFF" stroke-opacity="0.30" stroke-width="2"
        stroke-dasharray="6 8"/>

  <!-- Crown ribbon strip at the top (decorative, always visible)             -->
  <g transform="translate(0,40)">
    <rect x="200" y="60" width="680" height="120" rx="20"
          fill="url(#gradCrownRibbon)" filter="url(#glowAmber)"
          stroke="#FFFFFF" stroke-width="3"/>
    <g transform="translate(540,80)" filter="url(#glowPink)">
      <path d="M-90,28 L-72,-8 L-56,18 L-40,-10 L-24,18 L-8,-8 L8,18 L24,-10 L40,18 L56,-8 L72,18 L78,28 Z"
            fill="#FF5DA2" stroke="#FFFFFF" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="-72" cy="-8" r="5" fill="#34E4EA" filter="url(#glowCyan)"/>
      <circle cx="-40" cy="-10" r="5" fill="#FFB627" filter="url(#glowAmber)"/>
      <circle cx="0"   cy="-12" r="6" fill="#FFFFFF"/>
      <circle cx="40"  cy="-10" r="5" fill="#7B5CFA" filter="url(#glowPurple)"/>
      <circle cx="72"  cy="-8"  r="5" fill="#34E4EA" filter="url(#glowCyan)"/>
      <rect x="-90" y="32" width="180" height="14" rx="4" fill="#FFB627"/>
    </g>
    <text x="540" y="170" text-anchor="middle" font-family="{FONT_STACK}"
          font-weight="900" font-size="56" fill="#FFFFFF" filter="url(#glowPink)"
          letter-spacing="-1">بطاقة نتيجة</text>
  </g>

  <!-- Bottom single-row brand strip — 1780..1880                              -->
  <g transform="translate(0,1750)">
    <rect x="200" y="0" width="680" height="100" rx="20"
          fill="#1B0E2E" stroke="#FF5DA2" stroke-width="3" filter="url(#glowPink)"/>
    <text x="540" y="44" text-anchor="middle" font-family="{FONT_STACK}"
          font-weight="900" font-size="44" fill="url(#gradPinkPurple)"
          filter="url(#glowPink)" letter-spacing="-1">تحدي الإجابات</text>
    <text x="540" y="78" text-anchor="middle" font-family="{FONT_STACK}"
          font-weight="700" font-size="22" fill="#E6DEFF" opacity="0.85">kalako.app</text>
  </g>

  <!-- Side neon accents (corner brackets)                                      -->
  <g filter="url(#glowCyan)">
    <path d="M40,160 L40,80 L120,80" stroke="{NEON_CYAN}" stroke-width="6"
          fill="none" stroke-linecap="round"/>
    <path d="M1040,160 L1040,80 L960,80" stroke="{NEON_CYAN}" stroke-width="6"
          fill="none" stroke-linecap="round"/>
    <path d="M40,1760 L40,1840 L120,1840" stroke="{NEON_AMBER}" stroke-width="6"
          fill="none" stroke-linecap="round" filter="url(#glowAmber)"/>
    <path d="M1040,1760 L1040,1840 L960,1840" stroke="{NEON_AMBER}" stroke-width="6"
          fill="none" stroke-linecap="round" filter="url(#glowAmber)"/>
  </g>

  <!-- Document the empty zones for the React developer. Hidden in export.     -->
  <g id="safe-zones" display="none">
    <!-- Avatar: y 220..620, centered at x=540, max w=480 -->
    <rect x="340" y="220" width="400" height="400" rx="20"/>
    <!-- Name strip: y 700..830 -->
    <rect x="120" y="700" width="840" height="130" rx="20"/>
    <!-- Score (giant): y 900..1180 -->
    <rect x="120" y="900" width="840" height="280" rx="20"/>
    <!-- Sub-line/stats: y 1240..1380 -->
    <rect x="120" y="1240" width="840" height="140" rx="20"/>
    <!-- Optional rank badge: y 1420..1620 -->
    <rect x="380" y="1420" width="320" height="200" rx="20"/>
  </g>
</svg>
"""


# ═════════════════════════════════════════════════════════════════════════════
# 4. PWA / FAVICON icons — solid bg, fills frame, maskable variant
# ═════════════════════════════════════════════════════════════════════════════

def _pwa_defs() -> str:
    return f"""
  <defs>
    <linearGradient id="gradBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="{BG_DEEP}"/>
      <stop offset="100%" stop-color="{BG_MID}"/>
    </linearGradient>
    <linearGradient id="gradPinkPurple" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="{NEON_PINK}"/>
      <stop offset="100%" stop-color="{NEON_PURPLE}"/>
    </linearGradient>
    <radialGradient id="gradHalo" cx="50%" cy="50%" r="55%">
      <stop offset="0%"  stop-color="#7B5CFA" stop-opacity="0.85"/>
      <stop offset="70%" stop-color="#12071F" stop-opacity="0"/>
    </radialGradient>
    <filter id="glowPink" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="6" result="b" in="SourceGraphic"/>
      <feFlood flood-color="{NEON_PINK}" flood-opacity="0.95"/>
      <feComposite in2="b" operator="in" result="g"/>
      <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="glowCyan" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="4" result="b" in="SourceGraphic"/>
      <feFlood flood-color="{NEON_CYAN}" flood-opacity="0.95"/>
      <feComposite in2="b" operator="in" result="g"/>
      <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="glowAmber" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="3" result="b" in="SourceGraphic"/>
      <feFlood flood-color="{NEON_AMBER}" flood-opacity="0.95"/>
      <feComposite in2="b" operator="in" result="g"/>
      <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>"""

def pwa_app_icon() -> str:
    """The standard PWA / favicon — simplified: solid panel + giant ? + crown.
    No "تحدي الإجابات" text so 16px legibility still works."""
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img"
     aria-label="Kalako app icon">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@900&display=swap');
  text {{ font-family: 'Cairo','Tajawal','Noto Sans Arabic',system-ui,sans-serif; }}
</style>
{_pwa_defs()}
  <rect x="0" y="0" width="512" height="512" rx="120" ry="120" fill="url(#gradBg)"/>
  <rect x="0" y="0" width="512" height="512" rx="120" ry="120" fill="url(#gradHalo)"/>
  <!-- crown -->
  <g transform="translate(176,72)" filter="url(#glowAmber)">
    <path d="M0,52 L26,0 L52,38 L78,0 L104,52 Z M0,52 L104,52 L104,66 L0,66 Z"
          fill="{NEON_AMBER}" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="26" cy="0"  r="8" fill="{NEON_PINK}"/>
    <circle cx="52" cy="25" r="6" fill="{NEON_CYAN}"/>
    <circle cx="78" cy="0"  r="8" fill="{NEON_PURPLE}"/>
  </g>
  <!-- giant "?" -->
  <g filter="url(#glowPink)">
    <text x="256" y="380" text-anchor="middle"
          font-weight="900" font-size="320" fill="url(#gradPinkPurple)">؟</text>
  </g>
  <!-- corner speckles -->
  <circle cx="86"  cy="102" r="9" fill="{NEON_CYAN}"  filter="url(#glowCyan)"/>
  <circle cx="430" cy="380" r="7" fill="{NEON_AMBER}" filter="url(#glowAmber)"/>
  <circle cx="430" cy="120" r="5" fill="#FFFFFF" opacity="0.85"/>
  <circle cx="80"  cy="380" r="5" fill="#FFFFFF" opacity="0.7"/>
</svg>
"""

def pwa_maskable_icon() -> str:
    """Android Adaptive Icon — artwork scaled down to ~60% of the canvas so the
    launcher mask circle/squircle never chops the brand mark. Outer 512 is the
    full canvas (incl. the portion that gets masked away). Inner safe zone is
    360x360 centered."""
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img"
     aria-label="Kalako maskable app icon (Android adaptive)">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@900&display=swap');
  text {{ font-family: 'Cairo','Tajawal','Noto Sans Arabic',system-ui,sans-serif; }}
</style>
{_pwa_defs()}
  <!-- Full 512 backdrop — this gets clipped by the launcher mask.             -->
  <rect x="0" y="0" width="512" height="512" fill="url(#gradBg)"/>
  <rect x="0" y="0" width="512" height="512" fill="url(#gradHalo)"/>
  <!-- Brand mark scaled into the 360x360 inner safe zone, centered.           -->
  <g transform="translate(76,76) scale(0.703)">
    <g transform="translate(0,32)">
      <rect x="50" y="0" width="260" height="52" rx="14" fill="{NEON_AMBER}"
            filter="url(#glowAmber)" stroke="#FFFFFF" stroke-width="2"/>
      <rect x="50" y="20" width="260" height="14" fill="{NEON_AMBER}"/>
      <circle cx="120" cy="0" r="8" fill="{NEON_PINK}"/>
      <circle cx="180" cy="14" r="7" fill="{NEON_CYAN}"/>
      <circle cx="240" cy="0" r="8" fill="{NEON_PURPLE}"/>
    </g>
    <g filter="url(#glowPink)">
      <text x="180" y="240" text-anchor="middle"
            font-weight="900" font-size="220" fill="url(#gradPinkPurple)">؟</text>
    </g>
    <circle cx="32"  cy="40"  r="8" fill="{NEON_CYAN}"  filter="url(#glowCyan)"/>
    <circle cx="328" cy="260" r="7" fill="{NEON_AMBER}" filter="url(#glowAmber)"/>
  </g>
  <!-- subtle frame outline to mark the safe zone for designers in previewers -->
  <circle cx="256" cy="256" r="180" fill="none" stroke="#FFFFFF" stroke-opacity="0.06" stroke-dasharray="6 6"/>
</svg>
"""


# ═════════════════════════════════════════════════════════════════════════════
# 5. CATEGORY ICONS — 8 unified rounded-square chips with semantic glyphs
# ═════════════════════════════════════════════════════════════════════════════

def _chip_svg(slug: str, glyph: str, accent: str) -> str:
    """All 8 categories share the chip shape: rounded square 512x512, rx=44
    (proportionally --r-md from design system), neon stroke, halo behind."""
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img"
     aria-label="تحدي الإجابات category — {slug}">
{defs()}
  <!-- chip backdrop with gradient — sits on the brand gradient so it works
       in either bg-deep or elevated surface. -->
  <rect x="0" y="0" width="512" height="512" rx="44" ry="44"
        fill="url(#gradBg)" stroke="url(#gradPinkPurple)" stroke-width="6"
        filter="url(#glowPurple)"/>
  <!-- inner lavender hairline -->
  <rect x="14" y="14" width="484" height="484" rx="32" ry="32"
        fill="none" stroke="#E6DEFF" stroke-opacity="0.18" stroke-width="2"/>
  <!-- corner accent shape: small chip-tab with category color -->
  <g filter="url(#glow{accent.replace('#','').replace('NEON_','').title().replace('Eon','')})">
    <circle cx="430" cy="82" r="14" fill="{accent}"/>
  </g>
  <!-- the semantic glyph -->
  <g filter="url(#glowPink)">
    {glyph}
  </g>
</svg>
"""


# Glyph generators — each draws inside roughly a 360x360 area centered at
# (256, 256). Strokes are 18px so post-export they remain visible at 64px.

def _sports_glyph() -> str:
    # Soccer ball: pentagon + seam lines
    return (
        f'<g transform="translate(256,256)">'
        f'<circle r="160" fill="#FFFFFF" stroke="{NEON_PINK}" stroke-width="14"/>'
        f'<polygon points="0,-90 86,-28 54,72 -54,72 -86,-28" '
        f'fill="{NEON_PINK}" stroke="{BG_DEEP}" stroke-width="6"/>'
        f'<g stroke="{BG_DEEP}" stroke-width="10" stroke-linecap="round" fill="none">'
        f'<line x1="0" y1="-90" x2="0" y2="-160"/>'
        f'<line x1="86" y1="-28" x2="148" y2="-14"/>'
        f'<line x1="54" y1="72"  x2="100" y2="120"/>'
        f'<line x1="-54" y1="72" x2="-100" y2="120"/>'
        f'<line x1="-86" y1="-28" x2="-148" y2="-14"/>'
        f'</g></g>'
    )

def _history_glyph() -> str:
    # Hourglass with sand
    return (
        f'<g transform="translate(256,256)">'
        f'<path d="M-110,-130 H110 L0,0 L110,130 H-110 L0,0 Z" '
        f'fill="#FFFFFF" stroke="{NEON_AMBER}" stroke-width="14" stroke-linejoin="round"/>'
        f'<rect x="-110" y="-150" width="220" height="20" rx="6" fill="{NEON_AMBER}"/>'
        f'<rect x="-110" y="130"  width="220" height="20" rx="6" fill="{NEON_AMBER}"/>'
        f'<path d="M-100,120 Q-100,-30 0,0 Q100,-30 100,120 Z" '
        f'fill="{NEON_AMBER}" opacity="0.85"/>'
        f'<rect x="-110" y="-130" width="220" height="14" fill="{BG_DEEP}" opacity="0.5"/>'
        f'</g>'
    )

def _geography_glyph() -> str:
    # Globe with meridians and equator
    return (
        f'<g transform="translate(256,256)">'
        f'<circle r="155" fill="#FFFFFF" stroke="{NEON_CYAN}" stroke-width="14"/>'
        f'<ellipse cx="0" cy="0" rx="155" ry="60" fill="none" stroke="{NEON_PURPLE}" stroke-width="8"/>'
        f'<line x1="0" y1="-155" x2="0" y2="155" stroke="{NEON_PURPLE}" stroke-width="8"/>'
        f'<ellipse cx="0" cy="0" rx="80" ry="155" fill="none" stroke="{NEON_PINK}" stroke-width="8"/>'
        f'<line x1="-155" y1="0" x2="155" y2="0" stroke="{NEON_PINK}" stroke-width="8"/>'
        f'<circle cx="-50" cy="-50" r="14" fill="{NEON_PINK}"/>'
        f'<circle cx="60"  cy="30"  r="14" fill="{NEON_PINK}"/>'
        f'</g>'
    )

def _films_glyph() -> str:
    # Clapperboard
    return (
        f'<g transform="translate(256,256)">'
        f'<rect x="-140" y="-30" width="280" height="180" rx="14" '
        f'fill="#FFFFFF" stroke="{NEON_PINK}" stroke-width="12"/>'
        f'<g stroke="{NEON_PINK}" stroke-width="10">'
        f'<line x1="-140" y1="20"  x2="140" y2="20"/>'
        f'<line x1="-140" y1="60"  x2="140" y2="60"/>'
        f'<line x1="-140" y1="100" x2="140" y2="100"/>'
        f'</g>'
        f'<rect x="-160" y="-110" width="320" height="80" rx="10" '
        f'fill="{NEON_AMBER}" stroke="{BG_DEEP}" stroke-width="8" '
        f'transform="rotate(-12)"/>'
        f'<g transform="rotate(-12)" stroke="{BG_DEEP}" stroke-width="8">'
        f'<line x1="-150" y1="-100" x2="-130" y2="-40"/>'
        f'<line x1="-100" y1="-100" x2="-80"  y2="-40"/>'
        f'<line x1="-50"  y1="-100" x2="-30"  y2="-40"/>'
        f'<line x1="0"    y1="-100" x2="20"   y2="-40"/>'
        f'<line x1="50"   y1="-100" x2="70"   y2="-40"/>'
        f'<line x1="100"  y1="-100" x2="120"  y2="-40"/>'
        f'</g></g>'
    )

def _science_glyph() -> str:
    # Atom — nucleus + 3 orbits
    return (
        f'<g transform="translate(256,256)">'
        f'<ellipse cx="0" cy="0" rx="160" ry="60" fill="none" '
        f'stroke="{NEON_CYAN}" stroke-width="10"/>'
        f'<ellipse cx="0" cy="0" rx="160" ry="60" fill="none" '
        f'stroke="{NEON_PINK}" stroke-width="10" transform="rotate(60)"/>'
        f'<ellipse cx="0" cy="0" rx="160" ry="60" fill="none" '
        f'stroke="{NEON_PURPLE}" stroke-width="10" transform="rotate(-60)"/>'
        f'<circle r="28" fill="{NEON_AMBER}" filter="url(#glowAmber)"/>'
        f'<circle cx="160" cy="0" r="10" fill="{NEON_CYAN}"/>'
        f'<circle cx="-80" cy="-138" r="10" fill="{NEON_PINK}" '
        f'transform="rotate(60)"/>'
        f'<circle cx="80"  cy="138" r="10" fill="{NEON_PURPLE}" '
        f'transform="rotate(-60)"/>'
        f'</g>'
    )

def _celebrities_glyph() -> str:
    # Star + camera flash spark
    return (
        f'<g transform="translate(256,256)">'
        f'<polygon points="0,-150 35,-46 142,-46 57,18 92,123 0,60 -92,123 -57,18 -142,-46 -35,-46" '
        f'fill="{NEON_AMBER}" stroke="#FFFFFF" stroke-width="8" stroke-linejoin="round"/>'
        f'<circle cx="0" cy="0" r="22" fill="{WHITE}"/>'
        # corner spark
        f'<g transform="translate(130,-130)">'
        f'<rect x="-2" y="-20" width="4" height="40" rx="2" fill="{WHITE}"/>'
        f'<rect x="-20" y="-2" width="40" height="4" rx="2" fill="{WHITE}"/>'
        f'<circle r="3" fill="{WHITE}"/>'
        f'</g></g>'
    )

def _cooking_glyph() -> str:
    # Chef's hat
    return (
        f'<g transform="translate(256,256)">'
        f'<ellipse cx="-50" cy="-60" rx="60" ry="60" fill="#FFFFFF" '
        f'stroke="{NEON_PINK}" stroke-width="10"/>'
        f'<ellipse cx="58"  cy="-50" rx="58" ry="58" fill="#FFFFFF" '
        f'stroke="{NEON_PINK}" stroke-width="10"/>'
        f'<ellipse cx="0"   cy="-100" rx="55" ry="55" fill="#FFFFFF" '
        f'stroke="{NEON_PINK}" stroke-width="10"/>'
        f'<rect x="-130" y="0" width="260" height="120" rx="14" '
        f'fill="#FFFFFF" stroke="{NEON_PINK}" stroke-width="14"/>'
        f'<line x1="-100" y1="40" x2="100" y2="40" stroke="{NEON_PINK}" stroke-width="6"/>'
        f'<circle cx="-70" cy="60" r="6" fill="{NEON_AMBER}"/>'
        f'<circle cx="0"   cy="60" r="6" fill="{NEON_AMBER}"/>'
        f'<circle cx="70"  cy="60" r="6" fill="{NEON_AMBER}"/>'
        f'</g>'
    )

def _puzzles_glyph() -> str:
    # Single jigsaw piece neon
    return (
        f'<g transform="translate(256,256) scale(1.6)">'
        f'<path d="M-70,-60 H-20 a14,14 0 0 1 0,28 H0 V-60 a14,14 0 0 1 28,0 V0 '
        f'a14,14 0 0 1 -28,0 V0 H70 V40 a14,14 0 0 1 0,28 H40 V90 H-70 V60 a14,14 0 0 1 0,-28 H-70 Z" '
        f'stroke="{NEON_PINK}" stroke-width="6" fill="url(#gradPinkPurple)" '
        f'stroke-linejoin="round"/>'
        f'<circle cx="0" cy="0" r="14" fill="{NEON_AMBER}" filter="url(#glowAmber)"/>'
        f'</g>'
    )

CATEGORIES = [
    ("sports",      _sports_glyph,      NEON_PINK),
    ("history",     _history_glyph,     NEON_AMBER),
    ("geography",   _geography_glyph,   NEON_CYAN),
    ("films",       _films_glyph,       NEON_PINK),
    ("science",     _science_glyph,     NEON_CYAN),
    ("celebrities", _celebrities_glyph, NEON_AMBER),
    ("cooking",     _cooking_glyph,     NEON_PINK),
    ("puzzles",     _puzzles_glyph,     NEON_PURPLE),
]


# ═════════════════════════════════════════════════════════════════════════════
# 6. SPLASH / LOADING — 1080×1920, self-contained animation, dark only
# ═════════════════════════════════════════════════════════════════════════════

def splash_svg() -> str:
    style = f"""
<style>
  @keyframes float-a {{ 0%,100% {{ transform: translate(0,0) scale(1) }}
                       50%     {{ transform: translate(40px,-30px) scale(1.06) }} }}
  @keyframes float-b {{ 0%,100% {{ transform: translate(0,0) scale(1) }}
                       50%     {{ transform: translate(-50px,40px) scale(0.95) }} }}
  @keyframes float-c {{ 0%,100% {{ transform: translate(0,0) scale(1) }}
                       50%     {{ transform: translate(20px,60px) scale(1.04) }} }}
  @keyframes float-d {{ 0%,100% {{ transform: translate(0,0) scale(1) }}
                       50%     {{ transform: translate(-30px,-20px) scale(0.92) }} }}
  .blob-a {{ animation: float-a 14s ease-in-out infinite; }}
  .blob-b {{ animation: float-b 18s ease-in-out infinite; }}
  .blob-c {{ animation: float-c 22s ease-in-out infinite; }}
  .blob-d {{ animation: float-d 16s ease-in-out infinite; }}

  @keyframes pulseLogo {{
    0%,100% {{ transform: scale(1); filter: drop-shadow(0 0 20px #FF5DA2); }}
    50%     {{ transform: scale(1.06); filter: drop-shadow(0 0 50px #FF5DA2); }}
  }}
  .logo-mark {{ animation: pulseLogo 1.6s ease-in-out infinite;
                transform-box: fill-box; transform-origin: center; }}

  @keyframes spinSlow {{ to {{ transform: rotate(360deg); }} }}
  .ring-orbit {{ animation: spinSlow 6s linear infinite;
                 transform-box: fill-box; transform-origin: center; }}

  @keyframes blink {{
    0%,80%,100% {{ opacity: 0.35; }}
    40%         {{ opacity: 1; }}
  }}
  .dot {{ animation: blink 1.2s ease-in-out infinite; }}
  .dot-1 {{ animation-delay: 0s; }}
  .dot-2 {{ animation-delay: 0.18s; }}
  .dot-3 {{ animation-delay: 0.36s; }}

  @keyframes barFill {{
    0%   {{ transform: scaleX(0); }}
    50%  {{ transform: scaleX(0.7); }}
    100% {{ transform: scaleX(1); }}
  }}
  .bar-fill {{ transform-box: fill-box; transform-origin: left center;
               animation: barFill 2.4s ease-in-out infinite; }}
</style>"""

    return f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" role="img"
     aria-label="تحدي الإجابات loading screen">
{style}
{defs(extra="""
    <radialGradient id="gradHaloSplash" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#7B5CFA" stop-opacity="0.55"/>
      <stop offset="60%" stop-color="#12071F" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gradBar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#FF5DA2"/>
      <stop offset="50%"  stop-color="#7B5CFA"/>
      <stop offset="100%" stop-color="#34E4EA"/>
    </linearGradient>
""")}
  <rect width="1080" height="1920" fill="url(#gradBg)"/>
  <rect width="1080" height="1920" fill="url(#gradHaloSplash)"/>
  <!-- floating blobs -->
  <g filter="url(#softBlob)" opacity="0.6">
    <ellipse class="blob-a" cx="180"  cy="320"  rx="260" ry="230" fill="{NEON_PINK}"/>
    <ellipse class="blob-b" cx="900"  cy="900"  rx="300" ry="280" fill="{NEON_PURPLE}"/>
    <ellipse class="blob-c" cx="220"  cy="1500" rx="320" ry="260" fill="{NEON_CYAN}"/>
    <ellipse class="blob-d" cx="880"  cy="1700" rx="280" ry="220" fill="{NEON_AMBER}"/>
  </g>

  <!-- subtle star dust -->
  <g opacity="0.85">
    <circle cx="120" cy="780"  r="3"   fill="#FFFFFF"/>
    <circle cx="320" cy="1200" r="2.5" fill="#FFFFFF"/>
    <circle cx="780" cy="500"  r="3"   fill="#FFFFFF"/>
    <circle cx="640" cy="1600" r="2.5" fill="#FFFFFF"/>
    <circle cx="520" cy="900"  r="2"   fill="#FFFFFF"/>
    <circle cx="940" cy="1280" r="3"   fill="#FFFFFF"/>
    <circle cx="260" cy="1700" r="2"   fill="#FFFFFF"/>
  </g>

  <!-- central mark — bigger, brand-strict                                -->
  <g transform="translate(540, 820)" class="logo-mark">
    <circle r="240" fill="url(#gradHaloSplash)"/>
    <!-- crown -->
    <g transform="translate(-110,-200)" filter="url(#glowAmber)">
      <path d="M0,52 L26,0 L52,38 L78,0 L104,52 Z M0,52 L104,52 L104,66 L0,66 Z"
            fill="{NEON_AMBER}" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="26" cy="0"  r="8" fill="{NEON_PINK}"/>
      <circle cx="52" cy="25" r="6" fill="{NEON_CYAN}"/>
      <circle cx="78" cy="0"  r="8" fill="{NEON_PURPLE}"/>
    </g>
    <!-- giant "?" -->
    <g filter="url(#glowPink)">
      <text x="0" y="120" text-anchor="middle"
            font-weight="900" font-size="320" fill="url(#gradPinkPurple)"
            font-family="{FONT_STACK}">؟</text>
    </g>
    <!-- brand name -->
    <text x="0" y="260" text-anchor="middle" font-weight="900" font-size="64"
          fill="#FFFFFF" filter="url(#glowPink)" letter-spacing="-2"
          font-family="{FONT_STACK}">تحدي الإجابات</text>
    <!-- orbit ring -->
    <circle r="280" fill="none" stroke="{NEON_CYAN}" stroke-width="2"
            stroke-opacity="0.4" class="ring-orbit"
            stroke-dasharray="6 16"/>
    <circle cx="280" cy="0" r="6" fill="{NEON_CYAN}" filter="url(#glowCyan)"/>
  </g>

  <!-- 3-dot loader -->
  <g transform="translate(540,1480)">
    <circle cx="-44" cy="0" r="12" fill="{NEON_PINK}"   filter="url(#glowPink)"  class="dot dot-1"/>
    <circle cx="0"   cy="0" r="12" fill="{NEON_PURPLE}" filter="url(#glowPurple)" class="dot dot-2"/>
    <circle cx="44"  cy="0" r="12" fill="{NEON_CYAN}"   filter="url(#glowCyan)"  class="dot dot-3"/>
  </g>

  <!-- loading text -->
  <text x="540" y="1560" text-anchor="middle" font-weight="700"
        font-size="36" fill="{WHITE_SOFT}" opacity="0.85"
        font-family="{FONT_STACK}">جاري التحميل…</text>

  <!-- progress bar -->
  <g transform="translate(140,1700)">
    <rect x="0" y="0"   width="800" height="14" rx="7" fill="#1B0E2E"
          stroke="{NEON_PURPLE}" stroke-width="2" stroke-opacity="0.6"/>
    <rect x="0" y="0"   width="800" height="14" rx="7" fill="url(#gradBar)"
          filter="url(#glowPink)" class="bar-fill"/>
  </g>

  <!-- version / footer -->
  <text x="540" y="1800" text-anchor="middle" font-weight="600"
        font-size="24" fill="{WHITE}" opacity="0.55" font-family="{FONT_STACK}">kalako.app</text>
</svg>
"""


# ═════════════════════════════════════════════════════════════════════════════
# Driver
# ═════════════════════════════════════════════════════════════════════════════

def main() -> None:
    print("Generating Round-2 Neon Party SVG assets …")

    print("— Avatar 3-state variants (animated) —")
    for cfg in AVATAR_CONFIGS:
        for state in ("normal", "happy", "fooled"):
            write(SVG / "avatars-state" / f"avatar-{cfg[0]}-{state}.svg",
                  avatar_state_svg(cfg, state))

    print("— OG image (1200×630) —")
    write(SVG / "og" / "og-image.svg", og_image_svg())

    print("— Results share card (1080×1920, transparent) —")
    write(SVG / "share-card" / "result-card.svg", result_card_svg())

    print("— PWA / favicon icons —")
    write(SVG / "pwa" / "favicon.svg",             pwa_app_icon())
    write(SVG / "pwa" / "apple-touch-icon.svg",    pwa_app_icon())
    write(SVG / "pwa" / "maskable-512.svg",        pwa_maskable_icon())

    print("— Category icons (8) —")
    for slug, glyph_fn, accent in CATEGORIES:
        write(SVG / "categories" / f"{slug}.svg", _chip_svg(slug, glyph_fn(), accent))

    print("— Splash / loading screen —")
    write(SVG / "splash" / "splash.svg", splash_svg())

    print("[Done] Round-2 SVG assets generated.")


if __name__ == "__main__":
    main()
