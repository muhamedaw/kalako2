"""Verify room settings survive a detour to Premium/Store and back."""
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from playwright.sync_api import sync_playwright

URL = 'https://kalako-client.vercel.app'

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    page.goto(URL, wait_until='networkidle', timeout=30000)
    page.wait_for_timeout(3000)
    
    # English
    en = page.get_by_role('button').filter(has_text='English')
    if en.count() > 0:
        en.first.click()
        page.wait_for_timeout(500)
    
    # Play as Guest
    guest = page.get_by_role('button').filter(has_text='Play as Guest')
    if guest.count() > 0:
        guest.first.click()
        page.wait_for_timeout(2000)
    
    # Click "Play Online" — creates a room with CreateRoom component
    play_online = page.get_by_role('button').filter(has_text='Play Online')
    if play_online.count() > 0:
        play_online.first.click()
        page.wait_for_timeout(2000)
    
    # Set player name
    name_input = page.locator('input[maxlength="20"]')
    if name_input.count() > 0:
        name_input.fill('TestPlayer')
        print("✓ Set player name to 'TestPlayer'")
    
    # Toggle Private Room ON
    toggles = page.locator('[role="switch"], .toggle, label:has(input[type="checkbox"])')
    # Find the private room toggle (first toggle usually)
    private_toggle = page.get_by_text('Private Room').locator('..').locator('[role="switch"], button, label')
    if private_toggle.count() == 0:
        private_toggle = page.get_by_text('Private Room')
    # Try clicking the label text to toggle
    priv_label = page.get_by_text('Private Room', exact=True)
    if priv_label.count() > 0:
        priv_label.first.click()
        page.wait_for_timeout(300)
        print("✓ Toggled Private Room ON")
    
    # Change answer time to 60s
    answer_select = page.locator('select').first
    if answer_select.count() > 0:
        answer_select.select_option('60')
        page.wait_for_timeout(300)
        print("✓ Set answer time to 60s")
    
    # Toggle Score Multiplier ON
    score_label = page.get_by_text('Score Multiplier')
    if score_label.count() > 0:
        score_toggle = score_label.first.locator('..').locator('[role="switch"], button')
        if score_toggle.count() > 0:
            score_toggle.first.click()
        else:
            score_label.first.click()
        page.wait_for_timeout(300)
        print("✓ Toggled Score Multiplier ON")
    
    page.screenshot(path='C:\\Users\\Muhammed\\Desktop\\kalako2\\scan\\settings-before.png', full_page=True)
    
    # Now navigate away — click a locked premium category or navigate to Store
    # First, let's navigate to the store
    # Check bottom nav for Store
    store_nav = page.get_by_text('Store').last
    if store_nav.count() > 0:
        store_nav.click()
        page.wait_for_timeout(3000)
        print("✓ Navigated to Store")
    
    page.screenshot(path='C:\\Users\\Muhammed\\Desktop\\kalako2\\scan\\at-store.png', full_page=True)
    
    # Now navigate back to CreateRoom — either via "Play" nav or "Back"
    play_nav = page.get_by_text('Play').last
    if play_nav.count() > 0:
        play_nav.click()
        page.wait_for_timeout(3000)
        print("✓ Navigated back (Play nav)")
    
    page.screenshot(path='C:\\Users\\Muhammed\\Desktop\\kalako2\\scan\\settings-after.png', full_page=True)
    
    # Check that settings persisted
    name_after = page.locator('input[maxlength="20"]').input_value() if page.locator('input[maxlength="20"]').count() > 0 else ''
    select_after = page.locator('select').first.input_value() if page.locator('select').first.count() > 0 else ''
    
    print(f"\n=== VERIFICATION ===")
    print(f"Player name persisted: {'TestPlayer' in name_after} (value='{name_after}')")
    print(f"Answer time persisted: {select_after == '60'} (value='{select_after}')")
    
    # Check toggles
    page.wait_for_timeout(500)
    
    page_content = page.evaluate("""() => {
        const toggles = document.querySelectorAll('[role="switch"], button');
        const results = [];
        toggles.forEach(t => {
            const parentText = t.parentElement ? t.parentElement.textContent : '';
            const ariaChecked = t.getAttribute('aria-checked');
            const hasClass = t.classList.contains('bg-[#C6FF3D]/35');
            results.push({ text: parentText.substring(0, 30), ariaChecked, hasClass });
        });
        return results;
    }""")
    
    for t in page_content:
        print(f"  Toggle: '{t['text']}' aria-checked={t['ariaChecked']} class-checked={t['hasClass']}")
    
    browser.close()
