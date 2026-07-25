import json
with open(r'C:\Users\Muhammed\AppData\Local\Temp\vercel_out.json') as f:
    data = json.load(f)
d = data['deployments'][0]
print(f"URL:   https://{d['url']}")
print(f"State: {d['state']}")
print(f"SHA:   {d['meta']['gitCommitSha'][:8]}")
print(f"Msg:   {d['meta']['gitCommitMessage'][:80]}")
