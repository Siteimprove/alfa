import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Element, Namespace, Node } from "@siteimprove/alfa-dom";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";
import { Scope } from "../tags";

const { hasRole, isIncludedInTheAccessibilityTree, isPerceivable } = DOM;
const { isElement, hasName, hasNamespace } = Element;
const { and, test } = Refinement;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r76",
  requirements: [Criterion.of("1.3.1")],
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        return visit(document);

        function* visit(
          node: Node,
          collect: boolean = false
        ): Iterable<Element> {
          if (test(and(isElement, hasNamespace(Namespace.HTML)), node)) {
            if (test(hasName("table"), node)) {
              // only collect cells of accessible tables
              collect = test(isIncludedInTheAccessibilityTree(device), node);
            }

            if (
              collect &&
              test(and(hasName("th"), isPerceivable(device)), node)
            ) {
              yield node;
            }
          }

          for (const child of node.children(Node.fullTree)) {
            yield* visit(child, collect);
          }
        }
      },

      expectations(target) {
        return {
          1: expectation(
            test(hasRole(device, "columnheader", "rowheader"), target),
            () => Outcomes.HasHeaderRole,
            () => Outcomes.HasNoHeaderRole
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasHeaderRole = Ok.of(
    Diagnostic.of(`The header element is a semantic header`)
  );

  export const HasNoHeaderRole = Err.of(
    Diagnostic.of(`The header element is not a semantic header`)
  );
}
