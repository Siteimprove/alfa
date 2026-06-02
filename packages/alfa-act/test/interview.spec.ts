import { test } from "@siteimprove/alfa-test";
import { Future } from "@siteimprove/alfa-future";
import { None, Option } from "@siteimprove/alfa-option";

import {
  Diagnostic,
  Interview,
  type Oracle,
  Question,
  Rule,
} from "../src/index.ts";

import { Target } from "./fixtures/target.ts";

type Metadata = { q1: ["boolean", boolean]; q2: ["number", number] };

const noOracle: Oracle<{}, Target, Metadata, Target> = () => Future.now(None);

const target1 = Target.one;

const rule = Rule.Atomic.of<{}, Target, Metadata, Target>({
  uri: "test:interview",
  evaluate: () => ({
    applicability: () => [],
    expectations: () => ({}),
  }),
});

test("conduct() returns a conclusive finding when given a direct answer", async (t) => {
  const finding = await Interview.conduct(true, rule, noOracle);
  t(finding.isLeft());
  if (finding.isLeft()) {
    t.deepEqual(finding.get(), [true, false]);
  }
});

test("conduct() returns a conclusive finding without consulting the oracle when given a rhetorical question", async (t) => {
  let oracleCalled = false;
  const q = Question.of("bool", "q1" as const, "?", target1, target1).answerIf(
    true,
    true,
  );
  const oracle = () => {
    oracleCalled = true;
    return Future.now(None);
  };
  const finding = await Interview.conduct(q, rule, oracle);
  t(!oracleCalled);
  t(finding.isLeft());
  if (finding.isLeft()) {
    t.equal(finding.get()[1], false);
  }
});

test("conduct() returns a conclusive finding with oracleUsed true when the oracle answers", async (t) => {
  const q = Question.of("boolean", "q1" as const, "?", target1, target1);
  const oracle = () => Future.now(Option.of(true as boolean));
  const finding = await Interview.conduct(q, rule, oracle);
  t(finding.isLeft());
  if (finding.isLeft()) {
    t.deepEqual(finding.get(), [true, true]);
  }
});

test("conduct() returns a conclusive finding via fallback when oracle returns None", async (t) => {
  const q = Question.of(
    "boolean" as const,
    "q1" as const,
    "?",
    target1,
    target1,
    {
      fallback: Option.of(false as boolean),
    },
  );
  const finding = await Interview.conduct(q, rule, noOracle);
  t(finding.isLeft());
  if (finding.isLeft()) {
    t.deepEqual(finding.get(), [false, false]);
  }
});

test("conduct() returns an inconclusive finding with the question diagnostic when oracle returns None and no fallback is present", async (t) => {
  const diag = Diagnostic.of("need answer");
  const q = Question.of("boolean", "q1" as const, "?", target1, target1, {
    diagnostic: diag,
  });
  const finding = await Interview.conduct(q, rule, noOracle);
  t(finding.isRight());
  if (finding.isRight()) {
    t(finding.get()[0].equals(diag));
    t.equal(finding.get()[1], false);
  }
});

test("conduct() preserves oracleUsed true in the conclusive finding when passed in", async (t) => {
  const finding = await Interview.conduct(true, rule, noOracle, true);
  t(finding.isLeft());
  if (finding.isLeft()) {
    t.deepEqual(finding.get(), [true, true]);
  }
});
