import os
import urllib.request
import re

fonts = {
    'Inter': [400, 500, 700],
    'Heebo': [400, 500, 700]
}

out_dir = 'C:/Users/Muhammed/Desktop/kalako2/kalako-client/public/fonts'
os.makedirs(out_dir, exist_ok=True)

for family, weights in fonts.items():
    family_css = family.replace(' ', '+')
    url = f'https://fonts.googleapis.com/css2?family={family_css}:wght@{";".join(str(w) for w in weights)}&display=swap'
    
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
    css = urllib.request.urlopen(req).read().decode('utf-8')
    
    for w in weights:
        # Find the specific weight declaration
        pattern = rf'/font/[^)]+\)'
        # Parse the CSS to find each @font-face block
        blocks = re.findall(r'@font-face\s*\{[^}]+\}', css)
        for block in blocks:
            if f'font-weight: {w}' in block:
                src_match = re.search(r'url\(([^)]+)\)', block)
                if src_match:
                    font_url = src_match.group(1)
                    ext = font_url.rsplit('.', 1)[-1]
                    fname = f'{family}-{w}.{ext}'
                    fpath = os.path.join(out_dir, fname)
                    print(f'Downloading {fname}...')
                    req2 = urllib.request.Request(font_url, headers={'User-Agent': 'Mozilla/5.0'})
                    data = urllib.request.urlopen(req2).read()
                    with open(fpath, 'wb') as f:
                        f.write(data)
                    print(f'  saved {len(data)} bytes')
                break

print('Done!')
