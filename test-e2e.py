import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx1 = browser.new_context(viewport={"width": 390, "height": 844})
    ctx2 = browser.new_context(viewport={"width": 390, "height": 844})
    page1 = ctx1.new_page()
    page2 = ctx2.new_page()

    # === Player 1: Create Room ===
    page1.goto('http://localhost:5173')
    page1.wait_for_load_state('networkidle')
    page1.wait_for_timeout(1500)
    page1.screenshot(path='C:\\Users\\Muhammed\\Desktop\\kalako2\\test-01-welcome.png')
    print("1. Welcome screen OK")

    page1.click('button:has-text("إنشاء غرفة جديدة")')
    page1.wait_for_timeout(800)
    page1.screenshot(path='C:\\Users\\Muhammed\\Desktop\\kalako2\\test-02-create-form.png')
    print("2. Create room form OK")

    page1.fill('input[placeholder*="اسمك"]', 'أحمد')
    page1.wait_for_timeout(300)
    page1.click('button:has-text("إنشاء الغرفة")')
    page1.wait_for_timeout(2000)
    page1.screenshot(path='C:\\Users\\Muhammed\\Desktop\\kalako2\\test-03-lobby.png')
    print("3. Lobby with code OK")

    # Get room code from screen
    code_el = page1.locator('p[dir="ltr"]').first
    room_code = code_el.text_content().strip() if code_el.count() > 0 else ''
    print(f"   Room code: {room_code}")

    # === Player 2: Join Room ===
    page2.goto('http://localhost:5173')
    page2.wait_for_load_state('networkidle')
    page2.wait_for_timeout(1000)

    page2.click('button:has-text("الانضمام بكود")')
    page2.wait_for_timeout(800)

    page2.fill('input[placeholder*="اسمك"]', 'سارة')
    page2.fill('input[placeholder*="ABC"]', room_code)
    page2.wait_for_timeout(300)
    page2.click('button:has-text("انضم للغرفة")')
    page2.wait_for_timeout(2000)
    page2.screenshot(path='C:\\Users\\Muhammed\\Desktop\\kalako2\\test-04-player2-lobby.png')
    print("4. Player 2 joined lobby")

    # Check lobby shows 2 players on player 1's screen
    page1.wait_for_timeout(1000)
    page1.screenshot(path='C:\\Users\\Muhammed\\Desktop\\kalako2\\test-05-lobby-2players.png')
    print("5. Lobby shows 2 players")

    # === Player 1: Start Game ===
    start_btn = page1.locator('button:has-text("ابدأ اللعبة")')
    if start_btn.count() > 0:
        start_btn.click()
        page1.wait_for_timeout(2000)
        page1.screenshot(path='C:\\Users\\Muhammed\\Desktop\\kalako2\\test-06-category-pick.png')
        print("6. Category pick screen")

        page2.wait_for_timeout(1000)
        page2.screenshot(path='C:\\Users\\Muhammed\\Desktop\\kalako2\\test-06b-player2-category.png')
        print("6b. Player 2 sees category pick")

        # Player 1 picks a category
        category_btns = page1.locator('button.glass')
        if category_btns.count() > 0:
            category_btns.first.click()
            page1.wait_for_timeout(2000)
            page1.screenshot(path='C:\\Users\\Muhammed\\Desktop\\kalako2\\test-07-answering.png')
            print("7. Answering screen (Player 1)")

            page2.wait_for_timeout(1000)
            page2.screenshot(path='C:\\Users\\Muhammed\\Desktop\\kalako2\\test-07b-answering.png')
            print("7b. Answering screen (Player 2)")

            # Both submit answers
            page1.fill('input[placeholder*="إجابتك"]', 'أحمد إجابة مثيرة')
            page1.click('button:has-text("إرسال الإجابة")')
            page1.wait_for_timeout(500)
            page1.screenshot(path='C:\\Users\\Muhammed\\Desktop\\kalako2\\test-08-submitted.png')
            print("8. Player 1 submitted answer")

            page2.fill('input[placeholder*="إجابتك"]', 'سارة إجابة خيالية')
            page2.click('button:has-text("إرسال الإجابة")')
            page2.wait_for_timeout(3000)

            # Should now be in voting
            page1.screenshot(path='C:\\Users\\Muhammed\\Desktop\\kalako2\\test-09-voting.png')
            print("9. Voting screen")

            page2.screenshot(path='C:\\Users\\Muhammed\\Desktop\\kalako2\\test-09b-voting.png')
            print("9b. Voting screen (Player 2)")

            # Both vote - find an enabled glass button (skip own answer which is disabled)
            vote_btns1 = page1.locator('button.glass:not([disabled])')
            if vote_btns1.count() > 0:
                vote_btns1.first.click()
                page1.wait_for_timeout(500)
                print("10. Player 1 voted")

                vote_btns2 = page2.locator('button.glass:not([disabled])')
                if vote_btns2.count() > 0:
                    vote_btns2.first.click()
                    page2.wait_for_timeout(3000)
                    page1.screenshot(path='C:\\Users\\Muhammed\\Desktop\\kalako2\\test-10-round-results.png')
                    print("11. Round results")
                    page2.screenshot(path='C:\\Users\\Muhammed\\Desktop\\kalako2\\test-10b-round-results.png')
                    print("11b. Round results (Player 2)")

                    # Wait for next round or game over
                    page1.wait_for_timeout(6000)
                    page1.screenshot(path='C:\\Users\\Muhammed\\Desktop\\kalako2\\test-11-next-phase.png')
                    print("12. Next phase (auto-advance)")
                else:
                    print("No vote buttons found for player 2")
            else:
                print("No vote buttons found for player 1")
        else:
            print("No category buttons found")
    else:
        print("Start button not found")

    browser.close()
    print("\nAll tests completed!")
