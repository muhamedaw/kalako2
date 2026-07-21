"""
build_assets.py — Single-machine generator for the Neon Party design system of
"تحدي الإجابات" (Tashdei Al-Ejabate). Outputs ONLY SVG; PNGs are produced later
by render_png.py (Playwright).

Run:
    python assets/scripts/build_assets.py
"""

from __future__ import annotations

from pathlib import Path
from string import Template
import sys

# Windows cp1252 hardening for any future print with non-ASCII
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

ROOT = Path(__file__).resolve().parents[1]
SVG = ROOT / "svg"
(SVG / "avatars").mkdir(parents=True, exist_ok=True)
(SVG / "ui").mkdir(parents=True, exist_ok=True)
(SVG / "background").mkdir(parents=True, exist_ok=True)
(SVG / "logo").mkdir(parents=True, exist_ok=True)

# ───────────────────────────── Palette ──────────────────────────────────────
BG_DEEP     = "#12071F"
BG_MID      = "#1B0E2E"
BG_ELEV     = "#2A1758"
NEON_PINK   = "#FF5DA2"
NEON_PURPLE = "#7B5CFA"
NEON_CYAN   = "#34E4EA"
NEON_AMBER  = "#FFB627"
WHITE       = "#FFFFFF"
WHITE_SOFT  = "#E6DEFF"

FONT_STACK = "Cairo, Tajawal, 'Noto Sans Arabic', system-ui, sans-serif"

# ──────────────────────── Reusable SVG fragments ────────────────────────────

LOBBY_STYLE = """
<style>
  :root { --c1: $pink; --c2: $purple; --c3: $cyan; --c4: $amber; }
  .blob {
    transform-box: fill-box;
    transform-origin: center;
    will-change: transform, filter;
  }
  @keyframes float-a { 0%,100% { transform: translate(0,0) scale(1) }
                       50%     { transform: translate(40px,-30px) scale(1.06) } }
  @keyframes float-b { 0%,100% { transform: translate(0,0) scale(1) }
                       50%     { transform: translate(-50px,40px) scale(0.95) } }
  @keyframes float-c { 0%,100% { transform: translate(0,0) scale(1) }
                       50%     { transform: translate(20px,60px) scale(1.04) } }
  @keyframes float-d { 0%,100% { transform: translate(0,0) scale(1) }
                       50%     { transform: translate(-30px,-20px) scale(0.92) } }
  .blob-a { animation: float-a 14s ease-in-out infinite; }
  .blob-b { animation: float-b 18s ease-in-out infinite; }
  .blob-c { animation: float-c 22s ease-in-out infinite; }
  .blob-d { animation: float-d 16s ease-in-out infinite; }
  .star { fill: #FFFFFF; opacity: 0.85; animation: twinkle 3s ease-in-out infinite; }
  @keyframes twinkle { 0%,100% { opacity:.35 } 50% { opacity:1 } }
  .star.s2 { animation-delay:.8s }
  .star.s3 { animation-delay:1.4s }
  .star.s4 { animation-delay:2.1s }
</style>"""

