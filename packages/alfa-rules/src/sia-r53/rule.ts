import { Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import type { Element } from "@siteimprove/alfa-dom";
import { Node, Query } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import type { Page } from "@siteimprove/alfa-web";
import { Option } from "@siteimprove/alfa-option";

import { expectation } from "../common/act/index.js";
import { BestPractice } from "../requirements/index.js";

import { Scope, Stability } from "../tags/index.js";
import { WithOtherHeading } from "../common/diagnostic.js";

const { hasHeadingLevel, hasRole, isIncludedInTheAccessibilityTree } = DOM;
const { and, equals, tee } = Predicate;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r53",
  requirements: [BestPractice.of("headings-structured")],
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
        // * The target is in headings by construction of the applicability.
        // * The first element of heading is not a target due to the .skip(1)
        // * Therefore headings contain at least on element before the target.
        const previousHeading = headings
          .takeUntil(equals(target))
          .last()
          .getUnsafe();

        let previousLevel = -1;
        let currentLevel = -1;

        return {
          1: expectation(
            hasHeadingLevel(
              device,
              tee(
                (currentLevel) =>
                  hasHeadingLevel(
                    device,
                    tee(
                      (previousLevel) => previousLevel >= currentLevel - 1,
                      (p) => (previousLevel = p),
                    ),
                  )(previousHeading),
                (c) => (currentLevel = c),
              ),
            )(target),
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
        "previous",
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
        "previous",
      ),
    );
}
