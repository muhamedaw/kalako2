# تحدي الإجابات — Neon Party Assets

Complete visual + audio asset pack for **تحدي الإجابات** — a Fibbage-style Arabic
party trivia game. One palette, one system. Built mobile-first, transparent PNGs,
browser-rendered intro video, programmatic SFX.

> Brand: **Neon Party**. Pink + purple primary, cyan for success, amber for
> deception. Background gradient `#12071F → #1B0E2E`. Soft glow + rounded corners
> throughout — playful Modern Game-Show, never formal.
>
> For design-token rationale see [`design-system.md`](design-system.md).

---

## 1. What ships in this folder

```
assets/
├── README.md                       ← you are here
├── design-system.md                ← tokens, glow recipes, SFX specs, export sizes
├── svg/                            ← master sources (Caïro + Tajawal via Google Fonts)
│   ├── logo/
│   │   ├── logo-horizontal.svg     1200×360 — full wordmark + crown + halo
│   │   └── logo-square.svg         512×512 — app-icon / favicon
│   ├── background/
│   │   └── lobby.svg               1080×1920 — gradient + 4 animated blob layers + twinkling stars
│   ├── avatars/avatar-01.svg .. avatar-16.svg   square 720×720, transparent
│   └── ui/
│       ├── timer.svg               128 — timer / countdown
│       ├── vote.svg                128 — ballot / voting
│       ├── crown.svg               128 — winner
│       └── fire.svg                128 — streak / "fire"
├── png/                            ← Playwright Chromium rendering, mobile sizes
│   ├── avatars/   avatar-{01..16}-{64|128|256}x{n}.png  (transparent)
│   ├── ui/        timer/vote/crown/fire-{64|128|256}x{n}.png  (transparent)
│   ├── logo/      logo-horizontal-{128|256|512|1024|2048}x{n}.png  (transparent halo)
│   ├── logo/      logo-square-{128|256|512|1024}x{n}.png  (filled bg)
│   └── background/lobby-{1080}x{1920}.png  (opaque gradient + blobs)
├── audio/                          ← 7 programmatically synthesized SFX
│   ├── player_join.wav    0.4 s   sweep 440→880 Hz
│   ├── countdown.wav      0.6 s   triangle blip stack
│   ├── submit_answer.wav  0.5 s   C3/G3 + C5/G5 pluck
│   ├── vote_start.wav     0.7 s   click + sub thump + chime
│   ├── correct.wav        1.2 s   C5–E5–G5–C6 piano arpeggio (cyan semantic)
│   ├── lie_success.wav    1.4 s   descending wub + slide whistle (amber semantic)
│   └── winner.wav         2.0 s   4-note brass fanfare with reverb tail
└── video/
    ├── intro.html        (Playwright-recording input page; standalone playable)
    ├── intro.webm        1498 kB  (always works)
    └── intro.mp4         1981 kB  (H.264 mp4, libx264, faststart; ffmpeg path)
```

---

## 2. Running the build pipeline

The four generators under `scripts/` are independent and idempotent. Run them in
this order:

```bash
python assets/scripts/build_assets.py    # 23 SVGs into assets/svg/
python assets/scripts/generate_audio.py  # 7 WAVs into assets/audio/
python assets/scripts/render_png.py      # ~50 PNGs into assets/png/
python assets/scripts/generate_video.py  # intro.webm + (intro.mp4 if ffmpeg available) into assets/video/
```

### Generator cheat sheet

| Script              | Stack                                  | Output                            |
| ------------------- | -------------------------------------- | --------------------------------- |
| `build_assets.py`   | stdlib (`string.Template`)             | 23 SVG files                      |
| `generate_audio.py` | numpy + scipy + stdlib `wave`          | 7 mono WAV (48 kHz, 16-bit)        |
| `render_png.py`     | Playwright (Chromium headless)         | ~50 transparent + opaque PNGs     |
| `generate_video.py` | Playwright (`record_video_dir`) + ffmpeg | `intro.webm` ± `intro.mp4`        |

All four scripts print ASCII-only completion messages and re-open stdout as UTF-8
to survive Windows cp1252 consoles.

---

## 3. SVG source policy

* **Arabic typography**: `font-family: 'Cairo', 'Tajawal', 'Noto Sans Arabic', system-ui, sans-serif;`
  loaded via Google Fonts `<style>` `@import`. When Chromium has internet the
  wordmark renders in Cairo Black; otherwise the system Arabic fallback handles
  the glyphs.
* **Glow**: every neon accent lives behind an `feGaussianBlur` + `feFlood`
  + `feComposite` + `feMerge` filter (`glowPink`, `glowPurple`, `glowCyan`,
  `glowAmber`, `softBlob`). Standard deviation ranges from 2 (icons) to 28
  (lobby blobs).
