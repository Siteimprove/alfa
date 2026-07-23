import type { Maybe } from "@siteimprove/alfa-option";
import { Record } from "@siteimprove/alfa-record";
import type { Result } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";
import { test } from "@siteimprove/alfa-test";

import { Cache, type Diagnostic, type Interview, Outcome } from "../src/index.ts";
import { evaluate, type Collected, type Resolvable } from "../src/rule/evaluation.ts";

import {
  failed,
  Outcomes,
  passed,
  Rule as RuleFixture,
  Target,
} from "./fixtures/index.ts";

const rule = RuleFixture.alwaysPass;
const { one: target1, two: target2 } = Target;

/**
 * Wraps a single expectation result into the `Record` of interviews a
 * `Resolvable` carries, annotating the index signature so `Record.of` doesn't
 * narrow to the concrete key.
 */
function expectations(
  result: Result<Diagnostic>,
): Record<{
  [key: string]: Interview<{}, Target, Target, Maybe<Result<Diagnostic>>>;
}> {
  const interviews: {
    [key: string]: Interview<{}, Target, Target, Maybe<Result<Diagnostic>>>;
  } = { "1": result };

  return Record.of(interviews);
}

/** Wraps a fixed `Collected` into the `collect` callback the engine expects. */
function collecting(
  collected: Collected<Target, {}, Target>,
): () => Promise<Collected<Target, {}, Target>> {
  return () => Promise.resolve(collected);
}

test("evaluate() returns a single Inapplicable outcome when no target is collected", async (t) => {
  const outcomes = Array.from(
    await evaluate(
      rule,
      undefined,
      Cache.empty(),
      undefined,
      collecting({ items: Sequence.empty(), oracleUsed: false }),
    ),
  );

  t.equal(outcomes.length, 1);
  t(Outcome.isInapplicable(outcomes[0]));
  t.equal(outcomes[0].mode, Outcome.Mode.Automatic);
});

test("evaluate() reflects oracle use in the Inapplicable mode", async (t) => {
  const outcomes = Array.from(
    await evaluate(
      rule,
      undefined,
      Cache.empty(),
      undefined,
      collecting({ items: Sequence.empty(), oracleUsed: true }),
    ),
  );

  t.equal(outcomes[0].mode, Outcome.Mode.SemiAuto);
});

test("evaluate() resolves each collected target, preserving order and per-target oracle use", async (t) => {
  const items: Array<Resolvable<Target, {}, Target>> = [
    {
      target: target1,
      expectations: expectations(Outcomes.Passed),
      oracleUsed: false,
    },
    {
      target: target2,
      expectations: expectations(Outcomes.Failed),
      oracleUsed: true,
    },
  ];

  const outcomes = Array.from(
    await evaluate(
      rule,
      undefined,
      Cache.empty(),
      undefined,
      collecting({ items: Sequence.from(items), oracleUsed: false }),
    ),
  );

  t.deepEqual(
    outcomes.map((outcome) => outcome.toJSON()),
    [
      passed(rule, target1, { "1": Outcomes.Passed }),
      failed(rule, target2, { "1": Outcomes.Failed }, Outcome.Mode.SemiAuto),
    ],
  );
});

test("evaluate() memoizes on the shared Cache, invoking collect once", async (t) => {
  const cache = Cache.empty();

  let calls = 0;
  const collect = () => {
    calls++;
    return Promise.resolve<Collected<Target, {}, Target>>({
      items: Sequence.empty(),
      oracleUsed: false,
    });
  };

  const a = evaluate(rule, undefined, cache, undefined, collect);
  const b = evaluate(rule, undefined, cache, undefined, collect);

  // The cache hit returns the exact same promise (physical identity).
  t(a === b);

  await a;

  t.equal(calls, 1);
});

test("evaluate() runs the resolve stage through measureResolve when provided", async (t) => {
  const items: Array<Resolvable<Target, {}, Target>> = [
    {
      target: target1,
      expectations: expectations(Outcomes.Passed),
      oracleUsed: false,
    },
  ];

  let wrapped = false;
  const measureResolve = <O>(run: () => Promise<O>): Promise<O> => {
    wrapped = true;
    return run();
  };

  await evaluate(
    rule,
    undefined,
    Cache.empty(),
    undefined,
    collecting({ items: Sequence.from(items), oracleUsed: false, measureResolve }),
  );

  t(wrapped);
});

test("evaluate() does not invoke measureResolve when no target is collected", async (t) => {
  let wrapped = false;
  const measureResolve = <O>(run: () => Promise<O>): Promise<O> => {
    wrapped = true;
    return run();
  };

  await evaluate(
    rule,
    undefined,
    Cache.empty(),
    undefined,
    collecting({ items: Sequence.empty(), oracleUsed: false, measureResolve }),
  );

  t(!wrapped);
});
