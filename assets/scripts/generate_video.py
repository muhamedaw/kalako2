"""
generate_video.py — Produce the 12-second landing-page intro video for
"تحدي الإجابات".

Approach
--------
1. Build a self-contained HTML page (assets/video/intro.html) that animates the
   brand mark, animated lobby blobs, a few avatars and a CTA in a 1080x1920 layout.
2. Use Playwright headless Chromium with `record_video_dir` to record a WebM
   while the page plays for ~12.2 seconds.
3. If ffmpeg is found on PATH (or imageio-ffmpeg installs), convert WebM -> MP4.
4. Always deliver assets/video/intro.webm. If MP4 conversion succeeds, also
   produce assets/video/intro.mp4.
"""

from __future__ import annotations

import asyncio
import shutil
import subprocess
import sys
from pathlib import Path

# Windows cp1252 hardening
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

ROOT = Path(__file__).resolve().parents[1] 
SVG  = ROOT / "svg"
VIDEO = ROOT / "video"
VIDEO.mkdir(parents=True, exist_ok=True)
INTRO_HTML = VIDEO / "intro.html"

W, H = 1080, 1920
DURATION_S = 12.2  # a hair longer than the 12 s target so it doesn't clip

# ──────────────── inline SVG slices used in the intro ───────────────────────

def _read_svg(rel: str) -> str:
    raw = (SVG / rel).read_text(encoding="utf-8")
    return raw.replace('<?xml version="1.0" encoding="UTF-8"?>', "").strip()

LOBBY_BG    = _read_svg("background/lobby.svg")
LOGO_FULL   = _read_svg("logo/logo-horizontal.svg")
LOGO_MARK   = _read_svg("logo/logo-square.svg")
AVATARS     = [_read_svg(f"avatars/avatar-{i:02d}.svg") for i in (1, 5, 9, 12, 16)]
# only need 5 avatars shown, but keep styling consistent

# ──────────────── intro HTML ─────────────────────────────────────────────────

