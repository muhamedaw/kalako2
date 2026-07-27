import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('https://kalako-client.vercel.app', wait_until='networkidle', timeout=30000)
    page.wait_for_timeout(3000)
    
    r = page.evaluate("""() => {
        const svg = document.querySelector('svg');
        if (!svg) return 'NO SVG FOUND';
        const r = svg.getBoundingClientRect();
        const texts = svg.querySelectorAll('text');
        const tdata = Array.from(texts).map(t => {
            const tr = t.getBoundingClientRect();
            return { text: t.textContent.trim(), x: tr.x.toFixed(0), y: tr.y.toFixed(0), w: tr.width.toFixed(0), h: tr.height.toFixed(0) };
        });
        return { svg: { x: r.x.toFixed(0), y: r.y.toFixed(0), w: r.width.toFixed(0), h: r.height.toFixed(0) }, texts: tdata };
    }""")
    
    print(f"SVG bounds: ({r['svg']['x']},{r['svg']['y']}) {r['svg']['w']}x{r['svg']['h']}")
    for t in r['texts']:
        print(f"  '{t['text']}' at ({t['x']},{t['y']}) {t['w']}x{t['h']}")
    
    browser.close()
