// bench2.mjs: the baseline and solve.js measured in the same process, alternating, min CPU per case.
import { readFileSync } from 'node:fs';

const KIT = '/root/mf-kits/sgs-kit/site-generator-speed-01-run-20261122-kit';
const repeat = Number(process.argv[2] ?? 8);
const cases = JSON.parse(readFileSync(`${KIT}/practice/input/cases.json`, 'utf8'));
const base = (await import(`${KIT}/baselines/makefun-site/vendor/makefun-site/index.js`)).build;
const mine = (await import('./solve.js')).run;

const best = { base: new Map(), mine: new Map() };
const fns = { base, mine };
const measure = (fn, input) => {
  const a = process.cpuUsage();
  fn(input);
  const d = process.cpuUsage(a);
  return (d.user + d.system) / 1000;
};
// warm both
for (const c of cases) {
  base(c.input);
  mine(c.input);
}
for (let r = 0; r < repeat; r++) {
  for (const c of cases) {
    for (const name of ['base', 'mine']) {
      const cpu = measure(fns[name], c.input);
      const b = best[name].get(c.id);
      if (b === undefined || cpu < b) best[name].set(c.id, cpu);
    }
  }
}
let tb = 0;
let tm = 0;
for (const c of cases) {
  const b = best.base.get(c.id);
  const m = best.mine.get(c.id);
  tb += b;
  tm += m;
  console.log(`${c.id}: base ${b.toFixed(1)} ms  mine ${m.toFixed(1)} ms  ratio ${(b / m).toFixed(2)}x`);
}
console.log(`total: base ${tb.toFixed(1)} ms  mine ${tm.toFixed(1)} ms  ratio ${(tb / tm).toFixed(2)}x`);