def defs(extra: str = "") -> str:
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
    <linearGradient id="gradPurplePink" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="{NEON_PURPLE}"/>
      <stop offset="100%" stop-color="{NEON_PINK}"/>
    </linearGradient>
    <radialGradient id="gradCyanPop" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="{NEON_CYAN}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="{NEON_CYAN}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="gradAmberPop" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="{NEON_AMBER}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="{NEON_AMBER}" stop-opacity="0"/>
    </radialGradient>
    <filter id="glowPink" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="2.5" result="b" in="SourceGraphic"/>
      <feFlood flood-color="{NEON_PINK}" flood-opacity="0.9"/>
      <feComposite in2="b" operator="in" result="glow"/>
      <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="glowPurple" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="2.5" result="b" in="SourceGraphic"/>
      <feFlood flood-color="{NEON_PURPLE}" flood-opacity="0.85"/>
      <feComposite in2="b" operator="in" result="glow"/>
      <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="glowCyan" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="2" result="b" in="SourceGraphic"/>
      <feFlood flood-color="{NEON_CYAN}" flood-opacity="0.9"/>
      <feComposite in2="b" operator="in" result="glow"/>
      <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="glowAmber" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="2.5" result="b" in="SourceGraphic"/>
      <feFlood flood-color="{NEON_AMBER}" flood-opacity="0.9"/>
      <feComposite in2="b" operator="in" result="glow"/>
      <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="softBlob" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="28" result="b" in="SourceGraphic"/>
      <feFlood flood-color="{NEON_PURPLE}" flood-opacity="0.55"/>
      <feComposite in2="b" operator="in" result="glow"/>
      <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
{extra}
  </defs>"""

def font_face() -> str:
    return """
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&amp;family=Tajawal:wght@400;700;900&amp;display=swap');
    text { font-family: 'Cairo', 'Tajawal', 'Noto Sans Arabic', system-ui, sans-serif; }
  </style>"""

# ───────────────────────────── Logo ─────────────────────────────────────────

LOGO_WORD = "تحدي الإجابات"

def _extra_logo_round() -> str:
    return """
    <radialGradient id="gradHalo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#7B5CFA" stop-opacity="0.65"/>
      <stop offset="70%" stop-color="#7B5CFA" stop-opacity="0"/>
    </radialGradient>"""

def logo_horizontal() -> str:
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 360" role="img"
     aria-label="تحدي الإجابات — Neon Party trivia game logo">
{font_face()}
{defs(extra=_extra_logo_round())}
  <circle cx="190" cy="180" r="170" fill="url(#gradHalo)"/>
  <g filter="url(#glowPink)" transform="translate(60,60)">
    <rect x="0" y="0" width="240" height="240" rx="44" ry="44"
          fill="url(#gradPurplePink)" stroke="#FF5DA2" stroke-width="2"/>
    <rect x="10" y="10" width="220" height="220" rx="34" ry="34"
          fill="none" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1"/>
    <text x="120" y="170" text-anchor="middle" font-family="{FONT_STACK}"
          font-weight="900" font-size="180" fill="#FFFFFF" letter-spacing="-6">؟</text>
    <circle cx="48" cy="56" r="5" fill="{NEON_CYAN}" filter="url(#glowCyan)"/>
    <circle cx="200" cy="200" r="4" fill="{NEON_AMBER}" filter="url(#glowAmber)"/>
    <circle cx="56" cy="200" r="3" fill="#FFFFFF" opacity="0.9"/>
  </g>
  <g transform="translate(140,30)" filter="url(#glowAmber)">
    <path d="M0,40 L20,0 L40,30 L60,0 L80,40 Z M0,40 L80,40 L80,52 L0,52 Z"
          fill="{NEON_AMBER}" stroke="#FFFFFF" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="20" cy="0" r="6" fill="{NEON_PINK}"/>
    <circle cx="40" cy="20" r="5" fill="{NEON_CYAN}"/>
    <circle cx="60" cy="0" r="6" fill="{NEON_PURPLE}"/>
  </g>
  <g filter="url(#glowPink)">
    <text x="380" y="200" font-family="{FONT_STACK}" font-weight="900"
          font-size="120" fill="url(#gradPinkPurple)" letter-spacing="-2">
      {LOGO_WORD}
    </text>
  </g>
  <text x="380" y="260" font-family="{FONT_STACK}" font-weight="600"
        font-size="34" fill="{WHITE_SOFT}" opacity="0.85">
    لعبة خداع جماعية • Fibbage-style
  </text>
  <g filter="url(#glowCyan)">
    <rect x="380" y="280" width="160" height="6" rx="3" fill="{NEON_CYAN}"/>
  </g>
  <rect x="550" y="280" width="60" height="6" rx="3" fill="{NEON_PINK}" opacity="0.7"/>
</svg>
"""

def _extra_square() -> str:
    return """
    <radialGradient id="gradHalo2" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#7B5CFA" stop-opacity="0.85"/>
      <stop offset="70%" stop-color="#12071F" stop-opacity="0"/>
    </radialGradient>"""

