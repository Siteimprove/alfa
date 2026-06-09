import { test } from "@siteimprove/alfa-test";

import { Audit, Outcome } from "../src/index.ts";

import {
  checkEntries,
  failed,
  usePerformance,
  mark,
  measure,
  Outcomes,
  passed,
  Rule as RuleFixture,
  Target,
} from "./fixtures/index.ts";

// ── Scenario ─────────────────────────────────────────────────────────────────
//
// Three atomic rules are used:
//   pass — always applicable, always passes;
//   fail — always applicable, always fails;
//   ask - always applicable, ask whether it should pass.
//
// Two composite rules, sharing pass as a sub-rule, using a "some" logic:
//   comp1 = makeComposite([pass, fail]) (pass beats fail → Passed (Automatic))
//   comp2 = makeComposite([pass, ask]) (pass + oracle-pass → Passed (SemiAuto))
//
// Audit rule list (intentionally out of dependency order):
//   [comp1, comp2, pass, fail]
//
// Caching is witnessed by the performance comparison; this shows the order in
// which events trigger and shows that rules only trigger once.
//
// Expected behavior:
// • comp1 triggers the first (and only) evaluation of pass and
//   fail; their bodies run once each.
// • comp2 retrieves pass from the cache (body not re-run) and
//   evaluates ask for the first time.
// • The two standalone entries at positions 3–4 both hit the cache; no
//   second evaluation of any body takes place.
//
// This proves:
// (a) caching: shared sub-rules are evaluated at most once,
// (b) topological ordering: listing rules after their composite caller is safe,
// (c) SemiAuto propagation: oracle usage flows up through composites.

// Actual behavior:
// The current implementation of Future is not as lazy as it should, so the
// outcomes of rules that are present multiple times (pass, fail) are duplicated.
// The cache also caches the Future, not the actual result, so part of the
// execution is indeed cached ("start total" and "start applicability"), but
// the end is delayed in a Future that gets re-evaluated and is therefore
// duplicated ("end applicability", …)

const { alwaysFail: fail, alwaysPass: pass } = RuleFixture;
const ask = RuleFixture.withQuestion("fixture:audit-ask");

test("evaluate() integrates caching, topological ordering, and oracle across atomic and composite rules", async (t) => {
  const comp1 = RuleFixture.makeComposite("fixture:audit-comp1", [pass, fail]);
  const comp2 = RuleFixture.makeComposite("fixture:audit-comp2", [pass, ask]);

  const oracle = RuleFixture.oracle(() => true);
  const [perf, entries] = usePerformance();

  const input = [Target.one, Target.two];

  const audit = Audit.of(input, [comp1, comp2, pass, fail], oracle);

  const outcomes = Array.from(await audit.evaluate(perf)).map((o) =>
    o.toJSON(),
  );

  t.deepEqual(outcomes, [
    // comp1: pass beats fail for every target
    passed(comp1, Target.one, { "1": Outcomes.Passed }),
    passed(comp1, Target.two, { "1": Outcomes.Passed }),
    // comp2: oracle used for ask → SemiAuto propagates to the composite
    passed(comp2, Target.one, { "1": Outcomes.Passed }, Outcome.Mode.SemiAuto),
    passed(comp2, Target.two, { "1": Outcomes.Passed }, Outcome.Mode.SemiAuto),
    // pass: same outcomes computed during comp1
    // Outcomes are incorrectly duplicated by the lack of laziness in Future
    passed(pass, Target.one, { "1": Outcomes.Passed }),
    passed(pass, Target.two, { "1": Outcomes.Passed }),
    passed(pass, Target.one, { "1": Outcomes.Passed }),
    passed(pass, Target.two, { "1": Outcomes.Passed }),
    passed(pass, Target.one, { "1": Outcomes.Passed }),
    passed(pass, Target.two, { "1": Outcomes.Passed }),
    // fail: same outcomes computed during comp1
    // Outcomes are incorrectly duplicated by the lack of laziness in Future
    failed(fail, Target.one, { "1": Outcomes.Failed }),
    failed(fail, Target.two, { "1": Outcomes.Failed }),
    failed(fail, Target.one, { "1": Outcomes.Failed }),
    failed(fail, Target.two, { "1": Outcomes.Failed }),
  ]);

  // ── performance ───────────────────────────────────────────────────────────
  // Each rule body is measured exactly once; cache hits produce no entries.
  // Absence of a second pass/fail/ask block confirms that.
  const expectedEntries = [
    // comp1 and its two sub-rules (both cache misses)
    mark(comp1, "start", "total"),
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
    measure(comp1, "end", "total"),
    // comp2: pass is a cache hit (no entries), ask is a cache miss
    mark(comp2, "start", "total"),

    // Evaluation is incorrectly duplicated by the lack of laziness in Future
    measure(pass, "end", "applicability"),
    mark(pass, "start", "expectation"),
    measure(pass, "end", "expectation"),
    measure(pass, "end", "total"),

    // ask is a cache miss and needs to be fully evaluated.
    mark(ask, "start", "total"),
    mark(ask, "start", "applicability"),
    measure(ask, "end", "applicability"),
    mark(ask, "start", "expectation"),
    measure(ask, "end", "expectation"),
    measure(ask, "end", "total"),
    measure(comp2, "end", "total"),

    // pass, fail: cache hits → no entries
    // Evaluation is incorrectly duplicated by the lack of laziness in Future
    measure(pass, "end", "applicability"),
    mark(pass, "start", "expectation"),
    measure(pass, "end", "expectation"),
    measure(pass, "end", "total"),
    // Evaluation is incorrectly duplicated by the lack of laziness in Future
    measure(fail, "end", "applicability"),
    mark(fail, "start", "expectation"),
    measure(fail, "end", "expectation"),
    measure(fail, "end", "total"),
  ];
  t.equal(entries.length, expectedEntries.length);
  checkEntries(entries, expectedEntries, t);
});
