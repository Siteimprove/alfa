import { test } from "@siteimprove/alfa-test";
import { None, Option } from "@siteimprove/alfa-option";
import type { Result } from "@siteimprove/alfa-result";
import { Record } from "@siteimprove/alfa-record";

import { Diagnostic, Finding, Outcome } from "@siteimprove/alfa-act";

import {
  cantTell,
  failed,
  inapplicable,
  passed,
  Outcomes,
  Rule as RuleFixture,
  Target,
} from "./fixtures/index.ts";

const rule = RuleFixture.alwaysInapplicable;
const target = Target.one;

type ANSWER = Array<[string, Option<Result<Diagnostic>>]>;

function conclusive(
  answer: Result<Diagnostic>,
  oracleUsed: boolean = false,
): Finding<ANSWER> {
  return Finding.conclusive<ANSWER>([["1", Option.of(answer)]], oracleUsed);
}

// ── Outcome.getMode ────────────────────────────────────────────────────────

test(".getMode() returns Automatic when oracleUsed is false", (t) => {
  t.equal(Outcome.getMode(false), Outcome.Mode.Automatic);
});

test(".getMode() returns SemiAuto when oracleUsed is true", (t) => {
  t.equal(Outcome.getMode(true), Outcome.Mode.SemiAuto);
});

// ── Outcome.fromFinding ────────────────────────────────────────────────────
const fromFinding = Outcome.fromFinding(rule, target);

test(".fromFinding() returns Passed when finding is conclusive Ok", (t) => {
  const finding = conclusive(Outcomes.Passed);

  t.deepEqual(
    fromFinding(finding).toJSON(),
    passed(rule, target, { "1": Outcomes.Passed }),
  );
});

test(".fromFinding() returns Failed when finding is conclusive Err", (t) => {
  const finding = conclusive(Outcomes.Failed);

  t.deepEqual(
    fromFinding(finding).toJSON(),
    failed(rule, target, { "1": Outcomes.Failed }),
  );
});

test(".fromFinding() returns SemiAuto mode when oracleUsed is true", (t) => {
  const finding = conclusive(Outcomes.Passed, true);

  t.equal(fromFinding(finding).toJSON().mode, Outcome.Mode.SemiAuto);
});

test(".fromFinding() returns CantTell with preserved diagnostic when finding is inconclusive", (t) => {
  const diag = Diagnostic.of("need answer");
  const finding = Finding.inconclusive(diag, false);

  t.deepEqual(fromFinding(finding).toJSON(), cantTell(rule, target, diag));
});

test(".fromFinding() returns SemiAuto mode when finding is inconclusive and oracleUsed is true", (t) => {
  const finding = Finding.inconclusive(Diagnostic.of("need answer"), true);

  t.equal(fromFinding(finding).toJSON().mode, Outcome.Mode.SemiAuto);
});

// ── Subclass factories: JSON shape ─────────────────────────────────────────

test("Inapplicable.of() returns an outcome with no target field", (t) => {
  t.deepEqual(
    Outcome.Inapplicable.of(rule, Outcome.Mode.Automatic).toJSON(),
    inapplicable(rule),
  );
});

test("Passed.of() returns an outcome with target and expectations", (t) => {
  t.deepEqual(
    Outcome.Passed.of(
      rule,
      target,
      Record.from([["1", Outcomes.Passed]]),
      Outcome.Mode.Automatic,
    ).toJSON(),
    passed(rule, target, { "1": Outcomes.Passed }),
  );
});

test("Failed.of() returns an outcome with target and expectations", (t) => {
  t.deepEqual(
    Outcome.Failed.of(
      rule,
      target,
      Record.from([["1", Outcomes.Failed]]),
      Outcome.Mode.Automatic,
    ).toJSON(),
    failed(rule, target, { "1": Outcomes.Failed }),
  );
});

test("CantTell.of() returns an outcome with target and diagnostic", (t) => {
  const diag = Diagnostic.of("unsure");
  t.deepEqual(
    Outcome.CantTell.of(rule, target, diag, Outcome.Mode.Automatic).toJSON(),
    cantTell(rule, target, diag),
  );
});

// ── isSemiAuto ─────────────────────────────────────────────────────────────

test("isSemiAuto returns true only for SemiAuto mode", (t) => {
  const auto = Outcome.Inapplicable.of(rule, Outcome.Mode.Automatic);
  const semi = Outcome.Inapplicable.of(rule, Outcome.Mode.SemiAuto);
  t(!auto.isSemiAuto);
  t(semi.isSemiAuto);
});

// ── Type guards ────────────────────────────────────────────────────────────