def logo_square() -> str:
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img"
     aria-label="تحدي الإجابات — app icon">
{font_face()}
{defs(extra=_extra_square())}
  <rect x="0" y="0" width="512" height="512" rx="120" ry="120" fill="url(#gradBg)"/>
  <rect x="0" y="0" width="512" height="512" rx="120" ry="120" fill="url(#gradHalo2)"/>
  <g transform="translate(176,80)" filter="url(#glowAmber)">
    <path d="M0,52 L26,0 L52,38 L78,0 L104,52 Z M0,52 L104,52 L104,66 L0,66 Z"
          fill="{NEON_AMBER}" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="26" cy="0" r="8" fill="{NEON_PINK}"/>
    <circle cx="52" cy="25" r="6" fill="{NEON_CYAN}"/>
    <circle cx="78" cy="0" r="8" fill="{NEON_PURPLE}"/>
  </g>
  <g filter="url(#glowPink)">
    <text x="256" y="340" text-anchor="middle" font-family="{FONT_STACK}"
          font-weight="900" font-size="280" fill="url(#gradPinkPurple)">؟</text>
  </g>
  <text x="256" y="446" text-anchor="middle" font-family="{FONT_STACK}" font-weight="900"
        font-size="56" fill="#FFFFFF" filter="url(#glowPink)" letter-spacing="-1">
    {LOGO_WORD}
  </text>
  <g filter="url(#glowCyan)">
    <circle cx="86" cy="102" r="9" fill="{NEON_CYAN}"/>
  </g>
  <g filter="url(#glowAmber)">
    <circle cx="430" cy="380" r="7" fill="{NEON_AMBER}"/>
  </g>
  <circle cx="430" cy="120" r="5" fill="#FFFFFF" opacity="0.9"/>
  <circle cx="80" cy="380" r="5" fill="#FFFFFF" opacity="0.7"/>
</svg>
"""

# ───────────────────────── Lobby background ─────────────────────────────────

def background_lobby() -> str:
    style = Template(LOBBY_STYLE).substitute(
        pink=NEON_PINK, purple=NEON_PURPLE,
        cyan=NEON_CYAN, amber=NEON_AMBER)
    grid_h = [f'<line x1="0" y1="{y}" x2="1080" y2="{y}"/>' for y in range(120, 1920, 120)]
    grid_v = [f'<line x1="{x}" y1="0" x2="{x}" y2="1920"/>' for x in range(120, 1080, 120)]
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" role="img"
     aria-label="Lobby background for تحدي الإجابات"
     preserveAspectRatio="xMidYMid slice">
{defs(extra=style)}
  <rect width="1080" height="1920" fill="url(#gradBg)"/>
  <g filter="url(#softBlob)" opacity="0.55">
    <ellipse class="blob blob-a" cx="180" cy="320" rx="260" ry="230" fill="{NEON_PINK}"/>
  </g>
  <g filter="url(#softBlob)" opacity="0.6">
    <ellipse class="blob blob-b" cx="900" cy="900" rx="300" ry="280" fill="{NEON_PURPLE}"/>
  </g>
  <g filter="url(#softBlob)" opacity="0.5">
    <ellipse class="blob blob-c" cx="220" cy="1500" rx="320" ry="260" fill="{NEON_CYAN}"/>
  </g>
  <g filter="url(#softBlob)" opacity="0.45">
    <ellipse class="blob blob-d" cx="880" cy="1700" rx="280" ry="220" fill="{NEON_AMBER}"/>
  </g>
  <g>
    <circle class="star"    cx="120" cy="780"  r="3"/>
    <circle class="star s2" cx="320" cy="1200" r="2.5"/>
    <circle class="star s3" cx="780" cy="500"  r="3"/>
    <circle class="star s4" cx="640" cy="1600" r="2.5"/>
    <circle class="star"    cx="520" cy="900"  r="2"/>
    <circle class="star s2" cx="940" cy="1280" r="3"/>
    <circle class="star s3" cx="260" cy="1700" r="2"/>
  </g>
  <g opacity="0.06" stroke="#FFFFFF" stroke-width="1">
    {''.join(grid_h)}
    {''.join(grid_v)}
  </g>
</svg>
"""

# ─────────────────────── 16 avatar factory ──────────────────────────────────

