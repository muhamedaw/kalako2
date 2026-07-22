import sys
import urllib.request
import re

# Fetch HTML
html = urllib.request.urlopen('https://kalako-client.vercel.app').read().decode('utf-8')

# Find JS bundle
m = re.search(r'src="(/assets/[^"]+\.js)"', html)
asset = m.group(1) if m else None
print(f'Asset: {asset}')

js = urllib.request.urlopen(f'https://kalako-client.vercel.app{asset}').read().decode('utf-8')
print(f'JS length: {len(js)}')

# Find socket URLs
urls = re.findall(r'(https?://[a-zA-Z0-9.-]+(?::\d+)?)', js)
unique = sorted(set(urls))
print(f'\nUnique URLs in bundle:')
for u in unique:
    if any(skip in u for skip in ['w3.org', 'fonts.g', 'example', 'github.com', 'socket.io/docs', 'localhost']):
        continue
    print(f'  {u}')

# Check specific patterns
checks = [
    ('sslip.io in bundle', 'kalak-16-16-218-187' in js),
    ('no loca.lt', 'loca.lt' not in js),
    ('no onrender.com', 'onrender.com' not in js),
    ('doublePointsRoundEnabled', 'doublePointsRoundEnabled' in js),
    ('blindVotingEnabled', 'blindVotingEnabled' in js),
    ('familyMode', 'familyMode' in js),
    ('mostDeceptivePlayer', 'mostDeceptivePlayer' in js),
    ('isDoublePointsRound', 'isDoublePointsRound' in js),
    ('no react-router-dom', 'react-router-dom' not in js),
    ('no PlayerAvatar component', 'PlayerAvatar' not in js),
]

passed = sum(1 for _, ok in checks)
for name, ok in checks:
    print(f'  {"PASS" if ok else "FAIL"}: {name}')

print(f'\n{passed}/{len(checks)} passed')
