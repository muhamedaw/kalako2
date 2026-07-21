import sys
import urllib.request
import re

# Fetch the HTML
html = urllib.request.urlopen('https://kalako-client.vercel.app').read().decode('utf-8')

# Find the JS asset
m = re.search(r'src="(/assets/[^"]+\.js)"', html)
if not m:
    print("FAIL: No JS asset found in HTML")
    sys.exit(1)

js_url = f'https://kalako-client.vercel.app{m.group(1)}'
print(f"Fetching: {js_url}")

js = urllib.request.urlopen(js_url).read().decode('utf-8')

checks = [
    ('sslip.io in bundle', 'kalak-16-16-218-187.sslip.io' in js),
    ('no loca.lt in bundle', 'loca.lt' not in js),
    ('no onrender.com in bundle', 'onrender.com' not in js),
    ('doublePointsRoundEnabled in bundle', 'doublePointsRoundEnabled' in js),
    ('blindVotingEnabled in bundle', 'blindVotingEnabled' in js),
    ('familyMode in bundle', 'familyMode' in js),
    ('mostDeceptivePlayer in bundle', 'mostDeceptivePlayer' in js),
    ('isDoublePointsRound in bundle', 'isDoublePointsRound' in js),
]

passed = sum(1 for _, ok in checks)
for name, ok in checks:
    print(f'  {"PASS" if ok else "FAIL"}: {name}')

print(f'\nResult: {passed}/{len(checks)} passed')