AVATAR_CONFIGS = [
    # id, hair_color, hair_style, skin, accent, expr, accessory, hat_color, gender
    ("01", NEON_PINK,   "ponytail",   "#F2C9A5", NEON_CYAN,   "happy",     "none",      None,        "f"),
    ("02", NEON_PURPLE, "long",       "#D6A57A", NEON_AMBER,  "thinking",  "glasses",   None,        "f"),
    ("03", NEON_CYAN,   "short",      "#B07A5C", NEON_PINK,   "smirk",     "none",      None,        "m"),
    ("04", NEON_AMBER,  "fade",       "#8E5A3C", NEON_PURPLE, "wink",      "earphones", None,        "m"),
    ("05", NEON_PINK,   "hijab",      "#F2C9A5", NEON_CYAN,   "laugh",     "none",      NEON_PINK,   "f"),
    ("06", NEON_PURPLE, "hijab",      "#C99A78", NEON_AMBER,  "surprised", "none",      NEON_PURPLE, "f"),
    ("07", NEON_AMBER,  "curls",      "#D6A57A", NEON_CYAN,   "happy",     "headband",  None,        "f"),
    ("08", NEON_CYAN,   "afro",       "#5A3C2A", NEON_PINK,   "laugh",     "none",      None,        "m"),
    ("09", NEON_PINK,   "long_bangs", "#EFC1A0", NEON_PURPLE, "wink",      "glasses",   None,        "f"),
    ("10", NEON_PURPLE, "shaved",     "#B07A5C", NEON_AMBER,  "smirk",     "headphones",None,        "m"),
    ("11", NEON_CYAN,   "bun",        "#F2C9A5", NEON_AMBER,  "thinking",  "none",      None,        "f"),
    ("12", NEON_AMBER,  "cap",        "#8E5A3C", NEON_CYAN,   "happy",     "none",      NEON_PINK,   "m"),
    ("13", NEON_PINK,   "twin",       "#D6A57A", NEON_CYAN,   "laugh",     "none",      None,        "f"),
    ("14", NEON_PURPLE, "fade",       "#EFC1A0", NEON_PINK,   "surprised", "earbuds",   None,        "m"),
    ("15", NEON_AMBER,  "ponytail",   "#C99A78", NEON_PURPLE, "happy",     "glasses",   None,        "f"),
    ("16", NEON_CYAN,   "hairband",   "#5A3C2A", NEON_AMBER,  "wink",      "none",      None,        "m"),
]

def _face_block(cx=360, cy=370, r=180, skin="#F2C9A5", shadow="#D89E78",
                blush=NEON_PINK):
    return f"""
  <circle cx="{cx}" cy="{cy}" r="{r}" fill="{skin}"/>
  <ellipse cx="{cx-r*0.98}" cy="{cy+10}" rx="14" ry="22" fill="{skin}"/>
  <ellipse cx="{cx+r*0.98}" cy="{cy+10}" rx="14" ry="22" fill="{skin}"/>
  <ellipse cx="{cx-r*0.55}" cy="{cy+r*0.32}" rx="28" ry="16" fill="{blush}" opacity="0.45"/>
  <ellipse cx="{cx+r*0.55}" cy="{cy+r*0.32}" rx="28" ry="16" fill="{blush}" opacity="0.45"/>"""

