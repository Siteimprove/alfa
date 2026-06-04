import { test } from "@siteimprove/alfa-test";
import { Future } from "@siteimprove/alfa-future";
import { None, Option } from "@siteimprove/alfa-option";

import {
  Diagnostic,
  Finding,
  Interview,
  type Oracle,
  Question,
} from "../src/index.ts";

import { Target, Rule as RuleFixture } from "./fixtures/index.ts";
import type { Atomic, Input, Metadata } from "./fixtures/index.ts";

const noOracle: Oracle<Input, Target, Metadata, Target> = () =>
  Future.now(None);

function useOracle(
  oracle: Oracle<Input, Target, Metadata, Target>,
): [calls: { count: number }, oracle: Oracle<Input, Target, Metadata, Target>] {
  const calls = { count: 0 };

  const countingOracle: Oracle<Input, Target, Metadata, Target> = (
    rule,
    question,
  ) => {
    calls.count++;
    return oracle(rule, question);
  };

  return [calls, countingOracle];
}

const target1 = Target.one;
const question = Question.of<"number", Target, Target, number, "q2">(
  "number",
  "q2",
  "?",
  target1,
  target1,
);

// Inside an interview, the rule only matters as an argument to the oracle. We
// don't care for these test and can pick any rule.
const rule: Atomic<Metadata> = RuleFixture.alwaysInapplicable;

test(".conduct() returns a conclusive finding without using oracle when the interview is a direct answer", async (t) => {
  const [calls, oracle] = useOracle(noOracle);
  const finding = await Interview.conduct("answer", rule, oracle);

  t(Finding.isConclusive(finding));
  t.equal(calls.count, 0);
  t.deepEqual(finding.left().getUnsafe(), ["answer", false]);
});

test(".conduct() returns a conclusive finding without consulting the oracle when given a rhetorical question", async (t) => {
  const q = question.answerIf(true, 42);
  const [calls, oracle] = useOracle(noOracle);
  const finding = await Interview.conduct(q, rule, oracle);

  t(Finding.isConclusive(finding));
  t.equal(calls.count, 0);
  t.deepEqual(finding.left().getUnsafe(), [42, false]);
});

test(".conduct() returns a conclusive finding with oracleUsed true when the oracle answers", async (t) => {
  const [calls, oracle] = useOracle(() => Future.now(Option.of(42)));
  const finding = await Interview.conduct(question, rule, oracle);

  t(Finding.isConclusive(finding));
  t.equal(calls.count, 1);
  t.deepEqual(finding.left().getUnsafe(), [42, true]);
});

test(".conduct() returns a conclusive finding via fallback calling but not using an oracle that returns None", async (t) => {
  const q = Question.of(
    "boolean" as const,
    "q1" as const,
    "?",
    target1,
    target1,
    {
      fallback: Option.of(false),
    },
  );
  const [calls, oracle] = useOracle(noOracle);
  const finding = await Interview.conduct(q, rule, oracle);

  t(Finding.isConclusive(finding));
  // Oracle was called (count 1) but returned None; fallback was used instead.
  t.equal(calls.count, 1);
  t.deepEqual(finding.left().getUnsafe(), [false, false]);
});

test(".conduct() returns an inconclusive finding with the question diagnostic when the oracle returns None and no fallback is present", async (t) => {
  const diag = Diagnostic.of("need answer");
  const q = Question.of("boolean", "q1" as const, "?", target1, target1, {
    diagnostic: diag,
  });
  const [calls, oracle] = useOracle(noOracle);
  const finding = await Interview.conduct(q, rule, oracle);

  t(Finding.isInconclusive(finding));
  // Oracle was called (count 1) but returned None; interview is inconclusive.
  t.equal(calls.count, 1);
  t.deepEqual(finding.right().getUnsafe(), [diag, false]);
});

test(".conduct() preserves oracleUsed true in the conclusive finding when passed in", async (t) => {
  const [calls, oracle] = useOracle(noOracle);
  const finding = await Interview.conduct("answer", rule, oracle, true);

  t(Finding.isConclusive(finding));
  t.equal(calls.count, 0);
  t.deepEqual(finding.left().getUnsafe(), ["answer", true]);
});

test(".conduct() returns a conclusive finding when oracle answers all questions in a chain", async (t) => {
  // q1 answered (true) → q2 answered (42) → conclusive
  const chain = Question.of<"boolean", Target, Target, boolean, "q1">(
    "boolean",
    "q1",
    "?",
    target1,
    target1,
  ).map((_) => question);

  const [calls, oracle] = useOracle((_, q) =>
    q.uri === "q1"
      ? Future.now(Option.of<boolean>(true))
      : Future.now(Option.of<number>(42)),
  );

  const finding = await Interview.conduct(chain, rule, oracle);

  t(Finding.isConclusive(finding));
  t.equal(calls.count, 2);
  t.deepEqual(finding.left().getUnsafe(), [42, true]);
});

test(".conduct() returns an inconclusive finding with the first unanswered question's diagnostic in a chain", async (t) => {
  const diag1 = Diagnostic.of("need q1 answer");
  const diag2 = Diagnostic.of("need q2 answer");

  const q2 = Question.of<"number", Target, Target, number, "q2">(
    "number",
    "q2",
    "?",
    target1,
    target1,
    { diagnostic: diag2 },
  );
  const chain = Question.of<"boolean", Target, Target, boolean, "q1">(
    "boolean",
    "q1",
    "?",
    target1,
    target1,
    { diagnostic: diag1 },
  ).map((_) => q2);

  // Oracle answers q1 but not q2 → inconclusive at q2; oracleUsed is true.
  // Both questions were consulted (count 2): q1 answered, q2 returned None.
  const [callsQ1, oracleAnswersQ1] = useOracle((_, q) =>
    q.uri === "q1" ? Future.now(Option.of<boolean>(true)) : Future.now(None),
  );

  const findingAtQ2 = await Interview.conduct(chain, rule, oracleAnswersQ1);

  t(Finding.isInconclusive(findingAtQ2));
  t.equal(callsQ1.count, 2);
  t.deepEqual(findingAtQ2.right().getUnsafe(), [diag2, true]);

  // Oracle answers nothing → inconclusive at q1; oracleUsed is false.
  // Only q1 was consulted (count 1): it returned None, so the chain stopped there.
  const [callsNone, oracleNone] = useOracle(noOracle);
  const findingAtQ1 = await Interview.conduct(chain, rule, oracleNone);

  t(Finding.isInconclusive(findingAtQ1));
  t.equal(callsNone.count, 1);
  t.deepEqual(findingAtQ1.right().getUnsafe(), [diag1, false]);
});
