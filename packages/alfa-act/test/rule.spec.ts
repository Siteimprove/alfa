import { Future } from "@siteimprove/alfa-future";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option } from "@siteimprove/alfa-option";
import { test } from "@siteimprove/alfa-test";

import { Cache, Outcome, Rule } from "../src/index.ts";

import {
  cantTell,
  evaluate,
  failed,
  inapplicable,
  Outcomes,
  passed,
  Rule as RuleFixture,
  Target,
} from "./fixtures/index.ts";

const {
  alwaysFail: fail,
  alwaysInapplicable: skip,
  alwaysPass: pass,
  threesix,
  twofour,
} = RuleFixture;
const ask = RuleFixture.withQuestion("test:ask");

const { one: target1, two: target2 } = Target;

// ── Atomic ─────────────────────────────────────────────────────────────────

test("evaluate() returns Inapplicable when no target is applicable", async (t) => {
  t.deepEqual(await evaluate(skip, [target1, target2]), [inapplicable(skip)]);
});

test("evaluate() returns Passed when expectation is Ok", async (t) => {
  t.deepEqual(await evaluate(pass, [target1]), [
    passed(pass, target1, { "1": Outcomes.Passed }),
  ]);
});

test("evaluate() returns Failed when expectation is Err", async (t) => {
  t.deepEqual(await evaluate(fail, [target1]), [
    failed(fail, target1, { "1": Outcomes.Failed }),
  ]);
});

test("evaluate() returns outcomes in applicability order", async (t) => {
  t.deepEqual(await evaluate(pass, [target1, target2]), [
    passed(pass, target1, { "1": Outcomes.Passed }),
    passed(pass, target2, { "1": Outcomes.Passed }),
  ]);
});

test("evaluate() handles applicability and expectation correctly", async (t) => {
  t.deepEqual(await evaluate(twofour, Target.from([1, 2, 8, 4, 5, 6, 12])), [
    failed(twofour, Target.of(2), { "1": Outcomes.Failed }),
    passed(twofour, Target.of(8), { "1": Outcomes.Passed }),
    passed(twofour, Target.of(4), { "1": Outcomes.Passed }),
    failed(twofour, Target.of(6), { "1": Outcomes.Failed }),
    passed(twofour, Target.of(12), { "1": Outcomes.Passed }),
  ]);
});

test("evaluate() returns CantTell when no oracle answer the question", async (t) => {
  t.deepEqual(await evaluate(ask, [target1]), [cantTell(ask, target1)]);
});

test("evaluate() returns Automatic mode when the oracle does not answer a Question", async (t) => {
  // It is the default oracle, but keeping it explicit to make the test explicit.
  const oracle = () => Future.now(None);

  t.deepEqual(await evaluate(ask, [target1], oracle), [
    // Automatic is the default mode, but keeping it explicit to make the test explicit.
    cantTell(ask, target1, undefined, Outcome.Mode.Automatic),
  ]);
});

test("evaluate() returns SemiAuto mode when the oracle answers a Question", async (t) => {
  const oracle = RuleFixture.oracle(() => true);

  t.deepEqual(await evaluate(ask, [target1], oracle), [
    passed(ask, target1, { "1": Outcomes.Passed }, Outcome.Mode.SemiAuto),
  ]);
});

test("evaluate() handles partial oracles", async (t) => {
  const oracle = RuleFixture.oracle((value) =>
    value === 1 ? true : undefined,
  );

  t.deepEqual(await evaluate(ask, [target1, target2], oracle), [
    passed(ask, target1, { "1": Outcomes.Passed }, Outcome.Mode.SemiAuto),
    cantTell(ask, target2),
  ]);
});

test("evaluate() keeps mode automatic when questions are answered internally", async (t) => {
  const rule = RuleFixture.withQuestion(
    "test:rhetorical",
    () => true,
    (value) => value === 1,
    (value) => value === 2,
  );

  t.deepEqual(await evaluate(rule, [target1, target2]), [
    // Automatic is the default mode, but keeping it explicit to make the test explicit.
    passed(rule, target1, { "1": Outcomes.Passed }, Outcome.Mode.Automatic),
    failed(rule, target2, { "1": Outcomes.Failed }, Outcome.Mode.Automatic),
  ]);
});

test("evaluate() returns the same Future reference when called with the same Cache", async (t) => {
  const cache = Cache.empty();
  const a = pass.evaluate([target1], undefined, cache);

  // The cache was filled.
  cache.get(pass, () => {
    throw new Error(`${pass.uri} wasn't found in the cache.`);
  });

  const b = pass.evaluate([target1], undefined, cache);

  // This tests physical equality, i.e. the same object is shared.
  t(a === b);

  const otherCache = Cache.empty();
  const c = pass.evaluate([target1], undefined, otherCache);

  // Using another cache, we get a different but equivalent object.
  t(a !== c);
  t.deepEqual(Iterable.toJSON(await a), Iterable.toJSON(await c));
});

test("isAtomic() returns true and isComposite() returns false for an Atomic rule", (t) => {
  t(Rule.isAtomic(pass));
  t(!Rule.isComposite(pass));
});

// ── Composite ──────────────────────────────────────────────────────────────

test("evaluate() returns Inapplicable when all sub-rules are inapplicable", async (t) => {
  const composite = RuleFixture.makeComposite("test:comp-empty", [skip]);

  t.deepEqual(await evaluate(composite, [target1, target2]), [
    inapplicable(composite),
  ]);
});

