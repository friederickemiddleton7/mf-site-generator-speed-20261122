#!/bin/bash
# abbench.sh <refdir> <newdir> [reps] [rounds] — interleaved CPU bench of whole driver
R=${1:-/tmp/ref}
N=${2:-/root/sgs-entry}
REP=${3:-5}
RD=${4:-2}
for r in $(seq 1 "$RD"); do
  python3 /root/sgs-entry/bench_driver.py "$R" ref "$REP"
  python3 /root/sgs-entry/bench_driver.py "$N" new "$REP"
done