INTRO_HTML_TEMPLATE = """<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<title>تحدي الإجابات — Intro</title>
<style>
  html, body {{ margin:0; padding:0; width:1080px; height:1920px;
                background:#12071F; overflow:hidden; font-family:'Cairo','Tajawal',
                'Noto Sans Arabic',system-ui,sans-serif; color:#FFFFFF; }}
  body {{ display:flex; flex-direction:column; align-items:center; justify-content:center;
          position:relative; }}
  /* Animated background layer */
  .bg {{ position:absolute; inset:0; z-index:0;
         background:
            radial-gradient(60% 50% at 20% 25%, #FF5DA233 0%, transparent 60%),
            radial-gradient(50% 50% at 80% 60%, #7B5CFA33 0%, transparent 60%),
            radial-gradient(40% 40% at 25% 80%, #34E4EA22 0%, transparent 60%),
            linear-gradient(180deg, #12071F 0%, #1B0E2E 100%);
         animation: bgPulse 8s ease-in-out infinite alternate; }}
  @keyframes bgPulse {{ from{{filter:hue-rotate(0deg) brightness(1)}} to{{filter:hue-rotate(20deg) brightness(1.15)}} }}

  /* Floating particles */
  .stars {{ position:absolute; inset:0; z-index:1; }}
  .stars span {{ position:absolute; background:#FFFFFF; border-radius:50%; opacity:.9;
                 animation: twinkle 3s ease-in-out infinite; }}
  @keyframes twinkle {{ 0%,100%{{opacity:.2}} 50%{{opacity:1}} }}
  .stars span:nth-child(1) {{ left:8%;  top:18%; width:6px;  height:6px;  animation-delay:0s; }}
  .stars span:nth-child(2) {{ left:80%; top:14%; width:4px;  height:4px;  animation-delay:.6s; }}
  .stars span:nth-child(3) {{ left:70%; top:38%; width:5px;  height:5px;  animation-delay:1.1s; }}
  .stars span:nth-child(4) {{ left:14%; top:46%; width:5px;  height:5px;  animation-delay:1.7s; }}
  .stars span:nth-child(5) {{ left:88%; top:64%; width:4px;  height:4px;  animation-delay:.4s; }}
  .stars span:nth-child(6) {{ left:18%; top:72%; width:6px;  height:6px;  animation-delay:2.1s; }}
  .stars span:nth-child(7) {{ left:60%; top:82%; width:3px;  height:3px;  animation-delay:1.4s; }}

  /* Logo reveal — phase 0–3 s */
  .logo-wrap {{ position:absolute; top:14%; left:50%; transform:translate(-50%,0) scale(.7);
                opacity:0; animation: logoIn 1.6s cubic-bezier(.2,1.2,.4,1) 0.4s forwards; }}
  @keyframes logoIn {{
    0%   {{ opacity:0; transform:translate(-50%,0) scale(.6) rotate(-6deg); }}
    60%  {{ opacity:1; transform:translate(-50%,-4%) scale(1.05) rotate(0deg); }}
    100% {{ opacity:1; transform:translate(-50%,0) scale(1) rotate(0deg); }}
  }}
  .logo-wrap svg {{ width:760px; height:auto; }}
  .pulse-glow {{ animation: pulse 2.4s ease-in-out infinite alternate; }}
  @keyframes pulse {{
    from {{ filter: drop-shadow(0 0 8px #FF5DA2) drop-shadow(0 0 22px #7B5CFA); }}
    to   {{ filter: drop-shadow(0 0 18px #FF5DA2) drop-shadow(0 0 44px #7B5CFA66); }}
  }}

  /* Tagline */
  .tagline {{ position:absolute; top:38%; left:50%; transform:translate(-50%,30px);
              opacity:0; font-weight:900; font-size:64px; text-align:center;
              background:linear-gradient(90deg,#FF5DA2,#7B5CFA);
              -webkit-background-clip:text; background-clip:text; color:transparent;
              animation: tagIn 1.2s ease-out 1.6s forwards; letter-spacing:-1px; }}
  @keyframes tagIn {{ to {{ opacity:1; transform:translate(-50%,0); }} }}
  .subline {{ position:absolute; top:46%; left:50%; transform:translate(-50%,30px);
              opacity:0; font-size:36px; color:#E6DEFF; text-align:center;
              animation: tagIn 1.2s ease-out 2.2s forwards; }}

  /* Avatars row */
  .avatars {{ position:absolute; top:53%; left:50%; transform:translate(-50%,30px);
              opacity:0; display:flex; gap:32px; direction:ltr;
              animation: avatarIn 1.0s ease-out 3.4s forwards; }}
  @keyframes avatarIn {{ to {{ opacity:1; transform:translate(-50%,0); }} }}
  .avatar {{ width:160px; height:160px; border-radius:40px; overflow:hidden;
             box-shadow:0 0 24px #7B5CFA55, 0 0 6px #FF5DA233 inset;
             background:#1B0E2E; animation: bob 4s ease-in-out infinite alternate; }}
  .avatar:nth-child(2) {{ animation-delay:.6s }}
  .avatar:nth-child(3) {{ animation-delay:1.2s }}
  .avatar:nth-child(4) {{ animation-delay:1.8s }}
  .avatar:nth-child(5) {{ animation-delay:2.4s }}
  @keyframes bob {{ from {{ transform:translateY(0); }} to {{ transform:translateY(-14px); }} }}

  /* CTA button */
  .cta {{ position:absolute; top:70%; left:50%; transform:translate(-50%,30px);
          opacity:0; padding:36px 96px; font-size:64px; font-weight:900; color:#FFFFFF;
          background:linear-gradient(90deg,#FF5DA2,#7B5CFA);
          border-radius:28px; box-shadow:0 0 60px #FF5DA2aa, 0 0 120px #7B5CFA66;
          animation: ctaIn 1.0s cubic-bezier(.2,1.2,.4,1) 6.5s forwards; }}
  @keyframes ctaIn {{
    0%   {{ opacity:0; transform:translate(-50%,40px) scale(.9); }}
    100% {{ opacity:1; transform:translate(-50%,0)    scale(1); }}
  }}
  .cta-ring {{ position:absolute; top:0; left:0; right:0; bottom:0;
               border-radius:inherit; pointer-events:none;
               animation: ring 2.4s ease-in-out infinite; }}
  @keyframes ring {{
    0%,100% {{ box-shadow:0 0 0 0   #FFFFFF00; }}
    50%     {{ box-shadow:0 0 0 14px #FFFFFF22; }}
  }}

  /* Footer + micro line */
  .microcopy {{ position:absolute; bottom:6%; left:50%; transform:translateX(-50%);
                font-size:24px; color:#E6DEFF; opacity:0; letter-spacing:1px;
                animation: tagIn .9s ease-out 9s forwards; }}
  .tiny {{ font-size:20px; opacity:.8; }}

  /* Fade-out tail */
  .fadeout {{ position:absolute; inset:0; background:#12071F; opacity:0;
              animation: fadeOut 1.2s ease-in 11.0s forwards; z-index:99; }}
  @keyframes fadeOut {{ to {{ opacity:1; }} }}
</style>
</head>
<body>
  <div class="bg"></div>
  <div class="stars"><span></span><span></span><span></span><span></span>
                     <span></span><span></span><span></span></div>

  <div class="logo-wrap pulse-glow">{logo_full}</div>

  <div class="tagline">اسحب · اخدع · فز</div>
  <div class="subline">لعبة خداع جماعية بنكهة عربية</div>

  <div class="avatars">
    {avatars_inline}
  </div>

  <div class="cta">ابدأ اللعب<div class="cta-ring"></div></div>

  <div class="microcopy" style="top:auto; bottom:9%;">تحدّي الإجابات · Neon Party Edition</div>

  <div class="fadeout"></div>
</body>
</html>
"""

