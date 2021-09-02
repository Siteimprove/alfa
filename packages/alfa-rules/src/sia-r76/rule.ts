import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Element, Namespace, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";
import { hasRole, isIgnored, isPerceivable } from "../common/predicate";

const { isElement, hasName, hasNamespace } = Element;
const { not } = Predicate;
const { and, test } = Refinement;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r76",
  requirements: [Criterion.of("1.3.1")],
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
              collect = test(not(isIgnored(device)), node);
            }

            if (
              collect &&
              test(and(hasName("th"), isPerceivable(device)), node)
            ) {
              yield node;
            }
          }

          for (const child of node.children({
            flattened: true,
            nested: true,
          })) {
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
