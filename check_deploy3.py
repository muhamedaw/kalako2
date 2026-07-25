import json
with open(r'C:\tmp\vercel_out2.json', encoding='utf-8-sig') as f:
    data = json.load(f)
x = data['deployments'][0]
print(f"State: {x['state']}")
print(f"URL:   {x['url']}")
print(f"SHA:   {x['meta']['gitCommitSha'][:8]}")
print(f"Msg:   {x['meta']['gitCommitMessage'][:60]}")
