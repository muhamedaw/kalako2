"""
Screenshot verification for all 3 tasks:
1. Wordmark warm glow (3 languages)
2. AboutCredits screen
3. Disconnect badge in Lobby (simulated)
"""
from playwright.sync_api import sync_playwright
import os, sys

SCREENSHOTS = []
def ss(page, name):
    path = f"/tmp/verify-{name}.png"
    page.screenshot(path=path, full_page=True)
    SCREENSHOTS.append(path)
    print(f"  OK: {name}")

def set_lang(page, lang):
    page.evaluate(f"localStorage.setItem('kalako_lang', '{lang}')")
    page.reload(wait_until="networkidle")
    page.wait_for_timeout(2000)

VIEWPORTS = [375, 1440]

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, args=["--no-sandbox"])

    # ====== Task 1: Wordmark screenshots (all 3 languages) ======
    for lang, label in [('ar', 'Arabic'), ('en', 'English'), ('he', 'Hebrew')]:
        page = browser.new_page(viewport={"width": 375, "height": 800})
        page.goto("http://localhost:5173", wait_until="networkidle")
        page.wait_for_timeout(2000)
        if lang != 'ar':
            set_lang(page, lang)
        ss(page, f"wordmark-{lang}-375px")
        page.close()

    # Wide viewport for ar
    for lang in ['ar', 'en']:
        page = browser.new_page(viewport={"width": 1440, "height": 800})
        page.goto("http://localhost:5173", wait_until="networkidle")
        page.wait_for_timeout(2000)
        if lang != 'ar':
            set_lang(page, lang)
        ss(page, f"wordmark-{lang}-1440px")
        page.close()

    # ====== Task 2: AboutCredits screen ======
    for lang, label in [('ar', 'Arabic'), ('en', 'English')]:
        page = browser.new_page(viewport={"width": 375, "height": 800})
        page.goto("http://localhost:5173", wait_until="networkidle")
        page.wait_for_timeout(2000)
        if lang != 'ar':
            set_lang(page, lang)
        # Navigate to about screen
        page.evaluate("""
            // Access zustand store and set screen
        """)
        # Click settings gear
        settings_btn = page.locator('button[aria-label="settings"]')
        if settings_btn.count() > 0:
            settings_btn.click()
            page.wait_for_timeout(800)
            # Click "About" button
            about_btn = page.locator('button').filter(has_text=lang == 'en' and 'About' or lang == 'he' and 'על' or 'عن')
            for b in about_btn.all():
                txt = b.inner_text()
                if 'عن' in txt or 'About' in txt or 'על' in txt:
                    b.click()
                    break
        page.wait_for_timeout(2000)
        ss(page, f"about-{lang}")
        page.close()

    # ====== Task 3: Full game loop with disconnect check ======
    # Player 1 creates room -> lobby -> Player 2 joins -> check disconnect badge
    p1 = browser.new_page(viewport={"width": 375, "height": 800})
    p1.goto("http://localhost:5173", wait_until="networkidle")
    p1.wait_for_timeout(2000)
    p1.locator('button.arcade-btn').first.click()
    p1.wait_for_timeout(1500)
    p1.locator('input').first.fill("Host")
    p1.locator('button.arcade-btn').first.click()
    p1.wait_for_timeout(3000)
    ss(p1, "lobby-p1-alone")

    # Get room code
    room_code = "ABCDEF"
    for el in p1.locator('text=/[A-Z0-9]{4,8}/').all():
        t = el.inner_text().strip()
        if len(t) >= 4 and len(t) <= 8:
            room_code = t
            break
    print(f"  Room code: {room_code}")

    # Player 2 joins
    p2 = browser.new_page(viewport={"width": 375, "height": 800})
    p2.goto("http://localhost:5173", wait_until="networkidle")
    p2.wait_for_timeout(2000)
    # Click Join
    for b in p2.locator('button').all():
        txt = b.inner_text()
        if 'انضم' in txt:
            b.click()
            break
    p2.wait_for_timeout(1500)
    p2.locator('input').nth(0).fill("Guest")
    if p2.locator('input').count() > 1:
        p2.locator('input').nth(1).fill(room_code)
    p2.wait_for_timeout(300)
    for b in p2.locator('button').all():
        txt = b.inner_text()
        if 'انضم' in txt:
            b.click()
            break
    p2.wait_for_timeout(3000)
    ss(p1, "lobby-both-connected")

    # Close P2 to simulate disconnect
    p2.close()
    p1.wait_for_timeout(3000)
    ss(p1, "lobby-p2-disconnected")

    # Start game
    for b in p1.locator('button').all():
        txt = b.inner_text()
        if 'ابدأ' in txt:
            b.click()
            break
    p1.wait_for_timeout(2000)
    ss(p1, "lobby-after-disconnect-start")

    p1.close()
    browser.close()

    print()
    print("=== SCREENSHOTS ===")
    for s in SCREENSHOTS:
        sz = os.path.getsize(s)
        print(f"  {s} ({sz} bytes)")
    print(f"Total: {len(SCREENSHOTS)}")
