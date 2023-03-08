import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Hash } from "@siteimprove/alfa-hash";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { Scope } from "../tags";

const { hasHeadingLevel, hasRole, isIncludedInTheAccessibilityTree } = DOM;
const { and, equals } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r53",
  tags: [Scope.Component],
  evaluate({ device, document }) {
    const headings = document
      .elementDescendants(Node.flatTree)
      .filter(
        and(
          hasRole(device, "heading"),
          isIncludedInTheAccessibilityTree(device)
        )
      );

    return {
      applicability() {
        return headings.skip(1);
      },

      expectations(target) {
        // * The target is in headings by construction of the applicability.
        // * The first element of heading is not a target due to the .skip(1)
        // * Therefore headings contain at least on element before the target.
        const previous = headings.takeUntil(equals(target)).last().getUnsafe();

        return {
          1: expectation(
            hasHeadingLevel(device, (currentLevel) =>
              hasHeadingLevel(
                device,
                (previousLevel) => previousLevel >= currentLevel - 1
              )(previous)
            )(target),
            () => Outcomes.IsStructured(previous),
            () => Outcomes.IsNotStructured(previous)
          ),
        };
      },
    };
  },
});

/**
 * @public
 */
export class WithPreviousHeading extends Diagnostic {
  public static of(message: string): Diagnostic;

  public static of(message: string, previous: Element): WithPreviousHeading;

  public static of(message: string, previous?: Element): Diagnostic {
    return previous === undefined
      ? Diagnostic.of(message)
      : new WithPreviousHeading(message, previous);
  }

  private readonly _previous: Element;

  constructor(message: string, previous: Element) {
    super(message);
    this._previous = previous;
  }

  public get previous(): Element {
    return this._previous;
  }

  equals(value: WithPreviousHeading): value is this;

  equals(value: unknown): value is this;

  equals(value: unknown): boolean {
    return (
      value instanceof WithPreviousHeading &&
      value._message === this._message &&
      value._previous.equals(this._previous)
    );
  }

  public hash(hash: Hash) {
    super.hash(hash);
    this._previous.hash(hash);
  }

  toJSON(): WithPreviousHeading.JSON {
    return { ...super.toJSON(), previous: this._previous.toJSON() };
  }
}

/**
 * @public
 */
export namespace WithPreviousHeading {
  export interface JSON extends Diagnostic.JSON {
    previous: Element.JSON;
  }

  export function isWithPreviousHeading(
    value: unknown
  ): value is WithPreviousHeading {
    return value instanceof WithPreviousHeading;
  }
}

export namespace Outcomes {
  export const IsStructured = (previous: Element) =>
    Ok.of(WithPreviousHeading.of(`The heading is correctly ordered`, previous));

  export const IsNotStructured = (previous: Element) =>
    Err.of(
      WithPreviousHeading.of(`The heading skips one or more levels`, previous)
    );
}
