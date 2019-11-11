import { Outcome, Rule } from "@siteimprove/alfa-act";
import * as dom from "@siteimprove/alfa-dom";
import { Equality } from "@siteimprove/alfa-equality";
import { Iterable } from "@siteimprove/alfa-iterable";
import { List } from "@siteimprove/alfa-list";
import { None, Option } from "@siteimprove/alfa-option";
import { Rules } from "@siteimprove/alfa-rules";
import * as web from "@siteimprove/alfa-web";

export namespace Assert {
  export class Error<T> implements Equality<Error<T>> {
    public static of<T>(target: T, reasons: Iterable<string>): Error<T> {
      return new Error(target, List.from(reasons));
    }

    public readonly target: T;
    public readonly reasons: List<string>;

    private constructor(target: T, reasons: List<string>) {
      this.target = target;
      this.reasons = reasons;
    }

    public equals(value: unknown): value is Error<T> {
      return (
        value instanceof Error &&
        Equality.equals(value.target, this.target) &&
        value.reasons.equals(this.reasons)
      );
    }

    public toJSON() {
      return {
        target: this.target,
        reasons: this.reasons.toJSON()
      };
    }
  }

  export function doesNotFail<I, T>(
    input: I,
    rule: Rule<I, T>
  ): Option<Error<T>> {
    return Iterable.find(
      rule.evaluate(input),
      (outcome): outcome is Outcome.Failed<I, T> => Outcome.isFailed(outcome)
    ).map(outcome => {
      const { target, expectations } = outcome;

      const reasons = Iterable.reduce(
        expectations,
        (reasons, [id, expectation]) =>
          expectation.isErr() ? reasons.push(expectation.getErr()) : reasons,
        List.empty<string>()
      );

      return Error.of(target, reasons);
    });
  }

  export function doesNotPass<I, T>(
    input: I,
    rule: Rule<I, T>
  ): Option<Error<T>> {
    return Iterable.find(
      rule.evaluate(input),
      (outcome): outcome is Outcome.Passed<I, T> => Outcome.isPassed(outcome)
    ).map(outcome => {
      const { target, expectations } = outcome;

      const reasons = Iterable.reduce(
        expectations,
        (reasons, [id, expectation]) =>
          expectation.isOk() ? reasons.push(expectation.get()) : reasons,
        List.empty<string>()
      );

      return Error.of(target, reasons);
    });
  }

  export namespace Page {
    export type Target = dom.Document | dom.Element;

    const rules = [Rules.R1, Rules.R2];

    export function isAccessible(
      page: web.Page,
      scope: Iterable<Rule<web.Page, Target>> = rules
    ): Option<Error<Target>> {
      for (const rule of scope) {
        const error = doesNotFail(page, rule);

        if (error.isSome()) {
          return error;
        }
      }

      return None;
    }

    export function isNotAccessible(
      page: web.Page,
      scope: Iterable<Rule<web.Page, Target>> = rules
    ): Option<Error<Target>> {
      for (const rule of scope) {
        const error = doesNotPass(page, rule);

        if (error.isSome()) {
          return error;
        }
      }

      return None;
    }
  }
}
