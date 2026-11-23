// verify.mjs: run solve.js on the kit's practice cases and compare, path by path and byte by byte, with the reference.
import { readFileSync } from 'node:fs';
import { run } from './solve.js';

const KIT = '/root/mf-kits/sgs-kit/site-generator-speed-01-run-20261122-kit';
const cases = JSON.parse(readFileSync(`${KIT}/practice/input/cases.json`, 'utf8'));
const expected = JSON.parse(readFileSync(`${KIT}/practice/reference/expected.json`, 'utf8'));
const want = new Map(expected.cases.map((c) => [c.id, c.output]));

let bad = 0;
for (const c of cases) {
  const t0 = process.hrtime.bigint();
  const got = run(c.input);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  const w = want.get(c.id);
  if (w === undefined) {
    console.log(`${c.id}: no expected answer`);
    bad++;
    continue;
  }
  const gk = Object.keys(got);
  const wk = Object.keys(w);
  const problems = [];
  if (gk.length !== wk.length) problems.push(`paths ${gk.length} vs ${wk.length}`);
  const missing = wk.filter((k) => !(k in got));
  const extra = gk.filter((k) => !(k in w));
  if (missing.length) problems.push(`missing ${missing.length}: ${missing.slice(0, 3).join(', ')}`);
  if (extra.length) problems.push(`extra ${extra.length}: ${extra.slice(0, 3).join(', ')}`);
  let diff = 0;
  let firstDiff = '';
  for (const k of wk) {
    if (!(k in got)) continue;
    if (got[k] !== w[k]) {
      diff++;
      if (firstDiff === '') {
        const a = String(got[k]);
        const b = String(w[k]);
        let i = 0;
        while (i < a.length && i < b.length && a[i] === b[i]) i++;
        firstDiff = `${k} at ${i}: got ${JSON.stringify(a.slice(Math.max(0, i - 40), i + 40))} want ${JSON.stringify(b.slice(Math.max(0, i - 40), i + 40))}`;
      }
    }
  }
  if (diff) problems.push(`differing files ${diff}; first: ${firstDiff}`);
  if (problems.length === 0) console.log(`${c.id}: ok (${gk.length} paths, ${ms.toFixed(0)} ms)`);
  else {
    bad++;
    console.log(`${c.id}: FAIL (${ms.toFixed(0)} ms)`);
    for (const p of problems) console.log(`  ${p}`);
  }
}
console.log(bad === 0 ? 'all cases match' : `${bad} case(s) failed`);
process.exitCode = bad === 0 ? 0 : 1;