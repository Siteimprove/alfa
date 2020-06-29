import { Audit, Outcome, Rule } from "@siteimprove/alfa-act";
import { Attribute, Document, Element, Text } from "@siteimprove/alfa-dom";
import { Future } from "@siteimprove/alfa-future";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { List } from "@siteimprove/alfa-list";
import { Option } from "@siteimprove/alfa-option";
import { Rules } from "@siteimprove/alfa-rules";
import * as web from "@siteimprove/alfa-web";

const { find, reduce } = Iterable;

export namespace Assert {
  export class Error<T> implements Equatable {
    public static of<T>(target: T, reasons: Iterable<string>): Error<T> {
      return new Error(target, List.from(reasons));
    }

    public readonly target: T;
    public readonly reasons: List<string>;

    private constructor(target: T, reasons: List<string>) {
      this.target = target;
      this.reasons = reasons;
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Error &&
        Equatable.equals(value.target, this.target) &&
        value.reasons.equals(this.reasons)
      );
    }

    public toJSON() {
      return {
        target: this.target,
        reasons: this.reasons.toJSON(),
      };
    }
  }

  export namespace Page {
    export type Target =
      | Document
      | Element
      | Attribute
      | Text
      | Iterable<Element>;

    export function isAccessible(
      page: web.Page,
      scope: Iterable<Rule<web.Page, Target, any>> = Rules.values()
    ): Future<Option<Error<Target>>> {
      const audit = reduce(
        scope,
        (audit, rule) => audit.add(rule),
        Audit.of(page)
      );

      return audit.evaluate().map((outcomes) =>
        find(outcomes, (outcome): outcome is Outcome.Failed<web.Page, Target> =>
          Outcome.isFailed(outcome)
        ).map((outcome) => {
          const { target, expectations } = outcome;

          const reasons = reduce(
            expectations,
            (reasons, [id, expectation]) =>
              expectation.isOk()
                ? reasons.append(expectation.get().message)
                : reasons,
            List.empty<string>()
          );

          return Error.of(target, reasons);
        })
      );
    }
  }
}
