import { Future } from "@siteimprove/alfa-future";
import { Iterable } from "@siteimprove/alfa-iterable";
import { type Maybe, None, Option } from "@siteimprove/alfa-option";
import type { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err, type Result } from "@siteimprove/alfa-result";
import { Trilean } from "@siteimprove/alfa-trilean";

import {
  Diagnostic,
  type Oracle,
  Outcome,
  Question,
  Rule as ActRule,
} from "../../src/index.ts";

import { Target } from "./target.ts";

// Type of questions asked in fixture rules.
type Q = { q1: [string, boolean] };

type Input = Iterable<Target>;

export namespace Outcomes {
  export const Passed = Ok.of(Diagnostic.of("passed"));
  export const Failed = Err.of(Diagnostic.of("failed"));
  // Placeholder used in Failed outcomes when an expectation was None (CantTell)
  // but the overall outcome is Failed due to another expectation.
  export const Placeholder = Err.of(Diagnostic.empty());

  export function isPassed(
    outcome: Outcome.Applicable<Input, Target, Q>,
  ): Trilean {
    if (Outcome.isPassed(outcome)) {
      return true;
    }

    if (Outcome.isFailed(outcome)) {
      return false;
    }

    return undefined;
  }
}

export namespace Rule {
  // Factory for Atomic rules with no questions.
  // The rule accepts an Iterable<Target> as input; applicable targets are those
  // whose value passes the predicate.
  export function makeAtomic(
    uri: string,
    applicability: Predicate<number>,
    expectations: (target: Target) => {
      [key: string]: Maybe<Result<Diagnostic>>;
    },
  ): ActRule.Atomic<Input, Target> {
    return ActRule.Atomic.of({
      uri,
      evaluate: (input) => ({
        applicability: () => [...input].filter((t) => applicability(t.value)),
        expectations,
      }),
    });
  }

  // Factory for Atomic rules with a single pass/fail expectation and no questions.
  // Applicable targets are those whose value passes `applicability`; they pass
  // expectation "1" iff their value also passes `expectations`.
  export function makeSimple(
    uri: string,
    applicability: Predicate<number>,
    expectations: Predicate<number>,
  ): ActRule.Atomic<Input, Target> {
    return makeAtomic(uri, applicability, (t) => ({
      "1": expectations(t.value) ? Outcomes.Passed : Outcomes.Failed,
    }));
  }

  export const alwaysPass = makeSimple(
    "fixture:always-pass",
    () => true,
    () => true,
  );

  export const alwaysFail = makeSimple(
    "fixture:always-fail",
    () => true,
    () => false,
  );

  export const alwaysInapplicable = makeSimple(
    "fixture:always-inapplicable",
    () => false,
    () => false,
  );

  // Applicable to even numbers, pass multiples of 4
  export const twofour = makeSimple(
    "fixture:twofour",
    (value: number) => value % 2 === 0,
    (value: number) => value % 4 === 0,
  );

  // Applicable to multiples of 3, pass multiples of 6
  export const threesix = makeSimple(
    "fixture:threesix",
    (value: number) => value % 3 === 0,
    (value: number) => value % 6 === 0,
  );

  const shouldPass = (target: Target) =>
    Question.of<string, Target, Target, boolean, "q1">(
      "boolean",
      "q1",
      `Should ${target.value} pass?`,
      target,
      target,
    );

  export function oracle(
    shouldPass: Trilean.Predicate<number>,
  ): Oracle<Input, Target, Q, Target> {
    return (_, question) =>
      Future.now(Option.from(shouldPass(question.subject.value)));
  }

  // Factory for Atomic rules with a single pass/fail expectation asking a single
  // question.
  // The question is answered automatically if the target matches one of the
  // "auto" predicates.
  export function withQuestion(
    uri: string,
    applicability: Predicate<number> = () => true,
    autoTrue: Predicate<number> = () => false,
    autoFalse: Predicate<number> = () => false,
  ): ActRule.Atomic<Input, Target, Q> {
    return ActRule.Atomic.of<Input, Target, Q>({
      uri,
      evaluate: (input) => ({
        applicability: () =>
          [...input].filter((target) => applicability(target.value)),
        expectations: (target) => ({
          "1": shouldPass(target)
            .answerIf(autoTrue(target.value), true)
            .answerIf(autoFalse(target.value), false)
            .map((answer) => (answer ? Outcomes.Passed : Outcomes.Failed)),
        }),
      }),
    });
  }

  // Factory for Composite rules with two expectations:
  // "1": Trilean.some — passes if any sub-rule outcome passes (lenient).
  // "2": Trilean.every — passes only if all sub-rule outcomes pass (strict).
  export function makeDualComposite(
    uri: string,
    composes: Array<ActRule<Input, Target, Q>>,
  ): ActRule.Composite<Input, Target, Q> {
    return ActRule.Composite.of({
      uri,
      composes,
      evaluate() {
        return {
          expectations(outcomes) {
            return {
              "1": Trilean.fold(
                (outcomes) => Trilean.some(outcomes, Outcomes.isPassed),
                () => Outcomes.Passed,
                () => Outcomes.Failed,
                () => None,
                outcomes,
              ),
              "2": Trilean.fold(
                (outcomes) => Trilean.every(outcomes, Outcomes.isPassed),
                () => Outcomes.Passed,
                () => Outcomes.Failed,
                () => None,
                outcomes,
              ),
            };
          },
        };
      },
    });
  }

  // Factory for Composite rules taking the trilean "some" of its input rules.
  export function makeComposite(
    uri: string,
    composes: Array<ActRule<Input, Target, Q>>,
  ): ActRule.Composite<Input, Target, Q> {
    return ActRule.Composite.of({
      uri,
      composes,
      evaluate() {
        return {
          expectations(outcomes) {
            return {
              1: Trilean.fold(
                (outcomes) => Trilean.some(outcomes, Outcomes.isPassed),
                () => Outcomes.Passed,
                () => Outcomes.Failed,
                () => None,
                outcomes,
              ),
            };
          },
        };
      },
    });
  }
}