def _eye(cx_, expr: str, open_=True):
    eye_y = 335
    if expr == "wink" and not open_:
        return (f'<path d="M{cx_-22},{eye_y} Q{cx_},{eye_y-6} {cx_+22},{eye_y}" '
                f'stroke="#1B0E2E" stroke-width="6" fill="none" stroke-linecap="round"/>')
    if expr == "happy":
        return (f'<path d="M{cx_-22},{eye_y+2} Q{cx_},{eye_y-10} {cx_+22},{eye_y+2}" '
                f'stroke="#1B0E2E" stroke-width="6" fill="none" stroke-linecap="round"/>')
    if expr == "laugh":
        return (f'<path d="M{cx_-22},{eye_y} Q{cx_},{eye_y+12} {cx_+22},{eye_y}" '
                f'stroke="#1B0E2E" stroke-width="6" fill="none" stroke-linecap="round"/>')
    if expr == "surprised":
        return (f'<circle cx="{cx_}" cy="{eye_y}" r="22" fill="#FFFFFF"/>'
                f'<circle cx="{cx_}" cy="{eye_y+3}" r="10" fill="#1B0E2E"/>'
                f'<circle cx="{cx_+5}" cy="{eye_y-5}" r="3" fill="#FFFFFF"/>')
    if expr == "wink" and open_:
        return (f'<ellipse cx="{cx_}" cy="{eye_y}" rx="20" ry="22" fill="#FFFFFF"/>'
                f'<circle cx="{cx_}" cy="{eye_y+2}" r="12" fill="#1B0E2E"/>'
                f'<circle cx="{cx_+6}" cy="{eye_y-4}" r="3" fill="#FFFFFF"/>')
    if expr == "thinking":
        return (f'<circle cx="{cx_}" cy="{eye_y}" r="18" fill="#FFFFFF"/>'
                f'<circle cx="{cx_+3}" cy="{eye_y+3}" r="9" fill="#1B0E2E"/>'
                f'<circle cx="{cx_+5}" cy="{eye_y-3}" r="2.5" fill="#FFFFFF"/>')
    # smirk / default
    return (f'<ellipse cx="{cx_}" cy="{eye_y}" rx="18" ry="20" fill="#FFFFFF"/>'
            f'<circle cx="{cx_+2}" cy="{eye_y+3}" r="9" fill="#1B0E2E"/>'
            f'<circle cx="{cx_+6}" cy="{eye_y-3}" r="3" fill="#FFFFFF"/>')

def _eyes(expr: str, cx=360) -> str:
    if expr == "wink":
        return _eye(cx - 70, expr, open_=False) + _eye(cx + 70, expr, open_=True)
    return _eye(cx - 70, expr, open_=True) + _eye(cx + 70, expr, open_=True)

def _mouth(expr: str, cx=360) -> str:
    my = 430
    if expr == "happy":
        return f'<path d="M{cx-40},{my} Q{cx},{my+30} {cx+40},{my}" stroke="#1B0E2E" stroke-width="6" fill="none" stroke-linecap="round"/>'
    if expr == "laugh":
        return (f'<path d="M{cx-50},{my} Q{cx},{my+50} {cx+50},{my} Q{cx},{my+62} {cx-50},{my}" fill="#1B0E2E"/>'
                f'<rect x="{cx-40}" y="{my+24}" width="80" height="14" fill="#FFFFFF"/>')
    if expr == "thinking":
        return f'<path d="M{cx-22},{my+8} Q{cx},{my+18} {cx+22},{my+8}" stroke="#1B0E2E" stroke-width="5" fill="none" stroke-linecap="round"/>'
    if expr == "surprised":
        return f'<ellipse cx="{cx}" cy="{my+10}" rx="16" ry="22" fill="#1B0E2E"/>'
    if expr == "wink":
        return f'<path d="M{cx-32},{my} Q{cx},{my+22} {cx+32},{my}" stroke="#1B0E2E" stroke-width="6" fill="none" stroke-linecap="round"/>'
    return f'<path d="M{cx-30},{my} Q{cx+8},{my+22} {cx+30},{my}" stroke="#1B0E2E" stroke-width="6" fill="none" stroke-linecap="round"/>'

