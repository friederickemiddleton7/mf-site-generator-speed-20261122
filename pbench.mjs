// in-process CPU bench: run all practice cases N times, report best/median ms of CPU
import { readFileSync } from 'node:fs';
import { run } from './solve.js';
const KIT = '/root/mf-kits/sgs-kit/site-generator-speed-01-run-20261122-kit';
const cases = JSON.parse(readFileSync(`${KIT}/practice/input/cases.json`, 'utf8'));
const reps = Number(process.argv[2] ?? 5);
const times = [];
for (let r = 0; r < reps; r++) {
  const t0 = process.cpuUsage();
  for (const c of cases) run(c.input);
  const d = process.cpuUsage(t0);
  times.push((d.user + d.system) / 1000);
}
times.sort((a, b) => a - b);
console.log(`min ${times[0].toFixed(0)} ms  median ${times[times.length >> 1].toFixed(0)} ms  all ${times.map(t=>t.toFixed(0)).join(',')}`);
