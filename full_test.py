"""
Full 2-browser game test: create room -> join -> answer -> vote -> results
Screenshots at every step.
"""
import sys
from playwright.sync_api import sync_playwright

SCREENSHOTS = []
def ss(page, name):
    path = f"/tmp/kalako-{name}.png"
    page.screenshot(path=path, full_page=True)
    SCREENSHOTS.append(path)
    print(f"  OK: {name}")

def find_btn(page, keywords):
    btns = page.locator('button')
    for i in range(btns.count()):
        txt = btns.nth(i).inner_text()
        for kw in keywords:
            if kw in txt:
                return btns.nth(i)
    return None

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, args=["--no-sandbox"])

    # ========== Player 1 ==========
    p1 = browser.new_page()
    p1.goto("http://localhost:5173", wait_until="networkidle")
    p1.wait_for_timeout(2000)
    ss(p1, "01-p1-welcome")

    # Click first arcade-btn (Play Online)
    p1.locator('button.arcade-btn').first.click()
    p1.wait_for_timeout(1500)
    ss(p1, "02-p1-create-room")

    p1.locator('input').first.fill("Player1")
    p1.wait_for_timeout(500)
    p1.locator('button.arcade-btn').first.click()
    p1.wait_for_timeout(3000)
    ss(p1, "03-p1-lobby")

    # Extract room code
    room_code = "ABCDEF"
    for el in p1.locator('text=/[A-Z0-9]{4,8}/').all():
        t = el.inner_text().strip()
        if len(t) >= 4 and len(t) <= 8:
            room_code = t
            break
    print(f"  Room code: {room_code}")

    # ========== Player 2 ==========
    p2 = browser.new_page()
    p2.goto("http://localhost:5173", wait_until="networkidle")
    p2.wait_for_timeout(2000)
    ss(p2, "04-p2-welcome")

    # Click "Join" button
    btn = find_btn(p2, ['Join', 'انضم'])
    if btn:
        btn.click()
    p2.wait_for_timeout(1500)
    ss(p2, "05-p2-join-room")

    inputs = p2.locator('input')
    inputs.nth(0).fill("Player2")
    if inputs.count() > 1:
        inputs.nth(1).fill(room_code)
    p2.wait_for_timeout(300)

    btn = find_btn(p2, ['Join', 'انضم'])
    if btn:
        btn.click()
    p2.wait_for_timeout(3000)
    ss(p2, "06-p2-lobby")
    p1.wait_for_timeout(1000)
    ss(p1, "07-p1-lobby-ready")

    # ========== Start ==========
    btn = find_btn(p1, ['Start', 'ابدأ'])
    if btn:
        btn.click()
    p1.wait_for_timeout(3000)
    ss(p1, "08-p1-category-pick")
    p2.wait_for_timeout(2000)
    ss(p2, "09-p2-waiting")

    # Pick category
    cat_btns = p1.locator('button')
    if cat_btns.count() > 1:
        cat_btns.nth(1).click()
        p1.wait_for_timeout(2000)
        ss(p1, "10-p1-answering")
        p2.wait_for_timeout(2000)
        ss(p2, "11-p2-answering")

        p1.locator('input').first.fill("Fake answer 1")
        p1.wait_for_timeout(300)
        ss(p1, "12-p1-answer-typed")
        p2.locator('input').first.fill("Fake answer 2")
        p2.wait_for_timeout(300)
        ss(p2, "13-p2-answer-typed")

        btn = find_btn(p1, ['Submit', 'إرسال'])
        if btn:
            btn.click()
        p1.wait_for_timeout(2000)
        ss(p1, "14-p1-submitted")

        btn = find_btn(p2, ['Submit', 'إرسال'])
        if btn:
            btn.click()
        p2.wait_for_timeout(3000)
        ss(p2, "15-p2-submitted")

        # Voting
        p1.wait_for_timeout(3000)
        ss(p1, "16-p1-voting")
        p2.wait_for_timeout(2000)
        ss(p2, "17-p2-voting")

        # Vote
        p1_btns = p1.locator('button')
        if p1_btns.count() > 1:
            p1_btns.nth(1).click()
            p1.wait_for_timeout(2000)
            ss(p1, "18-p1-voted")

        p2_btns = p2.locator('button')
        if p2_btns.count() > 1:
            p2_btns.nth(1).click()
            p2.wait_for_timeout(3000)
            ss(p2, "19-p2-voted")

        # Results
        p1.wait_for_timeout(3000)
        ss(p1, "20-p1-results")
        p2.wait_for_timeout(2000)
        ss(p2, "21-p2-results")

        p1.wait_for_timeout(5000)
        ss(p1, "22-p1-after")
        p2.wait_for_timeout(1000)
        ss(p2, "23-p2-after")

    p1.close()
    p2.close()
    browser.close()

    print()
    print("=== ALL SCREENSHOTS ===")
    for s in SCREENSHOTS:
        print(f"  {s}")
    print(f"Total: {len(SCREENSHOTS)}")
