import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Element, Namespace, Node } from "@siteimprove/alfa-dom";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { Scope } from "../tags";

const { hasRole } = DOM;
const { isElement, hasNamespace } = Element;
const { and, not } = Refinement;
const { isTabbable } = Style;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r90",
  requirements: [Criterion.of("4.1.2")],
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        return document.descendants({ nested: true, flattened: true }).filter(
          and(
            isElement,
            and(
              hasNamespace(Namespace.HTML, Namespace.SVG),
              hasRole(device, (role) => role.hasPresentationalChildren())
            )
          )
        );
      },

      expectations(target) {
        return {
          1: expectation(
            not(
              Node.hasDescendant(and(isElement, isTabbable(device)), {
                flattened: true,
              })
            )(target),
            () => Outcomes.HasNoTabbableDescendants,
            () => Outcomes.HasTabbableDescendants
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasNoTabbableDescendants = Ok.of(
    Diagnostic.of(`The element has no tabbable descendants`)
  );

  export const HasTabbableDescendants = Err.of(
    Diagnostic.of(`The element has tabbable descendants`)
  );
}
