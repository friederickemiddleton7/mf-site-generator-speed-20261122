// Paired A/B: for each rep measure A (all cases) then B (all cases); report per-rep ratio B/A.
// Paired ratios cancel slow periods on a noisy box.
import { readFileSync } from 'node:fs';
const KIT = '/root/mf-kits/sgs-kit/site-generator-speed-01-run-20261122-kit';
const cases = JSON.parse(readFileSync(`${KIT}/practice/input/cases.json`, 'utf8'));
const A = await import(process.argv[2]);
const B = await import(process.argv[3]);
const reps = Number(process.argv[4] ?? 21);

for (const c of cases) {
  const a = JSON.stringify(A.run(c.input));
  const b = JSON.stringify(B.run(c.input));
  if (a !== b) { console.log(`MISMATCH on ${c.id}`); process.exit(1); }
}

const cpu = (m) => {
  const t0 = process.cpuUsage();
  for (const c of cases) m.run(c.input);
  const d = process.cpuUsage(t0);
  return (d.user + d.system) / 1000;
};

const ra = [], rb = [], rat = [];
for (let r = 0; r < reps; r++) {
  // alternate order to cancel drift
  let a, b;
  if (r % 2 === 0) { a = cpu(A); b = cpu(B); } else { b = cpu(B); a = cpu(A); }
  ra.push(a); rb.push(b); rat.push(b / a);
}
const sorted = (x) => [...x].sort((p, q) => p - q);
const md = (x) => sorted(x)[x.length >> 1];
const q = (x, p) => sorted(x)[Math.min(x.length - 1, Math.floor(p * x.length))];
console.log(`A min ${Math.min(...ra).toFixed(0)} med ${md(ra).toFixed(0)} | B min ${Math.min(...rb).toFixed(0)} med ${md(rb).toFixed(0)}`);
console.log(`ratio B/A: min ${Math.min(...rat).toFixed(3)} med ${md(rat).toFixed(3)} p75 ${q(rat,0.75).toFixed(3)} max ${Math.max(...rat).toFixed(3)}`);
console.log(`A ${ra.map(x=>x.toFixed(0)).join(',')}`);
console.log(`B ${rb.map(x=>x.toFixed(0)).join(',')}`);
