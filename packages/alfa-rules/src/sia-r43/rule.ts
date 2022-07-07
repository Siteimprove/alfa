import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Element, Namespace, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { Scope } from "../tags";

const {
  hasExplicitRole,
  hasNonEmptyAccessibleName,
  isIncludedInTheAccessibilityTree,
} = DOM;
const { isElement, hasNamespace } = Element;
const { and } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r43",
  requirements: [Criterion.of("1.1.1")],
  tags: [Scope.Component],
  evaluate({ document, device }) {
    return {
      applicability() {
        return document
          .descendants(Node.fullTree)
          .filter(isElement)
          .filter(
            and(
              hasNamespace(Namespace.SVG),
              hasExplicitRole("img", "graphics-document", "graphics-symbol"),
              isIncludedInTheAccessibilityTree(device)
            )
          );
      },

      expectations(target) {
        return {
          1: expectation(
            hasNonEmptyAccessibleName(device)(target),
            () => Outcomes.HasName(target.name),
            () => Outcomes.HasNoName(target.name)
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasName = (target: string) =>
    Ok.of(Diagnostic.of(`The \`<${target}>\` element has an accessible name`));

  export const HasNoName = (target: string) =>
    Err.of(
      Diagnostic.of(
        `The \`<${target}>\` element does not have an accessible name`
      )
    );
}
