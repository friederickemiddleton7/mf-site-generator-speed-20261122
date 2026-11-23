# site-generator-speed-01 — a faster drop-in for makefun-site 1.0.0

[![make.fun · site-generator-speed-01-run-20261122](https://make.fun/badge/site-generator-speed-01-run-20261122.svg)](https://make.fun/bounty/site-generator-speed-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=site-generator-speed-01-run-20261122)
[![rank](https://make.fun/badge/site-generator-speed-01-run-20261122/friederickemiddleton7/mf-site-generator-speed-20261122/rank.svg)](https://make.fun/bounty/site-generator-speed-01-run-20261122/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=site-generator-speed-01-run-20261122)
[![reward](https://make.fun/badge/site-generator-speed-01-run-20261122/friederickemiddleton7/mf-site-generator-speed-20261122/reward.svg)](https://make.fun/bounty/site-generator-speed-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=site-generator-speed-01-run-20261122)

An entry for the make.fun bounty *Build a static site faster*: `solve.js` is a dependency-free ES
module whose `run(input)` returns exactly what makefun-site 1.0.0's `build` returns for every case —
same paths, same bytes — and is measurably cheaper on CPU.

## Layout

- `solve.js` — the entry: `run(input)` → the output tree `{ path: text }`.
- `main.ts` — the harness driver (from the house baseline): reads `/input/cases.json`, answers every
  case alone with `run`, writes `/output/answers.json`. It turns V8's incremental marking off before
  `solve.js` is imported, as the rules allow.
- `verify.mjs` — runs `run` on the kit's practice set and compares byte for byte against the
  reference answers.
- `bench2.mjs` — times the baseline and this entry in one process, alternating, min CPU per case.

## What is faster, and why it stays identical

The pipeline is the baseline's own — front matter, template dialect, Markdown subset, slug rule,
report — ported one to one, then the hot paths are shaped:

- HTML escaping copies the plain stretches between `& < > " '` in one slice each, and returns the
  string untouched when it holds no special character.
- Inline markup renders plain runs as slices of the source line instead of building them a character
  at a time.
- A template's `for` loop reuses one scope object and one `loop` object for all its items, so a page
  with 600 posts does not allocate 600 scopes.
- Front matter is read line by line straight out of the source text; the body is sliced, never split
  and re-joined.
- A code block's lines are joined and escaped once, and a post's card — date, reading time, tags —
  is computed once per post instead of once per page that shows it.

## Speed on the practice set

`node bench2.mjs 8` (same process, alternating, minimum CPU per case):

```
g-0001: base 206.8 ms  mine  87.0 ms  ratio 2.38x
g-0002: base 332.7 ms  mine 183.3 ms  ratio 1.82x
g-0003: base 480.6 ms  mine 191.3 ms  ratio 2.51x
total:  base 1020.1 ms mine 461.6 ms  ratio 2.21x
```

## Correctness

`node verify.mjs` — 3/3 practice cases identical (276, 350 and 509 paths), and the harness path
itself (`MAKEFUN_INPUT_DIR=… MAKEFUN_OUTPUT_DIR=… node main.ts`) produces answers that match the
reference JSON value for value.

## Licence

MIT (see `LICENSE`). makefun-site 1.0.0 is make.fun's own reference program, MIT, derived from
metalsmith 2.7.0 and marked 18.2.1; this entry re-implements its behaviour and ships none of its code.
