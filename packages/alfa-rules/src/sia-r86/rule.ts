import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import type { Element } from "@siteimprove/alfa-dom";
import { Node, Query } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";
import type { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/index.js";
import { BestPractice } from "../requirements/index.js";

import { Scope, Stability } from "../tags/index.js";

const { isIncludedInTheAccessibilityTree, isMarkedDecorative } = DOM;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r86",
  requirements: [
    BestPractice.of("element-marked-as-decorative-is-not-exposed"),
  ],
  tags: [Scope.Component, Stability.Stable],
  evaluate({ device, document }) {
    return {
      applicability() {
        return getElementDescendants(document, Node.fullTree).filter(
          isMarkedDecorative,
        );
      },

      expectations(target) {
        return {
          1: expectation(
            isIncludedInTheAccessibilityTree(device)(target),
            () => Outcomes.IsExposed,
            () => Outcomes.IsNotExposed,
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
  export const IsNotExposed = Ok.of(
    Diagnostic.of(`The element is marked as decorative and is not exposed`),
  );

  export const IsExposed = Err.of(
    Diagnostic.of(`The element is marked as decorative but is exposed`),
  );
}
