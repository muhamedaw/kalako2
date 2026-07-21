import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 390, "height": 844})
    
    page.goto('http://localhost:5173')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)
    
    page.screenshot(path='C:\\Users\\Muhammed\\Desktop\\kalako2\\screenshot-welcome.png', full_page=True)
    print("Welcome screenshot taken")
    
    title = page.title()
    print(f"Title: {title}")
    
    content = page.content()
    print(f"Has Arabic content: {'klaako' in content.lower() or any(ord(c) > 0x0600 for c in content)}")
    
    direction = page.get_attribute('html', 'dir')
    print(f"Direction: {direction}")
    
    lang = page.get_attribute('html', 'lang')
    print(f"Lang: {lang}")
    
    # Click create room
    create_btn = page.locator('button:has-text("إنشاء غرفة جديدة")')
    if create_btn.count() > 0:
        create_btn.click()
        page.wait_for_timeout(1000)
        page.screenshot(path='C:\\Users\\Muhammed\\Desktop\\kalako2\\screenshot-create.png', full_page=True)
        print("Create room screenshot taken")
    
    browser.close()
    print("Done!")
