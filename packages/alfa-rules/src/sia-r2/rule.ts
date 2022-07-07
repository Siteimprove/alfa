import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Element, Namespace, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { Scope } from "../tags";

const { hasNonEmptyAccessibleName, hasRole, isIncludedInTheAccessibilityTree } =
  DOM;
const { isElement, hasNamespace } = Element;
const { and } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r2",
  requirements: [
    Criterion.of("1.1.1"),
    Technique.of("G94"),
    Technique.of("G95"),
  ],
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants(Node.fullTree)
          .filter(isElement)
          .filter(
            and(
              hasNamespace(Namespace.HTML),
              hasRole(device, "img"),
              isIncludedInTheAccessibilityTree(device)
            )
          );
      },

      expectations(target) {
        return {
          1: expectation(
            hasNonEmptyAccessibleName(device)(target),
            () => Outcomes.HasAccessibleName,
            () => Outcomes.HasNoAccessibleName
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasAccessibleName = Ok.of(
    Diagnostic.of(`The image has an accessible name`)
  );

  export const HasNoAccessibleName = Err.of(
    Diagnostic.of(`The image does not have an accessible name`)
  );
}
