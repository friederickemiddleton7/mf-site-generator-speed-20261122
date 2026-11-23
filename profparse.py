import json, sys, collections
p = json.load(open(sys.argv[1]))
nodes = {n['id']: n for n in p['nodes']}
self_time = collections.Counter()
# compute self time from samples/timeDeltas
deltas = p['timeDeltas']
samples = p['samples']
for i, sid in enumerate(samples):
    dt = deltas[i] if i < len(deltas) else 0
    self_time[sid] += dt
total = sum(self_time.values())
print("total ms", total/1000)
rows = []
for nid, t in self_time.items():
    n = nodes.get(nid)
    if not n: continue
    cf = n['callFrame']
    url = cf['url'].split('/')[-1]
    name = cf['functionName'] or '(anon)'
    line = cf.get('lineNumber', -1) + 1
    rows.append((t, f"{url}:{line} {name}"))
rows.sort(reverse=True)
for t, s in rows[:35]:
    print(f"{t/1000:8.1f} ms {100*t/total:5.1f}%  {s}")
