#!/usr/bin/python3
"""bench_ab.py <dirA> <dirB> [reps] — interleaved CPU time of `node main.ts` in each dir; prints min/median per dir."""
import resource
import subprocess
import sys
import os

dirs = [sys.argv[1], sys.argv[2]]
reps = int(sys.argv[3]) if len(sys.argv) > 3 else 9
env = dict(os.environ)
env["MAKEFUN_INPUT_DIR"] = "/tmp/sgsin"
env["MAKEFUN_OUTPUT_DIR"] = "/tmp/sgso_run"
os.makedirs(env["MAKEFUN_OUTPUT_DIR"], exist_ok=True)

times = {d: [] for d in dirs}


def run(d):
    before = resource.getrusage(resource.RUSAGE_CHILDREN)
    subprocess.run(["node", "main.ts"], cwd=d, env=env, check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    after = resource.getrusage(resource.RUSAGE_CHILDREN)
    return (after.ru_utime - before.ru_utime) + (after.ru_stime - before.ru_stime)


for i in range(reps):
    for d in dirs:
        times[d].append(run(d))

for d in dirs:
    ts = sorted(times[d])
    med = ts[len(ts) // 2]
    print(f"{d}: min {ts[0]*1000:.0f} ms  median {med*1000:.0f} ms  all {[round(t*1000) for t in times[d]]}")
