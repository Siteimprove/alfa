import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Element, Namespace, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { Scope } from "../tags";

const { hasNonEmptyAccessibleName, isIncludedInTheAccessibilityTree } = DOM;
const { isElement, hasName, hasNamespace } = Element;
const { and } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r63",
  requirements: [Criterion.of("1.1.1")],
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
              hasName("object"),
              isIncludedInTheAccessibilityTree(device)
            )
          );
      },

      expectations(target) {
        return {
          1: expectation(
            hasNonEmptyAccessibleName(device)(target),
            () => Outcomes.HasName,
            () => Outcomes.HasNoName
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasName = Ok.of(
    Diagnostic.of(`The \`<object>\` element has an accessible name`)
  );

  export const HasNoName = Err.of(
    Diagnostic.of(`The \`<object>\` element does not have an accessible name`)
  );
}
