import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM, Node } from "@siteimprove/alfa-aria";
import { Element, Query } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import * as dom from "@siteimprove/alfa-dom";

import { expectation } from "../common/act/expectation";
import { Scope } from "../tags";

const { isIncludedInTheAccessibilityTree } = DOM;
const { and } = Predicate;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r54",
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        return getElementDescendants(document, dom.Node.fullTree).filter(
          and(isIncludedInTheAccessibilityTree(device), (element) =>
            Node.from(element, device)
              .attribute("aria-live")
              .some((attribute) => attribute.value === "assertive")
          )
        );
      },

      expectations(target) {
        return {
          1: expectation(
            Node.from(target, device)
              .attribute("aria-atomic")
              .some((attribute) => attribute.value.toLowerCase() === "true"),
            () => Outcomes.IsAtomic,
            () => Outcomes.IsNotAtomic
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
  export const IsAtomic = Ok.of(
    Diagnostic.of("The assertive region is atomic")
  );

  export const IsNotAtomic = Err.of(
    Diagnostic.of("The assertive region is not atomic")
  );
}