def _hair(style: str, color: str, cx=360) -> str:
    if style == "short":
        return f'<path d="M{cx-160},340 Q{cx-180},210 {cx-30},180 Q{cx+90},150 {cx+170},235 Q{cx+200},340 {cx+160},360 L{cx-160},360 Z" fill="{color}" filter="url(#glowPurple)"/>'
    if style == "long":
        return f'<path d="M{cx-180},330 Q{cx-220},160 {cx+10},150 Q{cx+220},160 {cx+200},360 L{cx+220},560 L{cx-220},560 Z" fill="{color}" filter="url(#glowPurple)"/>'
    if style == "ponytail":
        return (f'<path d="M{cx-160},320 Q{cx-180},200 {cx+10},170 Q{cx+200},200 {cx+180},340 L{cx-160},330 Z" fill="{color}" filter="url(#glowPurple)"/>'
                f'<path d="M{cx+170},300 Q{cx+260},400 {cx+220},540 Q{cx+170},490 {cx+150},360 Z" fill="{color}" filter="url(#glowPurple)"/>')
    if style == "bun":
        return (f'<circle cx="{cx-90}" cy="225" r="50" fill="{color}" filter="url(#glowPurple)"/>'
                f'<circle cx="{cx+110}" cy="225" r="50" fill="{color}" filter="url(#glowPurple)"/>'
                f'<path d="M{cx-160},330 Q{cx-180},210 {cx+10},180 Q{cx+200},200 {cx+180},340 L{cx-160},330 Z" fill="{color}" filter="url(#glowPurple)"/>')
    if style == "curls":
        return (f'<circle cx="{cx-90}" cy="280" r="55" fill="{color}" filter="url(#glowPurple)"/>'
                f'<circle cx="{cx+90}" cy="280" r="55" fill="{color}" filter="url(#glowPurple)"/>'
                f'<circle cx="{cx-30}" cy="200" r="55" fill="{color}" filter="url(#glowPurple)"/>'
                f'<circle cx="{cx+150}" cy="240" r="45" fill="{color}" filter="url(#glowPurple)"/>')
    if style == "afro":
        return f'<ellipse cx="{cx}" cy="260" rx="220" ry="160" fill="{color}" filter="url(#glowPurple)"/>'
    if style == "fade":
        return f'<path d="M{cx-150},330 Q{cx-160},220 {cx},200 Q{cx+160},220 {cx+150},330 Z" fill="{color}" filter="url(#glowPurple)"/>'
    if style == "shaved":
        return f'<path d="M{cx-130},300 Q{cx-130},250 {cx},240 Q{cx+130},250 {cx+130},300 Z" fill="{color}" opacity="0.6"/>'
    if style == "long_bangs":
        return (f'<path d="M{cx-180},330 Q{cx-220},160 {cx+10},150 Q{cx+220},160 {cx+200},360 L{cx+220},560 L{cx-220},560 Z" fill="{color}" filter="url(#glowPurple)"/>'
                f'<path d="M{cx-150},310 Q{cx},{370} {cx+150},310 Q{cx+130},340 {cx},{355} Q{cx-130},340 {cx-150},310 Z" fill="{color}" filter="url(#glowPurple)"/>')
    if style == "twin":
        return (f'<circle cx="{cx-110}" cy="220" r="55" fill="{color}" filter="url(#glowPurple)"/>'
                f'<circle cx="{cx+110}" cy="220" r="55" fill="{color}" filter="url(#glowPurple)"/>'
                f'<path d="M{cx-180},330 Q{cx-200},170 {cx},150 Q{cx+200},170 {cx+180},340 L{cx-180},330 Z" fill="{color}" filter="url(#glowPurple)"/>')
    if style == "hairband":
        return f'<path d="M{cx-160},330 Q{cx-180},210 {cx},180 Q{cx+180},210 {cx+160},330 L{cx-160},330 Z" fill="{color}" filter="url(#glowPurple)"/>'
    return ""

def _hijab(color: str, cx=360) -> str:
    # Pure cloak shape — the face circle is drawn on top, so the inner area is
    # naturally exposed as skin. No inner fill ellipse → keeps the avatar PNG
    # truly transparent outside the silhouette.
    return (f'<path d="M{cx-220},280 Q{cx-260},160 {cx},140 Q{cx+260},160 {cx+220},280 '
            f'L{cx+220},520 Q{cx},560 {cx-220},520 Z" fill="{color}" opacity="0.92"/>')

