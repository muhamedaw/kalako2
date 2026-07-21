import sys
from playwright.sync_api import sync_playwright
import time

def log(msg):
    print(msg)
    sys.stdout.flush()

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    # Test 1: Dev asset preview
    page.goto('https://kalako-client.vercel.app/?dev=asset-preview', wait_until='networkidle')
    time.sleep(3)
    page.screenshot(path='/tmp/test-dev-final.png', full_page=True)
    html = page.content()
    checks = [
        ('Asset Preview', 'Asset Preview' in html),
        ('Avatars', 'Avatars' in html),
        ('Sound Effects', 'Sound Effects' in html),
        ('Themed QR', 'Themed' in html),
        ('Share Card', 'Share Card' in html),
        ('Splash Screen', 'Splash Screen' in html),
        ('Lobby Background', 'Lobby Background' in html),
    ]
    passed = sum(1 for _, ok in checks if ok)
    for name, ok in checks:
        log('%s: %s' % ('PASS' if ok else 'FAIL', name))
    log('Dev page: %d/%d passed' % (passed, len(checks)))

    # Test 2: Welcome screen
    page.goto('https://kalako-client.vercel.app', wait_until='networkidle')
    time.sleep(3)
    html = page.content()
    welcome_ok = 'إنشاء' in html or 'Welcome' in html
    log('%s: Welcome screen' % ('PASS' if welcome_ok else 'FAIL'))

    # Count buttons
    btns = page.locator('button').all()
    log('  Buttons: %d' % len(btns))

    # Test 3: Create room screen
    create_btn = page.locator('button:has-text("إنشاء")')
    if create_btn.count() > 0:
        create_btn.first.click()
        time.sleep(2)
        html = page.content()
        create_ok = 'ScoreMultiplier' in html or 'BlindVote' in html or 'FamilyAdults' in html or 'مضاعف' in html
        log('%s: Create room advanced options' % ('PASS' if create_ok else 'FAIL'))
    else:
        log('FAIL: Create button not found')

    browser.close()
    log('All integration tests complete!')
