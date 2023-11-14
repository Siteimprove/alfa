import { Rule } from "@siteimprove/alfa-act";
import { DOM, Node as ariaNode } from "@siteimprove/alfa-aria";
import { Element, Node, Query } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";
import { Option } from "@siteimprove/alfa-option";

import { expectation } from "../common/act/expectation";

import { Scope, Stability } from "../tags";
import { WithOtherHeading } from "../common/diagnostic";

const { hasHeadingLevel, hasRole, isIncludedInTheAccessibilityTree } = DOM;
const { and, equals } = Predicate;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r53",
  tags: [Scope.Component, Stability.Stable],
  evaluate({ device, document }) {
    const headings = getElementDescendants(document, Node.flatTree).filter(
      and(hasRole(device, "heading"), isIncludedInTheAccessibilityTree(device)),
    );

    return {
      applicability() {
        return headings.skip(1);
      },

      expectations(target) {
        const currentLevel = ariaNode
          .from(target, device)
          .attribute("aria-level")
          .map((level) => Number(level.value))
          .getUnsafe(); // TODO: Is this safe? Is a heading guaranteed to have aria-level?

        // * The target is in headings by construction of the applicability.
        // * The first element of heading is not a target due to the .skip(1)
        // * Therefore headings contain at least on element before the target.
        const previousHeading = headings
          .takeUntil(equals(target))
          .last()
          .getUnsafe();

        const previousLevel = ariaNode
          .from(previousHeading, device)
          .attribute("aria-level")
          .map((level) => Number(level.value))
          .getUnsafe(); // TODO: Is this safe? Is a heading guaranteed to have aria-level?

        return {
          1: expectation(
            previousLevel >= currentLevel - 1,
            () =>
              Outcomes.IsStructured(
                previousHeading,
                currentLevel,
                previousLevel,
              ),
            () =>
              Outcomes.IsNotStructured(
                previousHeading,
                currentLevel,
                previousLevel,
              ),
          ),
        };
      },
    };
  },
});

/**
 * @public
 */
export namespace Outcomes {
  export const IsStructured = (
    previousHeading: Element,
    currentLevel: number,
    previousLevel: number,
  ) =>
    Ok.of(
      WithOtherHeading.of(
        `The heading is correctly ordered`,
        Option.of(previousHeading),
        currentLevel,
        previousLevel,
      ),
    );

  export const IsNotStructured = (
    previousHeading: Element,
    currentLevel: number,
    previousLevel: number,
  ) =>
    Err.of(
      WithOtherHeading.of(
        `The heading skips one or more levels`,
        Option.of(previousHeading),
        currentLevel,
        previousLevel,
      ),
    );
}
