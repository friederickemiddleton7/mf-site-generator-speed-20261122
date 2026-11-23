// bench.mjs: CPU milliseconds per case for the house baseline and for solve.js, each in its own process.
import { readFileSync } from 'node:fs';

const KIT = '/root/mf-kits/sgs-kit/site-generator-speed-01-run-20261122-kit';
const which = process.argv[2];
const repeat = Number(process.argv[3] ?? 3);
const cases = JSON.parse(readFileSync(`${KIT}/practice/input/cases.json`, 'utf8'));

const runFn = which === 'base'
  ? (await import(`${KIT}/baselines/makefun-site/vendor/makefun-site/index.js`)).build
  : (await import('./solve.js')).run;

// warm up the JIT on the first case, then measure
runFn(cases[0].input);

const rows = [];
const best = new Map();
for (let r = 0; r < repeat; r++) {
  for (const c of cases) {
    const a = process.cpuUsage();
    const t = process.hrtime.bigint();
    runFn(c.input);
    const d = process.cpuUsage(a);
    const cpu = (d.user + d.system) / 1000;
    const wall = Number(process.hrtime.bigint() - t) / 1e6;
    rows.push({ id: c.id, cpu, wall });
    const b = best.get(c.id);
    if (b === undefined || cpu < b) best.set(c.id, cpu);
  }
}
let total = 0;
for (const [id, cpu] of best) {
  total += cpu;
  console.log(`${which} ${id} best cpu ${cpu.toFixed(1)} ms`);
}
console.log(`${which} total best cpu ${total.toFixed(1)} ms over ${best.size} cases`);