test("evaluate() returns Passed when a sub-rule outcome is Passed", async (t) => {
  const composite = RuleFixture.makeComposite("test:comp-pass", [pass]);

  t.deepEqual(await evaluate(composite, [target1]), [
    passed(composite, target1, { "1": Outcomes.Passed }),
  ]);
});

test("evaluate() returns Failed when a sub-rule outcome is Failed", async (t) => {
  const composite = RuleFixture.makeComposite("test:comp-fail", [fail]);

  t.deepEqual(await evaluate(composite, [target1]), [
    failed(composite, target1, { "1": Outcomes.Failed }),
  ]);
});

test("evaluate() propagates SemiAuto mode from a sub-rule that used the oracle", async (t) => {
  const composite = RuleFixture.makeComposite("test:comp-semi", [ask]);
  const oracle = () => Future.now(Option.from(true));

  t.deepEqual(await evaluate(composite, [target1], oracle), [
    passed(composite, target1, { "1": Outcomes.Passed }, Outcome.Mode.SemiAuto),
  ]);
});

test("isComposite() returns true and isAtomic() returns false for a Composite rule", (t) => {
  const composite = RuleFixture.makeComposite("test:comp", [skip]);

  t(Rule.isComposite(composite));
  t(!Rule.isAtomic(composite));
});

// ── Composite (multiple input rules) ───────────────────────────────────────

// Sort outcomes by serialized target value so tests are independent of Map's
// hash-based iteration order.
function sortByTarget(outcomes: Array<Outcome.JSON>): Array<Outcome.JSON> {
  return [...outcomes].sort((a, b) => {
    const ta = "target" in a ? (a.target as number) : -1;
    const tb = "target" in b ? (b.target as number) : -1;
    return ta - tb;
  });
}

test("evaluate() returns Passed when at least one of two sub-rules passes for the same target", async (t) => {
  const composite = RuleFixture.makeComposite("test:comp-pass-beats-fail", [
    pass,
    fail,
  ]);

  t.deepEqual(await evaluate(composite, [target1]), [
    passed(composite, target1, { "1": Outcomes.Passed }),
  ]);
});

test("evaluate() returns Failed when both sub-rules fail for the same target", async (t) => {
  const composite = RuleFixture.makeComposite("test:comp-all-fail", [
    fail,
    fail,
  ]);

  t.deepEqual(await evaluate(composite, [target1]), [
    failed(composite, target1, { "1": Outcomes.Failed }),
  ]);
});

test("evaluate() returns CantTell when sub-rules yield only Failed and CantTell for a target", async (t) => {
  // [Failed, CantTell] → Trilean.some → undefined → CantTell
  const composite = RuleFixture.makeComposite("test:comp-fail-cantTell", [
    fail,
    ask,
  ]);

  t.deepEqual(await evaluate(composite, [target1]), [
    cantTell(composite, target1),
  ]);
});

test("evaluate() returns Passed when one sub-rule passes and another CantTells for the same target", async (t) => {
  // [Passed, CantTell] → Trilean.some → true → Passed
  const composite = RuleFixture.makeComposite("test:comp-pass-cantTell", [
    pass,
    ask,
  ]);

  t.deepEqual(await evaluate(composite, [target1]), [
    passed(composite, target1, { "1": Outcomes.Passed }),
  ]);
});

test("evaluate() handles disjoint applicability across two rules", async (t) => {
  // fail: applicable to all; twofour: even only, passes multiples of 4.
  // T1 (odd): only fail → Failed.
  // T2 (even, not ×4): both fail → Failed.
  // T4 (×4): fail fails but twofour passes → Passed (some wins).
  // Use an explicit array so all sub-rules share the same Target instances.
  const composite = RuleFixture.makeComposite("test:comp-disjoint", [
    fail,
    twofour,
  ]);

  t.deepEqual(sortByTarget(await evaluate(composite, Target.from([1, 2, 4]))), [
    failed(composite, Target.of(1), { "1": Outcomes.Failed }),
    failed(composite, Target.of(2), { "1": Outcomes.Failed }),
    passed(composite, Target.of(4), { "1": Outcomes.Passed }),
  ]);
});

test("evaluate() handles three rules with mixed outcomes per target", async (t) => {
  // twofour: even, passes ×4. threesix: ×3, passes ×6. ask: CantTell (no oracle).
  // T2 (even, not ×4): twofour fails, threesix N/A, ask CantTell → [Failed, CantTell] → CantTell.
  // T3 (×3, not ×6): twofour N/A, threesix fails, ask CantTell → [Failed, CantTell] → CantTell.
  // T4 (×4): twofour passes, threesix N/A, ask CantTell → [Passed, CantTell] → Passed.
  // T6 (×2 and ×3): twofour fails, threesix passes, ask CantTell → [Failed, Passed, CantTell] → Passed.
  // Use an explicit array so all sub-rules share the same Target instances.
  const composite = RuleFixture.makeComposite("test:comp-three-rules", [
    twofour,
    threesix,
    ask,
  ]);

  t.deepEqual(
    sortByTarget(await evaluate(composite, Target.from([2, 3, 4, 6]))),
    [
      cantTell(composite, Target.of(2)),
      cantTell(composite, Target.of(3)),
      passed(composite, Target.of(4), { "1": Outcomes.Passed }),
      passed(composite, Target.of(6), { "1": Outcomes.Passed }),
    ],
  );
});
