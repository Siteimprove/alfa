import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import type { Role } from "@siteimprove/alfa-aria";
import * as aria from "@siteimprove/alfa-aria"
import { Element, Namespace, Node, Query } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation.js";

import { Scope, Stability, Version } from "../tags/index.js";
import { WithRole } from "../common/diagnostic.js";

const { hasNonEmptyAccessibleName, hasRole, isIncludedInTheAccessibilityTree } = aria.DOM;
const { hasInputType, hasNamespace } = Element;
const { and, or } = Predicate;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r8",
  requirements: [Criterion.of("4.1.2")],
  tags: [Scope.Component, Stability.Experimental, Version.of(2)],
  evaluate({ device, document }) {
    return {
      applicability() {
        return getElementDescendants(document, Node.fullTree).filter(
          and(
            hasNamespace(Namespace.HTML),
            or(
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
              hasInputType("password", "color", "date", "datetime-local", "file", "month", "time", "week"),
            ),
            isIncludedInTheAccessibilityTree(device),
          ),
        );
      },

      expectations(target) {
        const role = aria.Node.from(target, device).role;
        if(role.isSome()) {
          const roleName = role.get().name;
          return {
            1: expectation(
              hasNonEmptyAccessibleName(device)(target),
              () => Outcomes.FormFieldWithAriaRoleHasName(roleName),
              () => Outcomes.FormFieldWithAriaRoleHasNoName(roleName),
            ),
          };
        } else {
          // We know the type attribute has a correct value because of the applicability.
          const inputType = target.attribute("type").map(attr => attr.value).getUnsafe(`R8v2 found an element with no role nor 'type' attribute: ${target.path()}`) as Element.InputType;
          return {
            1: expectation(
              hasNonEmptyAccessibleName(device)(target),
              () => Outcomes.InputElementWithNoAriaRoleHasName(inputType),
              () => Outcomes.InputElementWithNoAriaRoleHasNoName(inputType),
            ),
          };
        }
      },
    };
  },
});

/**
 * @public
 */
export namespace Outcomes {
  export const FormFieldWithAriaRoleHasName = (role: Role.Name) =>
    Ok.of(WithRole.of(`The form field has an accessible name`, role));

  export const FormFieldWithAriaRoleHasNoName = (role: Role.Name) =>
    Err.of(
      WithRole.of(`The form field does not have an accessible name`, role),
    );

  export const InputElementWithNoAriaRoleHasName = (typeAttribValue: Element.InputType) =>
    Ok.of(Diagnostic.of(`The type="${typeAttribValue}" form field has an accessible name`));

  export const InputElementWithNoAriaRoleHasNoName = (typeAttribValue: Element.InputType) =>
    Err.of(Diagnostic.of(`The type="${typeAttribValue}" form field does not have an accessible name`));
}
