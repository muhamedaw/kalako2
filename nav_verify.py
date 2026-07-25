"""
Verify BottomNav layout metrics: item positions, widths, gaps.
Prints numeric proof of even distribution.
"""
from playwright.sync_api import sync_playwright

VIEWPORTS = [320, 375, 768, 1024, 1440, 1920]
LANGS = ['ar', 'en', 'he']

def set_lang(page, lang):
    page.evaluate(f"localStorage.setItem('kalako_lang', '{lang}')")
    page.reload(wait_until="networkidle")
    page.wait_for_timeout(1500)

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, args=["--no-sandbox"])

    for lang in LANGS:
        print(f"\n{'='*60}")
        print(f"LANGUAGE: {lang}")
        print(f"{'='*60}")
        for w in VIEWPORTS:
            page = browser.new_page(viewport={"width": w, "height": 800})
            page.goto("http://localhost:5173", wait_until="networkidle")
            page.wait_for_timeout(2000)
            if lang != 'ar':
                set_lang(page, lang)

            # Get nav container position and size
            nav_box = page.locator('nav').bounding_box()
            inner_box = page.locator('nav > div').bounding_box()

            # Get all nav buttons
            buttons = page.locator('nav button').all()
            btn_boxes = [b.bounding_box() for b in buttons]

            print(f"\n--- {w}px ---")
            print(f"  Nav:    x={nav_box['x']:.0f} y={nav_box['y']:.0f} w={nav_box['width']:.0f} h={nav_box['height']:.0f}")
            print(f"  Inner:  x={inner_box['x']:.0f} y={inner_box['y']:.0f} w={inner_box['width']:.0f}")

            # Check nav spans full width
            nav_fills = abs(nav_box['width'] - w) < 1
            inner_fills = abs(inner_box['width'] - w) < 1
            print(f"  Nav full-width: {nav_fills} | Inner full-width: {inner_fills}")

            # Check button distribution
            if len(btn_boxes) == 5:
                centers = [b['x'] + b['width']/2 for b in btn_boxes]
                left_gap = btn_boxes[0]['x'] - inner_box['x']
                right_gap = (inner_box['x'] + inner_box['width']) - (btn_boxes[-1]['x'] + btn_boxes[-1]['width'])
                print(f"  Left gap: {left_gap:.0f}px | Right gap: {right_gap:.0f}px | Balanced: {abs(left_gap - right_gap) < 2}")

                # Play button (index 2) center vs viewport center
                play_center = centers[2]
                viewport_center = w / 2
                center_offset = abs(play_center - viewport_center)
                print(f"  Play btn center: {play_center:.0f}px | Viewport center: {viewport_center:.0f}px | Offset: {center_offset:.0f}px | Centered: {center_offset < 3}")
            else:
                print(f"  Found {len(btn_boxes)} buttons (expected 5)")

            page.close()

    browser.close()