def _accessory(kind: str, color) -> str:
    cx, cy = 360, 335
    if kind == "glasses":
        return (f'<g stroke="{WHITE}" stroke-width="3" fill="none" opacity="0.9">'
                f'<rect x="{cx-100}" y="{cy-26}" width="60" height="40" rx="10"/>'
                f'<rect x="{cx+40}" y="{cy-26}" width="60" height="40" rx="10"/>'
                f'<line x1="{cx-40}" y1="{cy-6}" x2="{cx+40}" y2="{cy-6}"/>'
                f'</g>')
    if kind == "headphones":
        return (f'<path d="M{cx-160},340 Q{cx},{200} {cx+160},340" stroke="{color}" stroke-width="10" fill="none" filter="url(#glowCyan)"/>'
                f'<ellipse cx="{cx-160}" cy="340" rx="22" ry="32" fill="{color}" filter="url(#glowCyan)"/>'
                f'<ellipse cx="{cx+160}" cy="340" rx="22" ry="32" fill="{color}" filter="url(#glowCyan)"/>')
    if kind == "earphones":
        return (f'<circle cx="{cx-180}" cy="335" r="14" fill="{color}" filter="url(#glowCyan)"/>'
                f'<circle cx="{cx+180}" cy="335" r="14" fill="{color}" filter="url(#glowCyan)"/>')
    if kind == "earbuds":
        return (f'<circle cx="{cx-180}" cy="335" r="9" fill="{color}" filter="url(#glowCyan)"/>'
                f'<circle cx="{cx+180}" cy="335" r="9" fill="{color}" filter="url(#glowCyan)"/>')
    if kind == "headband":
        return f'<rect x="{cx-150}" y="230" width="300" height="22" rx="8" fill="{color}" filter="url(#glowPurple)"/>'
    return ""

def _hat(color, cx=360) -> str:
    return (f'<path d="M{cx-170},260 Q{cx-200},170 {cx},170 Q{cx+200},170 {cx+170},260 L{cx-170},260 Z" '
            f'fill="{color}" filter="url(#glowPurple)"/>'
            f'<ellipse cx="{cx}" cy="262" rx="170" ry="14" fill="{color}" stroke="#FFFFFF" stroke-opacity="0.6"/>')

def avatar_svg(avatar_id, hair_color, hair_style, skin, accent, expr,
               accessory, hat_color, _gender):
    cx, cy = 360, 360
    r = 180
    # Transparent avatar — only a stroke ring carries the brand accent.
    bg = (
        f'<circle cx="{cx}" cy="{cy+10}" r="{r+18}" fill="none" '
        f'stroke="{accent}" stroke-width="6" opacity="0.85" filter="url(#glowCyan)"/>'
    )
    if hair_style == "hijab":
        hair_back = _hijab(hair_color, cx)
    else:
        hair_back = _hair(hair_style, hair_color, cx)
    face    = _face_block(cx, cy, r, skin=skin)
    eyes    = _eyes(expr, cx)
    mouth   = _mouth(expr, cx)
    acc     = _accessory(accessory, accent)
    hat     = _hat(hat_color, cx) if hat_color else ""
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" role="img"
     aria-label="تحدي الإجابات player avatar {avatar_id}">
{defs()}
{bg}
{hair_back}
{face}
{eyes}
{mouth}
{acc}
{hat}
</svg>
"""

# ───────────────────────── UI icons ────────────────────────────────────────

def icon_timer() -> str:
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Timer">
{defs()}
  <circle cx="64" cy="72" r="44" fill="url(#gradBg)" stroke="url(#gradPinkPurple)"
          stroke-width="6" filter="url(#glowPink)"/>
  <rect x="56" y="14" width="16" height="14" rx="4" fill="{NEON_AMBER}" filter="url(#glowAmber)"/>
  <g stroke="{NEON_CYAN}" stroke-width="4" stroke-linecap="round" filter="url(#glowCyan)">
    <line x1="64" y1="34" x2="64" y2="42"/>
    <line x1="64" y1="102" x2="64" y2="110"/>
    <line x1="26" y1="72" x2="34" y2="72"/>
    <line x1="94" y1="72" x2="102" y2="72"/>
  </g>
  <line x1="64" y1="72" x2="64" y2="42" stroke="{NEON_PINK}" stroke-width="5"
        stroke-linecap="round" filter="url(#glowPink)"/>
  <line x1="64" y1="72" x2="86" y2="80" stroke="{WHITE}" stroke-width="4"
        stroke-linecap="round"/>
  <circle cx="64" cy="72" r="6" fill="{NEON_AMBER}" filter="url(#glowAmber)"/>
</svg>
"""

