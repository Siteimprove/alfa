import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Node, Role } from "@siteimprove/alfa-aria";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasAccessibleName } from "../common/predicate/has-accessible-name";

const { isElement, hasName, hasNamespace } = Element;
const { and, or } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r67.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ flattened: true, nested: true })
          .filter(
            and(
              isElement,
              and(
                or(
                  and(hasNamespace(Namespace.HTML), hasName("img")),
                  and(hasNamespace(Namespace.SVG), hasName("svg"))
                ),
                isMarkedAsDecorative
              )
            )
          );
      },

      expectations(target) {
        return {
          1: expectation(
            Node.from(target, device).every((accNode) => {
              const role = accNode.role();

              return (
                role.isNone() ||
                Role.hasName("none", "presentation")(role.get())
              );
            }),
            () => Outcomes.IsNotExposed,
            () => Outcomes.IsExposed
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const IsNotExposed = Ok.of(
    Diagnostic.of(
      `The element is marked as decorative and is not exposed`
    )
  );

  export const IsExposed = Err.of(
    Diagnostic.of(
      `The element is marked as decorative but is exposed`
    )
  );
}

/**
 * Check if an element is marked as decorative by looking at its role but without conflict resolution.
 * If the result is "none" or "presentation", then the element is marked as decorative.
 */
function isMarkedAsDecorative(element: Element): boolean {
  return (
    Role.from(element, { allowPresentational: true })
      // Element is marked as decorative if at least one browser thinks so.
      .some((r) => r.some(Role.hasName("none", "presentation")))
  );
}
