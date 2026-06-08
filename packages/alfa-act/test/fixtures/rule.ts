import { Future } from "@siteimprove/alfa-future";
import { None, Option } from "@siteimprove/alfa-option";
import type { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Trilean } from "@siteimprove/alfa-trilean";

import {
  Diagnostic,
  Outcome,
  Question as ActQuestion,
  Rule as ActRule,
} from "../../src/index.ts";

import { Target } from "./target.ts";
import type {
  Applicable,
  Atomic,
  Composite,
  Expectation,
  Input,
  Metadata,
  Oracle,
  Question,
  TRule,
} from "./types.ts";

export namespace Outcomes {
  export const Passed = Ok.of(Diagnostic.of("passed"));
  export const Failed = Err.of(Diagnostic.of("failed"));
  // Placeholder used in Failed outcomes when an expectation was None (CantTell)
  // but the overall outcome is Failed due to another expectation.
  export const Placeholder = Err.of(Diagnostic.empty());

  export function isPassed(outcome: Applicable): Trilean {
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
  /**
   * Factory for Atomic rules with no questions.
   *
   * @remarks
   * The rule accepts an `Iterable<Target>` as input; applicable targets are those
   * whose value passes the applicability predicate.
   */
  export function makeAtomic(
    uri: string,
    applicability: Predicate<number>,
    expectations: (target: Target) => Expectation,
  ): Atomic {
    return ActRule.Atomic.of({
      uri,
      evaluate: (input) => ({
        applicability: () => [...input].filter((t) => applicability(t.value)),
        expectations,
      }),
    });
  }

  /**
   * Factory for Atomic rules with a single expectation and no questions.
   *
   * @remarks
   * Applicable targets are those whose value passes the `applicability` predicate;
   * they pass expectation "1" iff their value also passes the `expectations`
   * predicate.
   */
  export function makeSimple(
    uri: string,
    applicability: Predicate<number>,
    expectations: Predicate<number>,
  ): Atomic {
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

  /** Applicable to even numbers, pass multiples of 4 */
  export const twofour = makeSimple(
    "fixture:twofour",
    (value: number) => value % 2 === 0,
    (value: number) => value % 4 === 0,
  );

  /** Applicable to multiples of 3, pass multiples of 6 */
  export const threesix = makeSimple(
    "fixture:threesix",
    (value: number) => value % 3 === 0,
    (value: number) => value % 6 === 0,
  );

  const shouldPass = (target: Target): Question<boolean> =>
    ActQuestion.of<"boolean", Target, Target, boolean, "q1">(
      "boolean",
      "q1",
      `Should ${target.value} pass?`,
      target,
      target,
    );

  const shouldBeApplicable = (target: Target): Question<Option<Target>> =>
    ActQuestion.of<"boolean", Target, Target, boolean, "q1">(
      "boolean",
      "q1",
      `Is ${target.value} applicable?`,
      target,
      target,
    ).map((answer) => (answer ? Option.of(target) : None));

  /** Oracle factory, taking a trilean predicate to decide the answer */
  export function oracle(shouldPass: Trilean.Predicate<number>): Oracle {
    return (_, question) =>
      Future.now(Option.from(shouldPass(question.subject.value)));
  }

  /**
   * Factory for Atomic rules with a single pass/fail expectation asking a single
   * question.
   *
   * @remarks
   * The question is answered automatically if the target matches one of the
   * "auto" predicates.
   */
  export function withQuestion(
    uri: string,
    applicability: Predicate<number> = () => true,
    autoTrue: Predicate<number> = () => false,
    autoFalse: Predicate<number> = () => false,
  ): Atomic<Metadata> {
    return ActRule.Atomic.of<Input, Target, Metadata>({
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

  /**
   * Factory for Atomic rules with a question in the applicability phase.
   *
   * @remarks
   * All input targets are potential targets; a boolean question (`q1`) decides
   * whether each is applicable. `true` → `Some(target)` (included), `false` →
   * `None` (excluded). When the question is unanswered the target is silently
   * dropped — yielding Inapplicable if every target is dropped.
   * Targets that pass applicability always satisfy expectation "1".
   */
  export function withApplicabilityQuestion(
    uri: string,
    autoInclude: Predicate<number> = () => false,
    autoExclude: Predicate<number> = () => false,
  ): Atomic<Metadata> {
    return ActRule.Atomic.of<Input, Target, Metadata>({
      uri,
      evaluate: (input) => ({
        applicability: () =>
          [...input].map((target) =>
            shouldBeApplicable(target)
              .answerIf(autoInclude(target.value), true)
              .answerIf(autoExclude(target.value), false),
          ),
        expectations: () => ({
          "1": Outcomes.Passed,
        }),
      }),
    });
  }

  /** Factory for Composite rules taking the trilean "some" of its input rules. */
  export function makeComposite(
    uri: string,
    composes: Array<TRule>,
  ): Composite {
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

  /**
   * Factory for Composite rules with two expectations:
   * "1": Trilean.some — passes if any sub-rule outcome passes (lenient).
   * "2": Trilean.every — passes only if all sub-rule outcomes pass (strict).
   */
  export function makeDualComposite(
    uri: string,
    composes: Array<TRule>,
  ): Composite {
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
}
