import { Rule } from "@siteimprove/alfa-act";
import { DOM, Role } from "@siteimprove/alfa-aria";
import { Element, Namespace, Node, Query } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { Scope, Stability } from "../tags";
import { WithRole } from "../common/diagnostic";

const { hasNonEmptyAccessibleName, hasRole, isIncludedInTheAccessibilityTree } =
  DOM;
const { hasNamespace } = Element;
const { and } = Predicate;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r8",
  requirements: [Criterion.of("4.1.2")],
  tags: [Scope.Component, Stability.Stable],
  evaluate({ device, document }) {
    return {
      applicability() {
        return getElementDescendants(document, Node.fullTree).filter(
          and(
            hasNamespace(Namespace.HTML),
            hasRole(
              device,
              "checkbox",
              "combobox",
              "listbox",
              "menuitemcheckbox",
              "menuitemradio",
              "radio",
              "searchbox",
              "slider",
              "spinbutton",
              "switch",
              "textbox",
            ),
            isIncludedInTheAccessibilityTree(device),
          ),
        );
      },

      expectations(target) {
        const role = WithRole.getRoleName(target, device);
        return {
          1: expectation(
            hasNonEmptyAccessibleName(device)(target),
            () => Outcomes.HasName(role),
            () => Outcomes.HasNoName(role),
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
  export const HasName = (role: Role.Name) => Ok.of(
    WithRole.of(`The form field has an accessible name`, role),
  );

  export const HasNoName = (role: Role.Name) => Err.of(
    WithRole.of(`The form field does not have an accessible name`, role),
  );
}
