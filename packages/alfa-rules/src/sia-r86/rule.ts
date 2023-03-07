import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { Scope } from "../tags";

const { isIncludedInTheAccessibilityTree, isMarkedDecorative } = DOM;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r86",
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .elementDescendants(Node.fullTree)
          .filter(isMarkedDecorative);
      },

      expectations(target) {
        return {
          1: expectation(
            isIncludedInTheAccessibilityTree(device)(target),
            () => Outcomes.IsExposed,
            () => Outcomes.IsNotExposed
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const IsNotExposed = Ok.of(
    Diagnostic.of(`The element is marked as decorative and is not exposed`)
  );

  export const IsExposed = Err.of(
    Diagnostic.of(`The element is marked as decorative but is exposed`)
  );
}