test("isPassed() / isFailed() / isCantTell() / isInapplicable() / isApplicable() return true only for the matching outcome type", (t) => {
  const p = Outcome.Passed.of(
    rule,
    target,
    Record.from(Object.entries({ "1": Outcomes.Passed })),
    Outcome.Mode.Automatic,
  );
  const f = Outcome.Failed.of(
    rule,
    target,
    Record.from(Object.entries({ "1": Outcomes.Failed })),
    Outcome.Mode.Automatic,
  );
  const c = Outcome.CantTell.of(
    rule,
    target,
    Diagnostic.empty(),
    Outcome.Mode.Automatic,
  );
  const i = Outcome.Inapplicable.of(rule, Outcome.Mode.Automatic);

  t(Outcome.Passed.isPassed(p));
  t(!Outcome.Failed.isFailed(p));
  t(Outcome.isApplicable(p));

  t(Outcome.Failed.isFailed(f));
  t(!Outcome.Passed.isPassed(f));
  t(Outcome.isApplicable(f));

  t(Outcome.CantTell.isCantTell(c));
  t(Outcome.isApplicable(c));

  t(Outcome.Inapplicable.isInapplicable(i));
  t(!Outcome.isApplicable(i));
});

// ── equals ─────────────────────────────────────────────────────────────────

test("equals() returns true when rule, target, and mode match", (t) => {
  const a = Outcome.Inapplicable.of(rule, Outcome.Mode.Automatic);
  const b = Outcome.Inapplicable.of(rule, Outcome.Mode.Automatic);
  t(a.equals(b));
});

test("equals() returns false when mode differs", (t) => {
  const a = Outcome.Inapplicable.of(rule, Outcome.Mode.Automatic);
  const b = Outcome.Inapplicable.of(rule, Outcome.Mode.SemiAuto);
  t(!a.equals(b));
});

test("equals() returns false when rule differs", (t) => {
  const other = RuleFixture.alwaysFail;
  const a = Outcome.Inapplicable.of(rule, Outcome.Mode.Automatic);
  const b = Outcome.Inapplicable.of(other, Outcome.Mode.Automatic);
  t(!a.equals(b));
});

// ── Outcome.fromFinding (multiple expectations) ────────────────────────────

test("Outcome.fromFinding() returns Passed when all expectations are Some(Ok)", (t) => {
  const finding = Finding.conclusive<ANSWER>(
    [
      ["1", Option.of(Outcomes.Passed)],
      ["2", Option.of(Outcomes.Passed)],
      ["3", Option.of(Outcomes.Passed)],
    ],
    false,
  );

  t.deepEqual(
    fromFinding(finding).toJSON(),
    passed(rule, target, {
      "1": Outcomes.Passed,
      "2": Outcomes.Passed,
      "3": Outcomes.Passed,
    }),
  );
});

test("Outcome.fromFinding() returns Failed when all expectations are Some(Err)", (t) => {
  const finding = Finding.conclusive<ANSWER>(
    [
      ["1", Option.of(Outcomes.Failed)],
      ["2", Option.of(Outcomes.Failed)],
    ],
    false,
  );

  t.deepEqual(
    fromFinding(finding).toJSON(),
    failed(rule, target, {
      "1": Outcomes.Failed,
      "2": Outcomes.Failed,
    }),
  );
});

test("Outcome.fromFinding() returns Failed when some expectations are Ok and one is Err", (t) => {
  const finding = Finding.conclusive<ANSWER>(
    [
      ["1", Option.of(Outcomes.Passed)],
      ["2", Option.of(Outcomes.Failed)],
      ["3", Option.of(Outcomes.Passed)],
    ],
    false,
  );

  t.deepEqual(
    fromFinding(finding).toJSON(),
    failed(rule, target, {
      "1": Outcomes.Passed,
      "2": Outcomes.Failed,
      "3": Outcomes.Passed,
    }),
  );
});

test("Outcome.fromFinding() returns CantTell when some expectations are None and none are Err", (t) => {
  const finding = Finding.conclusive<ANSWER>(
    [
      ["1", Option.of(Outcomes.Passed)],
      ["2", None],
    ],
    false,
  );

  t.deepEqual(fromFinding(finding).toJSON(), cantTell(rule, target));
});

test("Outcome.fromFinding() returns Failed when some expectations are Err and others are None", (t) => {
  // None expectations become Placeholder (Err of empty Diagnostic) in Failed outcomes.
  const finding = Finding.conclusive<ANSWER>(
    [
      ["1", Option.of(Outcomes.Failed)],
      ["2", None],
    ],
    false,
  );

  t.deepEqual(
    fromFinding(finding).toJSON(),
    failed(rule, target, {
      "1": Outcomes.Failed,
      "2": Outcomes.Placeholder,
    }),
  );
});

test("Outcome.fromFinding() returns Failed when expectations mix Ok, Err, and None", (t) => {
  // Err beats everything; None becomes Placeholder; Ok is preserved as-is.
  const finding = Finding.conclusive<ANSWER>(
    [
      ["1", Option.of(Outcomes.Passed)],
      ["2", Option.of(Outcomes.Failed)],
      ["3", None],
    ],
    false,
  );

  t.deepEqual(
    fromFinding(finding).toJSON(),
    failed(rule, target, {
      "1": Outcomes.Passed,
      "2": Outcomes.Failed,
      "3": Outcomes.Placeholder,
    }),
  );
});

test("Outcome.fromFinding() returns CantTell when all expectations are None", (t) => {
  const finding = Finding.conclusive<ANSWER>(
    [
      ["1", None],
      ["2", None],
    ],
    false,
  );

  t.deepEqual(fromFinding(finding).toJSON(), cantTell(rule, target));
});