* **Rounded corners**: --r-sm 6, --r-md 12, --r-lg 20, --r-xl 28, --r-pill 999.
  See `design-system.md`.
* **Avatars are transparent by design.** The master SVG has no body-plate
  fill; only the head silhouette + a stroked accent ring. PNG render uses
  `omit_background=True` so the exported PNG keeps true transparency.

### Editing a single avatar

Open `assets/scripts/build_assets.py`, find the `AVATAR_CONFIGS` list, edit
the row for `avatar-NN`, then re-run the full pipeline (or just
`build_assets.py` + `render_png.py`).

---

## 4. The intro video pipeline

1. `generate_video.py` reads 5 SVG slices from `assets/svg/{avatars,logo,background}`,
   splices them into `assets/video/intro.html` (a self-contained animated page),
   and uses Playwright's `record_video_dir` to record a WebM while the page
   plays for 12.2 s.
2. If `ffmpeg` is on `PATH` (or `imageio_ffmpeg` was installed), the WebM is
   re-encoded with `libx264 -pix_fmt yuv420p -movflags +faststart` to a true
   `intro.mp4`.
3. If `ffmpeg` is missing, the WebM is still shipped and the script prints the
   one-liner conversion command:
   `ffmpeg -i assets/video/intro.webm -c:v libx264 -pix_fmt yuv420p assets/video/intro.mp4`

### Why `wait_until="load"` + bounded networkidle?

Google Fonts CDN can be slow or blocked. The script no longer hangs on
`networkidle`; it caps the wait at 4 s and falls through if fonts aren't ready.

---

## 5. PNG export pipeline notes

`render_png.py` reuses a single Playwright page across all ~50 exports. Per
asset it just calls `set_viewport_size` + `set_content` + `screenshot`, which
keeps wall-clock well under a minute.

The CSS wrapper forces:

```css
html, body { width:100%; height:100%; overflow:hidden; background:transparent; }
svg { display:block; width:100%; height:100%; }
```

Without `svg { width:100%; height:100% }`, a `720×720` viewBox avatar inside a
`64×64` viewport would overflow and the screenshot would capture the top-left
transparent edge instead of the downscaled avatar. Don't remove that rule.

---

## 6. Sound design notes

All SFX are mono, 48 kHz, 16-bit. Peak normalised to **-3 dBFS** so the game
music bus has 3 dB of headroom before clipping.

Spawned synthesis (no sample libraries):

| SFX             | Layers                                                            |
| --------------- | ------------------------------------------------------------------ |
| `player_join`   | sine sweep 440→880, harmonic 880→1760, white-noise pop              |
| `countdown`     | triangle blip x3 + fifth harmonic x3                               |
| `submit_answer` | C5 triangle + G5 triangle + C3/G3 sub                                |
| `vote_start`    | 20 ms white-noise click + 70 Hz sine thump + 1.3 kHz chime tail     |
| `correct`       | C5–E5–G5–C6 layered partials, exp decay, soft 0.25 s reverb         |
| `lie_success`   | FM body descending 330→110, slide whistle 900→1800, amber undertone  |
| `winner`        | 4-note brass (8 additive harmonics each) + cymbal hit + 0.5 s reverb |

Feel free to swap any synthesis by editing the corresponding `sfx_*` function in
`generate_audio.py`; the writer and harmonisation rules stay the same.

---

## 7. Open polish backlog (non-blocking)

The following were flagged during code review and can be addressed in a follow-up
without invalidating the current assets:

- `_hair("hairband")` in `build_assets.py` is a no-op — `avatar-16` visually
  matches a plain short cut. Replace with an explicit band path or drop the
  style.
- `sfx_winner` brass partials start at full amplitude — apply a 4–6 ms
  half-cosine fade-in per note to eliminate attack clicks.
- `noise()` reseeds internally with `int.from_bytes(b"neon", "little")` and `7`,
  bypassing the global `np.random.seed(42)`. Hoist to a module-level
  `default_rng` instance for deterministic rebuilds.
- `_extra_logo_round()` and `_extra_square()` define near-identical radial
  gradients — merge into one `gradHalo` definition.

---

## 8. Quick integration in your game

```html
<!-- 1080×1920 landing page background -->
<div class="hero" style="background:#12071F url(assets/png/background/lobby-1080x1920.png) center/cover no-repeat">

  <!-- Anywhere you need a player chip -->
  <img src="assets/png/avatars/avatar-07-128x128.png" alt="Lina" />

  <!-- Button ornament -->
  <button style="background:url(assets/svg/ui/fire.svg) right/32px no-repeat">
    Streak 7
  </button>

  <!-- Video on the landing page -->
  <video src="assets/video/intro.mp4" autoplay muted playsinline></video>
</div>

<script>
new Audio("assets/audio/countdown.wav").play();    // play SFX on cue
</script>
```
