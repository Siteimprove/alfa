import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Node, Role } from "@siteimprove/alfa-aria";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";
import { isMarkedDecorative } from "../common/predicate/is-marked-decorative";

const { isElement, hasName, hasNamespace } = Element;
const { and, or, not } = Predicate;

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
                isMarkedDecorative
              )
            )
          );
      },

      expectations(target) {
        return {
          1: expectation(
            Node.from(target, device).every((accNode) =>
              accNode.role().some(not(Role.hasName("none", "presentation")))
            ),
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
