#!/usr/bin/python3
"""bench_driver.py <dir> <label> [reps]: CPU time (user+sys) of `node main.ts` end to end, minimum of reps."""
import resource
import subprocess
import sys
import os

d, label = sys.argv[1], sys.argv[2]
reps = int(sys.argv[3]) if len(sys.argv) > 3 else 3
env = dict(os.environ)
env["MAKEFUN_INPUT_DIR"] = "/tmp/sgsin"
env["MAKEFUN_OUTPUT_DIR"] = "/tmp/sgso_run"
os.makedirs(env["MAKEFUN_OUTPUT_DIR"], exist_ok=True)
best = None
for i in range(reps):
    before = resource.getrusage(resource.RUSAGE_CHILDREN)
    subprocess.run(["node", "main.ts"], cwd=d, env=env, check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    after = resource.getrusage(resource.RUSAGE_CHILDREN)
    cpu = (after.ru_utime - before.ru_utime) + (after.ru_stime - before.ru_stime)
    if best is None or cpu < best:
        best = cpu
print(f"{label} {best*1000:.0f} ms cpu (min of {reps})")
