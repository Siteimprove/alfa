import { Audit, Outcome, Rule } from "@siteimprove/alfa-act";
import { Attribute, Document, Element } from "@siteimprove/alfa-dom";
import { Future } from "@siteimprove/alfa-future";
import { Equality } from "@siteimprove/alfa-equality";
import { Iterable } from "@siteimprove/alfa-iterable";
import { List } from "@siteimprove/alfa-list";
import { Option } from "@siteimprove/alfa-option";
import { Rules } from "@siteimprove/alfa-rules";
import * as web from "@siteimprove/alfa-web";

const { find, reduce } = Iterable;

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

    public toJSON(): { target: T; reasons: Array<string> } {
      return {
        target: this.target,
        reasons: this.reasons.toJSON()
      };
    }
  }

  export namespace Page {
    export type Target = Document | Element | Attribute | Iterable<Element>;

    export function isAccessible(
      page: web.Page,
      scope: Iterable<Rule<web.Page, Target>> = Rules.values()
    ): Future<Option<Error<Target>>> {
      const audit = reduce(
        scope,
        (audit, rule) => audit.add(rule),
        Audit.of(page)
      );

      return audit.evaluate().map(outcomes =>
        find(outcomes, (outcome): outcome is Outcome.Failed<web.Page, Target> =>
          Outcome.isFailed(outcome)
        ).map(outcome => {
          const { target, expectations } = outcome;

          const reasons = reduce(
            expectations,
            (reasons, [id, expectation]) =>
              expectation.isOk() ? reasons.push(expectation.get()) : reasons,
            List.empty<string>()
          );

          return Error.of(target, reasons);
        })
      );
    }
  }
}
