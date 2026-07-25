import re, json
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('https://kalako-client.vercel.app', wait_until='networkidle', timeout=15000)
    page.wait_for_timeout(3000)

    # Screenshot home screen
    page.screenshot(path='/tmp/home-screen.png', full_page=True)
    print("Home screen screenshot saved")

    # Check page text
    text = page.inner_text('body')
    print("Page text preview:", text[:300])

    # Find websocket URL in page content
    html = page.content()
    # look for socket URL patterns
    for match in re.finditer(r'(?:VITE_SOCKET_URL|socket\.io|connect.*?wss?://[^\s"\'<>]+)', html):
        print("Found:", match.group())
    
    # check console logs for connection info
    logs = []
    page.on('console', lambda msg: logs.append(msg.text))
    
    # Try clicking a button to trigger socket connection
    buttons = page.locator('button').all()
    print(f"Found {len(buttons)} buttons")
    for b in buttons:
        txt = b.inner_text().strip()
        if txt:
            print(f"  Button: '{txt[:40]}'")
    
    # Take interaction screenshot
    page.screenshot(path='/tmp/home-buttons.png', full_page=True)

    browser.close()
