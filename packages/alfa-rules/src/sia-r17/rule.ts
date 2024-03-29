import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Element, Node, Query } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";
import { WithBadElements } from "../common/diagnostic/with-bad-elements";

import { Scope, Stability } from "../tags";

const { hasAttribute, isElement } = Element;
const { equals } = Predicate;
const { and } = Refinement;
const { isTabbable } = Style;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r17",
  requirements: [Criterion.of("4.1.2")],
  tags: [Scope.Component, Stability.Stable],
  evaluate({ device, document }) {
    return {
      applicability() {
        return getElementDescendants(document, Node.fullTree).filter(
          hasAttribute("aria-hidden", equals("true")),
        );
      },

      expectations(target) {
        const tabbable = target
          .inclusiveDescendants(Node.flatTree)
          .filter(and(isElement, isTabbable(device)));

        return {
          1: expectation(
            tabbable.isEmpty(),
            () => Outcomes.IsNotTabbable,
            () => Outcomes.IsTabbable(tabbable),
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
  export const IsNotTabbable = Ok.of(
    Diagnostic.of(
      `The element is neither tabbable nor has tabbable descendants`,
    ),
  );

  export const IsTabbable = (errors: Iterable<Element>) =>
    Err.of(
      WithBadElements.of(
        `The element is either tabbable or has tabbable descendants`,
        errors,
      ),
    );
}