AVATAR_LINE = '<div class="avatar">{svg}</div>'

def build_intro_html() -> str:
    avatars_inline = "\n    ".join(AVATAR_LINE.format(svg=a) for a in AVATARS)
    return INTRO_HTML_TEMPLATE.format(
        logo_full=LOGO_FULL, avatars_inline=avatars_inline)


# ──────────────── recording ─────────────────────────────────────────────────

async def record_webm() -> Path:
    """Record the intro page to a WebM via Playwright's built-in recorder."""
    INTRO_HTML.write_text(build_intro_html(), encoding="utf-8")
    out_dir = VIDEO / "_recording"
    out_dir.mkdir(parents=True, exist_ok=True)

    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=[
            "--no-sandbox", "--disable-web-security",
        ])
        try:
            context = await browser.new_context(
                viewport={"width": W, "height": H},
                record_video_dir=str(out_dir),
                record_video_size={"width": W, "height": H},
                color_scheme="dark",
            )
            page = await context.new_page()
            # Use 'load' (not 'networkidle') so we don't hang on flaky CDNs.
            # Add a short, bounded networkidle chase as a best-effort font wait.
            await page.goto(f"file://{INTRO_HTML.resolve()}",
                            wait_until="load", timeout=15_000)
            try:
                await page.wait_for_load_state("networkidle", timeout=4_000)
            except Exception:
                pass
            await page.wait_for_timeout(800)
            await page.wait_for_timeout(int(DURATION_S * 1000))
            await page.close()
            await context.close()
        finally:
            await browser.close()

    # Playwright writes a single .webm in out_dir.
    webms = list(out_dir.glob("*.webm"))
    if not webms:
        raise RuntimeError("Playwright did not produce a WebM file.")
    src = max(webms, key=lambda f: f.stat().st_mtime)
    dest = VIDEO / "intro.webm"
    shutil.move(str(src), str(dest))
    return dest


def _ffmpeg_path() -> str | None:
    """Return ffmpeg executable path or None."""
    on_path = shutil.which("ffmpeg")
    if on_path:
        return on_path
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return None


def convert_webm_to_mp4(webm: Path) -> Path | None:
    ffmpeg = _ffmpeg_path()
    if not ffmpeg:
        return None
    mp4 = webm.with_suffix(".mp4")
    cmd = [
        ffmpeg, "-y", "-i", str(webm),
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "slow",
        "-crf", "20", "-movflags", "+faststart",
        "-an",  # no audio track in the intro
        str(mp4),
    ]
    print(f"  ffmpeg found: {ffmpeg}")
    print(f"  running: {' '.join(cmd)}")
    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
        print(f"  wrote {mp4.relative_to(ROOT)}")
        return mp4
    except subprocess.CalledProcessError as e:
        print("  ffmpeg failed:", e.stderr[-400:], file=sys.stderr)
        return None


async def main():
    print(f"Recording intro -> {VIDEO}")
    webm = await record_webm()
    print(f"  wrote {webm.relative_to(ROOT)}  ({webm.stat().st_size//1024} kB)")
    mp4 = convert_webm_to_mp4(webm)
    if mp4:
        print(f"[Done] Intro delivered as WebM + MP4.")
    else:
        print("[Done] Intro delivered as WebM. "
              "To convert to MP4: ffmpeg -i intro.webm -c:v libx264 -pix_fmt yuv420p intro.mp4")


if __name__ == "__main__":
    asyncio.run(main())
