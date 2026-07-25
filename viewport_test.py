"""
BottomNav full-viewport distribution test.
Screenshots at 320/375/768/1024/1440/1920px + RTL (ar/he) + LTR (en).
"""
from playwright.sync_api import sync_playwright
import os

SCREENSHOTS = []
def ss(page, name):
    path = f"/tmp/bottomnav-{name}.png"
    page.screenshot(path=path, full_page=True)
    SCREENSHOTS.append(path)
    print(f"  OK: {name}")

VIEWPORTS = [320, 375, 768, 1024, 1440, 1920]

def set_lang(page, lang):
    page.evaluate(f"localStorage.setItem('kalako_lang', '{lang}')")
    page.reload(wait_until="networkidle")
    page.wait_for_timeout(1500)

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, args=["--no-sandbox"])

    for lang, label in [('ar', 'Arabic-RTL'), ('en', 'English-LTR'), ('he', 'Hebrew-RTL')]:
        for w in VIEWPORTS:
            page = browser.new_page(viewport={"width": w, "height": 800})
            page.goto("http://localhost:5173", wait_until="networkidle")
            page.wait_for_timeout(2000)
            if lang != 'ar':
                set_lang(page, lang)
            ss(page, f"{lang}-{w}px")
            page.close()
            print(f"  {label} at {w}px")

    # Nav-only clip for 320 and 1920
    for w in [320, 1920]:
        page = browser.new_page(viewport={"width": w, "height": 800})
        page.goto("http://localhost:5173", wait_until="networkidle")
        page.wait_for_timeout(2000)
        page.screenshot(path=f"/tmp/bottomnav-navonly-{w}px.png",
                        clip={"x": 0, "y": 700, "width": w, "height": 100})
        SCREENSHOTS.append(f"/tmp/bottomnav-navonly-{w}px.png")
        print(f"  Nav-only at {w}px")
        page.close()

    browser.close()

    print()
    print("=== ALL SCREENSHOTS ===")
    for s in SCREENSHOTS:
        sz = os.path.getsize(s)
        print(f"  {s} ({sz} bytes)")
    print(f"Total: {len(SCREENSHOTS)}")
