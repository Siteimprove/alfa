import { test } from "@siteimprove/alfa-test";

import { Cache } from "../src/index.ts";

import {
  checkEntries,
  usePerformance,
  mark,
  measure,
  Rule as RuleFixture,
  sortEntries,
  Target,
} from "./fixtures/index.ts";

const {
  alwaysFail: fail,
  alwaysPass: pass,
  alwaysInapplicable: skip,
} = RuleFixture;
const target = Target.one;

// ── Atomic ─────────────────────────────────────────────────────────────────

test("evaluate() collects all 6 performance entries for an applicable Atomic rule", async (t) => {
  const [perf, entries] = usePerformance();

  await pass.evaluate([target], undefined, Cache.empty(), perf);

  checkEntries(
    entries,
    [
      mark(pass, "start", "total"),
      mark(pass, "start", "applicability"),
      measure(pass, "end", "applicability"),
      mark(pass, "start", "expectation"),
      measure(pass, "end", "expectation"),
      measure(pass, "end", "total"),
    ],
    t,
  );
});

test("evaluate() collects 4 performance entries for an inapplicable Atomic rule", async (t) => {
  const [perf, entries] = usePerformance();

  await skip.evaluate([target], undefined, Cache.empty(), perf);

  checkEntries(
    entries,
    [
      mark(skip, "start", "total"),
      mark(skip, "start", "applicability"),
      measure(skip, "end", "applicability"),
      measure(skip, "end", "total"),
    ],
    t,
  );
});

// ── Composite ──────────────────────────────────────────────────────────────

test("evaluate() collects total performance entries for a Composite rule, plus entries for its sub-rules", async (t) => {
  const [perf, entries] = usePerformance();

  const composite = RuleFixture.makeComposite("test:perf-composite", [
    pass,
    fail,
  ]);
  await composite.evaluate([target], undefined, Cache.empty(), perf);

  // Sub-rules evaluate concurrently, so their entries interleave; group them
  // back together by rule before comparing against the expected sequence.
  // The sorting is alphabetical order of URIs, so
  // fixture:always-fail -> fixture:always-pass -> test:perf-composite
  checkEntries(
    sortEntries(entries),
    [
      mark(fail, "start", "total"),
      mark(fail, "start", "applicability"),
      measure(fail, "end", "applicability"),
      mark(fail, "start", "expectation"),
      measure(fail, "end", "expectation"),
      measure(fail, "end", "total"),
      mark(pass, "start", "total"),
      mark(pass, "start", "applicability"),
      measure(pass, "end", "applicability"),
      mark(pass, "start", "expectation"),
      measure(pass, "end", "expectation"),
      measure(pass, "end", "total"),
      mark(composite, "start", "total"),
      measure(composite, "end", "total"),
    ],
    t,
  );

  // Ensure that the composite rule actually started before its atomic and ended
  // after them.
  // There is no guarantee that Promise.all starts in any specific order, so
  // "start fail" could be before "start pass".
  checkEntries(
    [entries[0], entries[entries.length - 1]],
    [mark(composite, "start", "total"), measure(composite, "end", "total")],
    t,
  );
});
