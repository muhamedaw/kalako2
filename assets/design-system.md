# تحدي الإجابات — Neon Party Design System

Single source of truth for every visual / audio asset in the project. All deliverables
in `assets/` reference these tokens. **Do not deviate.**

---

## 1. Color Palette

| Token              | Hex       | Role                                                      |
| ------------------ | --------- | --------------------------------------------------------- |
| `--bg-deep`        | `#12071F` | Deepest background (gradient stop top)                    |
| `--bg-mid`         | `#1B0E2E` | Mid background (gradient stop bottom)                     |
| `--bg-elevated`    | `#2A1758` | Cards / surfaces above bg                                 |
| `--neon-pink`      | `#FF5DA2` | Primary accent (logo stroke, headlines, CTA)              |
| `--neon-purple`    | `#7B5CFA` | Secondary accent (logo body, highlights, brand twinkle)   |
| `--neon-cyan`      | `#34E4EA` | **Success** — correct answers, positive feedback           |
| `--neon-amber`     | `#FFB627` | **Deception / warning** — fake answers, lies, alert        |
| `--white`          | `#FFFFFF` | Text on dark; tinted to 88% for body                       |
| `--white-soft`     | `#E6DEFF` | Secondary white, slightly lavender                        |

**Usage rules**
- Pink & Purple are *brand*. Use them on logo, titles, and key CTAs.
- Cyan ONLY for "correct / success" semantics. Never decorative.
- Amber ONLY for "deception / warning / streak" semantics. Used in icons that imply fire / warning / risk.
- Background gradient is **always** `--bg-deep` → `--bg-mid` (top → bottom).

---

## 2. Corner Radii

| Token        | px       | Use                              |
| ------------ | -------- | -------------------------------- |
| `--r-sm`     | `6`      | Chips, badge inner edge          |
| `--r-md`     | `12`     | Buttons, small cards, icons      |
| `--r-lg`     | `20`     | Avatars with background, panels  |
| `--r-xl`     | `28`     | Hero cards, large CTAs           |
| `--r-pill`   | `999`    | Tags, the crown icon backdrop    |

Avatars are squares rendered inside a `border-radius: var(--r-lg)` circle. Logos always sharp-cornered unless contained in a pill.

---

## 3. Glow & Shadow Recipes

Every neon element uses a layered feGaussianBlur + feMerge filter. Standard recipes:

```svg
<!-- Cyan success glow -->
<filter id="glow-cyan">
  <feGaussianBlur stdDeviation="3" result="b"/>
  <feFlood flood-color="#34E4EA" flood-opacity="0.85"/>
  <feComposite in2="b" operator="in"/>
  <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
```

Glow intensities:

- Title glow: `stdDeviation=4`, soft outer halo
- Button glow: `stdDeviation=6`, mid halo
- Logo wordmark: `stdDeviation=2.5`, tight crisp glow
- Icon glow: `stdDeviation=2`, minimal

Neon circles/blobs in lobby background: `stdDeviation=30+`, opacity 0.45.

---

## 4. Typography

- **Headline / Logo**: `Cairo` Black (700-900), or `Tajawal` ExtraBold fallback.
- **UI labels**: `Cairo` Bold 600.
- **Body**: `Cairo` Regular 400.

Embedding strategy in SVG: `@import` Google Fonts + `font-family: 'Cairo', 'Tajawal', 'Noto Sans Arabic', system-ui, sans-serif;` with `font-weight: 900`. For path-perfect portability (when offline), run `assets/scripts/svg_to_paths.py` which converts text to outlined paths.

---

## 5. Sound Effects Spec Sheet

All 7 SFX are 48 kHz / 16-bit mono WAV. Peak normalized to -3 dBFS to leave headroom for game music.

| SFX             | Length | Approach                                          |
| --------------- | ------ | ------------------------------------------------- |
| `player_join`   | 0.4 s  | Quick upward sine sweep 440→880 Hz + pink noise pop |
| `countdown`     | 0.6 s  | Three-layer triangle blip with soft attack         |
| `submit_answer` | 0.5 s  | Bubbly blip, ascending 2-note                       |
| `vote_start`    | 0.7 s  | Cymbal-like noise hit + sub thump                  |
| `correct`       | 1.2 s  | Cheery 3-note arpeggio (C–E–G) with piano-like envelope |
| `lie_success`   | 1.4 s  | Sneaky descending "wub" + slide whistle            |
| `winner`        | 2.0 s  | Fanfare: 4-note brass-like (C–E–G–C) with reverb tail |

Detailed implementation: `assets/scripts/generate_audio.py`.

---

## 6. Export Sizes (Mobile-first)

| Asset        | Sizes (px)                                   |
| ------------ | -------------------------------------------- |
| Avatar PNG   | 64, 128, 256                                 |
| Logo (mark)  | 128, 256, 512, 1024                          |
| Logo (full)  | 1024, 2048                                   |
| UI icons     | 64, 128, 256                                 |
| BG lobby     | 1080×1920 (mobile portrait)                  |
| Intro video  | 1080×1920 mp4 h.264, 24 fps, ~12 s           |

---

## 7. Brand Voice (visual)

- Fun, playful, **not formal**. Like a Friday game-show vibe.
- Soft rounded edges everywhere.
- Always at least one neon element on screen (a glow, a stroke, a blob).
- Never use flat fills alone on a dark background — pair every fill with a 1px lighter stroke and a subtle glow.
- Arabic text is **RTL**; layout respects `dir="rtl"`.