def icon_vote() -> str:
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Vote">
{defs()}
  <g filter="url(#glowPurple)">
    <rect x="14" y="22" width="100" height="84" rx="14"
          fill="url(#gradBg)" stroke="url(#gradPinkPurple)" stroke-width="4"/>
  </g>
  <rect x="28" y="38" width="60" height="6" rx="3" fill="{WHITE_SOFT}" opacity="0.75"/>
  <rect x="28" y="52" width="42" height="6" rx="3" fill="{WHITE_SOFT}" opacity="0.55"/>
  <g filter="url(#glowPink)">
    <path d="M28,80 l16,16 l40,-44" stroke="{NEON_PINK}" stroke-width="9"
          fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <circle cx="106" cy="38" r="4" fill="{NEON_CYAN}" filter="url(#glowCyan)"/>
</svg>
"""

def icon_crown() -> str:
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Crown — winner">
{defs()}
  <g transform="translate(14,18)">
    <ellipse cx="50" cy="78" rx="60" ry="6" fill="{NEON_AMBER}" opacity="0.35" filter="url(#glowAmber)"/>
    <path d="M0,72 L18,16 L36,46 L50,4 L64,46 L82,16 L100,72 Z"
          fill="url(#gradPinkPurple)" stroke="{NEON_AMBER}" stroke-width="3"
          stroke-linejoin="round" filter="url(#glowAmber)"/>
    <rect x="0" y="72" width="100" height="14" rx="4"
          fill="{NEON_AMBER}" stroke="#FFFFFF" stroke-width="2" filter="url(#glowAmber)"/>
    <circle cx="18" cy="16" r="6" fill="{NEON_CYAN}"  filter="url(#glowCyan)"/>
    <circle cx="50" cy="4"  r="7" fill="{NEON_PINK}"  filter="url(#glowPink)"/>
    <circle cx="82" cy="16" r="6" fill="{NEON_PURPLE}" filter="url(#glowPurple)"/>
    <circle cx="50" cy="79" r="5" fill="{NEON_PINK}" filter="url(#glowPink)"/>
  </g>
</svg>
"""

def icon_fire() -> str:
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Streak fire">
{defs()}
  <g filter="url(#glowAmber)">
    <path d="M64,8 C 40,40 24,56 28,82 C 32,108 56,118 64,118
             C 72,118 96,108 100,82 C 104,56 88,40 64,8 Z"
          fill="url(#gradPinkPurple)" stroke="{NEON_AMBER}" stroke-width="3"/>
    <path d="M64,32 C 50,58 44,68 46,84 C 48,100 60,104 64,104
             C 68,104 80,100 82,84 C 84,68 78,58 64,32 Z"
          fill="{NEON_AMBER}"/>
    <path d="M64,56 C 58,72 56,80 58,90 C 60,100 68,100 70,90
             C 72,80 70,72 64,56 Z" fill="{WHITE}" opacity="0.85"/>
  </g>
  <circle cx="40"  cy="40" r="3" fill="{NEON_CYAN}" filter="url(#glowCyan)"/>
  <circle cx="90"  cy="44" r="3" fill="{NEON_CYAN}" filter="url(#glowCyan)"/>
</svg>
"""


def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.strip() + "\n", encoding="utf-8")
    print(f"  wrote  {path.relative_to(ROOT)}  ({len(content)} bytes)")


def main():
    print("Generating Neon Party SVG assets …")
    print("— Logo —")
    write(SVG / "logo" / "logo-horizontal.svg", logo_horizontal())
    write(SVG / "logo" / "logo-square.svg",     logo_square())
    print("— Background —")
    write(SVG / "background" / "lobby.svg", background_lobby())
    print("— Avatars —")
    for cfg in AVATAR_CONFIGS:
        avatar_id, hair, style, skin, accent, expr, acc, hat, gender = cfg
        write(SVG / "avatars" / f"avatar-{avatar_id}.svg",
              avatar_svg(avatar_id, hair, style, skin, accent, expr, acc, hat, gender))
    print("— UI icons —")
    write(SVG / "ui" / "timer.svg", icon_timer())
    write(SVG / "ui" / "vote.svg",  icon_vote())
    write(SVG / "ui" / "crown.svg", icon_crown())
    write(SVG / "ui" / "fire.svg",  icon_fire())
    print("[Done] Neon Party assets generated.")


if __name__ == "__main__":
    main()
