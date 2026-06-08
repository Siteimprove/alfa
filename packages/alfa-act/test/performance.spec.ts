import { test } from "@siteimprove/alfa-test";

import { Cache } from "../src/index.ts";

import {
  checkEntries,
  usePerformance,
  mark,
  measure,
  Rule as RuleFixture,
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

test("evaluate() collects 5 performance entries for an inapplicable Atomic rule", async (t) => {
  const [perf, entries] = usePerformance();

  await skip.evaluate([target], undefined, Cache.empty(), perf);

  checkEntries(
    entries,
    [
      mark(skip, "start", "total"),
      mark(skip, "start", "applicability"),
      measure(skip, "end", "applicability"),
      // We should not have a "start expectation" without an "end expectation"…
      mark(skip, "start", "expectation"),
      // measure(skip, "end", "expectation"),
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

  checkEntries(
    entries,
    [
      mark(composite, "start", "total"),
      mark(pass, "start", "total"),
      mark(pass, "start", "applicability"),
      measure(pass, "end", "applicability"),
      mark(pass, "start", "expectation"),
      measure(pass, "end", "expectation"),
      measure(pass, "end", "total"),
      mark(fail, "start", "total"),
      mark(fail, "start", "applicability"),
      measure(fail, "end", "applicability"),
      mark(fail, "start", "expectation"),
      measure(fail, "end", "expectation"),
      measure(fail, "end", "total"),
      measure(composite, "end", "total"),
    ],
    t,
  );
});
