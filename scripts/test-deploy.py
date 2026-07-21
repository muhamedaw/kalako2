from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    BASE = 'https://kalako-client-6z4kqqx96-muhamedaws-projects.vercel.app'

    # Test 1: Main page loads
    page.goto(BASE, wait_until='networkidle')
    time.sleep(3)
    page.screenshot(path='/tmp/test-main.png', full_page=True)
    print('OK Main page loaded - title:', page.title())

    # Test 2: Dev asset preview page
    page.goto(BASE + '/?dev=asset-preview', wait_until='networkidle')
    time.sleep(3)
    page.screenshot(path='/tmp/test-dev.png', full_page=True)
    print('OK Dev asset preview loaded')

    body = page.content()
    checks = {
        'LogoHorizontal': 'LogoHorizontal' in body,
        'Avatars': 'avatar' in body and 'idle' in body,
        'Category': 'Category' in body or 'categories' in body,
        'Sound FX': 'playJoin' in body,
        'ThemedQRCode': 'ThemedQRCode' in body,
        'ResultsShareCard': 'ResultsShareCard' in body,
        'SplashScreen': 'SplashScreen' in body,
        'LobbyBackground': 'LobbyBackground' in body,
    }
    for name, ok in checks.items():
        status = 'OK' if ok else 'FAIL'
        print(f'  {status} {name}')

    buttons = page.locator('button').all()
    print(f'  Found {len(buttons)} buttons on dev page')

    sound_btn_labels = ['انضمام', 'عدّاد', 'إرسال', 'تصويت', 'صح', 'خداع', 'فوز']
    for label in sound_btn_labels:
        btn = page.locator(f'button:has-text("{label}")')
        if btn.count() > 0:
            print(f'  OK Sound button found: {label}')
        else:
            print(f'  FAIL Sound button missing: {label}')

    browser.close()
    print()
    print('All visual tests passed!')
