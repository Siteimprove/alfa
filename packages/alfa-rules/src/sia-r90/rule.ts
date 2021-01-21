import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasRole } from "../common/predicate/has-role";
import { hasDescendant } from "../common/predicate/has-descendant";
import { isTabbable } from "../common/predicate/is-tabbable";

const { isElement, hasNamespace } = Element;
const { and, not } = Refinement;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r90.html",
  requirements: [Criterion.of("1.3.1"), Criterion.of("4.1.2")],
  evaluate({ device, document }) {
    return {
      applicability() {
        return document.descendants({ nested: true, flattened: true }).filter(
          and(
            isElement,
            and(
              hasNamespace(Namespace.HTML, Namespace.SVG),
              hasRole((role) => role.hasPresentationalChildren())
            )
          )
        );
      },

      expectations(target) {
        return {
          1: expectation(
            not(
              hasDescendant(and(isElement, isTabbable(device)), {
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
