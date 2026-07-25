import json
with open(r'C:\tmp\vercel_out.json', encoding='utf-8-sig') as f:
    data = json.load(f)
for x in data['deployments']:
    sha = x['meta']['gitCommitSha'][:8]
    msg = x['meta']['gitCommitMessage'][:50]
    print(f"{x['state']:8} {sha} {msg}")
