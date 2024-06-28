import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Element, Namespace, Node } from "@siteimprove/alfa-dom";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation.js";
import { WithBadElements } from "../common/diagnostic/with-bad-elements.js";

import { Scope, Stability } from "../tags/index.js";

const { hasRole } = DOM;
const { isElement, hasNamespace } = Element;
const { and } = Refinement;
const { isTabbable } = Style;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r90",
  requirements: [Criterion.of("4.1.2")],
  tags: [Scope.Component, Stability.Stable],
  evaluate({ device, document }) {
    return {
      applicability() {
        return document.descendants(Node.fullTree).filter(
          and(
            isElement,
            and(
              hasNamespace(Namespace.HTML, Namespace.SVG),
              hasRole(device, (role) => role.hasPresentationalChildren()),
            ),
          ),
        );
      },

      expectations(target) {
        const tabbables = target
          .descendants(Node.flatTree)
          .filter(and(isElement, isTabbable(device)));

        return {
          1: expectation(
            tabbables.isEmpty(),
            () => Outcomes.HasNoTabbableDescendants,
            () => Outcomes.HasTabbableDescendants(tabbables),
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
  export const HasNoTabbableDescendants = Ok.of(
    Diagnostic.of(`The element has no tabbable descendants`),
  );

  export const HasTabbableDescendants = (errors: Iterable<Element>) =>
    Err.of(WithBadElements.of(`The element has tabbable descendants`, errors));
}
