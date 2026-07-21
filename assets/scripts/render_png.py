"""
render_png.py — Convert every SVG in assets/svg/... to mobile-optimized PNGs in
assets/png/... using Playwright (Chromium headless).

PNG export sizes
----------------
Avatars      : 64, 128, 256
Logo (mark)  : 128, 256, 512, 1024
Logo (full)  : 1024, 2048
UI icons     : 64, 128, 256
Background   : 1080x1920 (mobile portrait)

Backgrounds export with transparency OFF; everything else uses
omit_background=True to deliver true transparent PNGs.

Run:
    python assets/scripts/render_png.py
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

# Windows cp1252 hardening
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

ROOT = Path(__file__).resolve().parents[1]
SVG  = ROOT / "svg"
PNG  = ROOT / "png"
PNG.mkdir(parents=True, exist_ok=True)
(PNG / "avatars").mkdir(parents=True, exist_ok=True)
(PNG / "ui").mkdir(parents=True, exist_ok=True)
(PNG / "background").mkdir(parents=True, exist_ok=True)
(PNG / "logo").mkdir(parents=True, exist_ok=True)

# (svg relative path, list of sizes in px wide, transparent?)
JOBS = [
    # avatars: 16 files @ 64/128/256 transparent
    *(("avatars/avatar-{:02d}.svg".format(i), [64, 128, 256], True)
      for i in range(1, 17)),
    # UI icons
    ("ui/timer.svg",            [64, 128, 256], True),
    ("ui/vote.svg",             [64, 128, 256], True),
    ("ui/crown.svg",            [64, 128, 256], True),
    ("ui/fire.svg",             [64, 128, 256], True),
    # logos — horizontal keeps transparent background (gradient halo only)
    ("logo/logo-horizontal.svg", [128, 256, 512, 1024, 2048], True),
    # logos — square has full panel background; do NOT omit_background
    ("logo/logo-square.svg",     [128, 256, 512, 1024],        False),
    # background — keep gradient layered
    ("background/lobby.svg",     [(1080, 1920)],               False),
]

# ─────────────────────── HTML wrapper (key fix: SVG fills viewport) ─────────

HTML_WRAPPER = """<!doctype html>
<html><head><meta charset="utf-8">
<style>
  html, body { margin:0; padding:0; width:100%; height:100%;
               background:transparent; overflow:hidden; }
  body { display:flex; align-items:stretch; justify-content:stretch; }
  /* Critical: SVG fills viewport so viewBox scales — without this,
     a 720x720 avatar inside a 64x64 viewport overflows and the
     screenshot captures empty / off-canvas pixels. */
  svg  { display:block; width:100%; height:100%; }
</style>
</head>
<body>{svg}</body></html>
"""

async def render_one_inplace(page, svg_path: Path, out_path: Path,
                             w: int, h: int, transparent: bool):
    raw = svg_path.read_text(encoding="utf-8")
    raw = raw.replace('<?xml version="1.0" encoding="UTF-8"?>', "").strip()
    html = HTML_WRAPPER.replace("{svg}", raw)
    await page.set_viewport_size({"width": w, "height": h})
    # 'load' is enough; we don't depend on perfect networkidle from Google Fonts
    await page.set_content(html, wait_until="load", timeout=15_000)
    # Brief beat so layout + Cairo font settle
    await page.wait_for_timeout(700)
    await page.screenshot(
        path=str(out_path),
        omit_background=transparent,
        clip={"x": 0, "y": 0, "width": w, "height": h},
    )
    return out_path


async def main():
    print(f"Rendering PNGs -> {PNG}")
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=["--disable-web-security"])
        try:
            # Reuse a single page across all exports — set_viewport_size +
            # set_content swap content cheaply; new-page-per-export was the
            # dominant build-time bottleneck.
            page = await browser.new_page()
            for src_rel, sizes, transparent in JOBS:
                src = SVG / src_rel
                stem = Path(src_rel).stem
                sub = PNG / Path(src_rel).parent
                sub.mkdir(parents=True, exist_ok=True)
                for sz in sizes:
                    if isinstance(sz, tuple):
                        w, h = sz
                    else:
                        w = h = sz
                    out = sub / f"{stem}-{w}x{h}.png"
                    try:
                        await render_one_inplace(page, src, out, w, h, transparent)
                        print(f"  built  {out.relative_to(ROOT)}  transparent={transparent}")
                    except Exception as e:
                        print(f"  FAILED {out.relative_to(ROOT)}: {e}", file=sys.stderr)
            await page.close()
        finally:
            await browser.close()
    print("[Done] PNG assets rendered.")


if __name__ == "__main__":
    asyncio.run(main())
