"""Test the recovery flow end-to-end via Playwright."""

import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from playwright.sync_api import sync_playwright

URL = 'https://kalako-client.vercel.app'

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    
    # Use CDP to spy on socket events
    context = browser.new_context()
    page = context.new_page()
    
    # Listen for all WebSocket frames
    ws_logs = []
    page.on('websocket', lambda ws: ws_logs.append(f"WS: {ws.url}"))
    
    console_errors = []
    page.on('pageerror', lambda err: console_errors.append(str(err)))
    
    page.goto(URL, wait_until='networkidle', timeout=30000)
    page.wait_for_timeout(3000)
    
    # Switch to English
    en = page.get_by_role('button').filter(has_text='English')
    if en.count() > 0:
        en.first.click()
        page.wait_for_timeout(500)
    
    # Navigate to recovery via Sign In button
    signin = page.get_by_role('button').filter(has_text='Sign In')
    if signin.count() > 0:
        signin.first.click()
        page.wait_for_timeout(2000)
    
    # Fill email and submit
    email_input = page.locator('input[type="email"]')
    if email_input.count() > 0:
        email_input.fill('test@example.com')
        page.wait_for_timeout(500)
        
        send_btn = page.get_by_role('button').filter(has_text='Send Code')
        if send_btn.count() > 0:
            send_btn.first.click()
            
            # Wait for response (15s timeout in code + some buffer)
            page.wait_for_timeout(18000)
    
    # Check the result
    step_text = page.evaluate("""() => {
        const inputs = document.querySelectorAll('input');
        const inputTypes = Array.from(inputs).map(i => i.type || i.inputMode);
        return { inputCount: inputs.length, inputTypes: inputTypes };
    }""")
    
    # Check for code input (means we advanced to code step)
    code_input = page.locator('input[inputmode="numeric"]')
    has_code_step = code_input.count() > 0
    
    # Check toast
    toast = page.locator('[role="status"]')
    toast_text = toast.text_content() if toast.count() > 0 else 'no toast'
    
    # Check visible page content
    visible_text = page.evaluate("""() => {
        const body = document.body;
        const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, null, false);
        const texts = [];
        let node;
        while (node = walker.nextNode()) {
            const t = node.textContent.trim();
            if (t && t.length > 5) texts.push(t.substring(0, 80));
        }
        return texts.filter(t => t.includes('code') || t.includes('email') || t.includes('connect') || t.includes('error') || t.includes('try again'));
    }""")
    
    print(f"\n=== RESULTS ===")
    print(f"Code step appeared: {has_code_step}")
    print(f"Toast text: '{toast_text}'")
    print(f"Page errors: {console_errors}")
    print(f"Input fields: {step_text}")
    if visible_text:
        for t in visible_text:
            print(f"  Page text: '{t}'")
    
    page.screenshot(path='C:\\Users\\Muhammed\\Desktop\\kalako2\\scan\\recovery-test.png', full_page=True)
    print(f"\nScreenshot: recovery-test.png")
    
    browser.close()
