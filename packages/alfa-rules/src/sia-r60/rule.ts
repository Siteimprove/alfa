import { Rule } from "@siteimprove/alfa-act";
import { DOM, Node as ariaNode, Role } from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import { Element, Namespace, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";
import { Option, None } from "@siteimprove/alfa-option";
import { Map } from "@siteimprove/alfa-map";

import { expectation } from "../common/act/expectation";
import { WithRole } from "../common/diagnostic/with-role";
import { Scope } from "../tags";

const { hasNonEmptyAccessibleName, hasRole, isIncludedInTheAccessibilityTree } =
  DOM;
const { isElement, hasNamespace } = Element;
const { and } = Refinement;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r60",
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        // Records how many form input are within each "group"
        let groups: Map<Element, number> = Map.empty();

        function visit(node: Node, group: Option<Element>): void {
          if (isElement(node)) {
            // If we're under a group and find a form input, count it.
            group.forEach((group) => {
              if (
                and(
                  isIncludedInTheAccessibilityTree(device),
                  isFormInput(device)
                )(node)
              ) {
                groups = groups.set(group, groups.get(group).getOr(0) + 1);
              }
            });

            // If we find a group, remember it before descending
            if (
              and(
                hasNamespace(Namespace.HTML),
                hasRole(device, (role) => role.is("group"))
              )(node)
            ) {
              group = Option.of(node);
            }
          }
          // Recursively visit children
          for (const child of node.children(Node.fullTree)) {
            visit(child, group);
          }
        }

        visit(document, None);

        // Only keep the groups with at least two form input descendants
        return groups.filter((n) => n >= 2).keys();
      },

      expectations(target) {
        // Presence of a role is guaranteed by Applicability
        const role = ariaNode.from(target, device).role.get().name;

        return {
          1: expectation(
            hasNonEmptyAccessibleName(device)(target),
            () => Outcomes.HasAccessibleName(role),
            () => Outcomes.HasNoAccessibleName(role)
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasAccessibleName = (role: Role.Name) =>
    Ok.of(WithRole.of(`The grouping element has an accessible name`, role));

  export const HasNoAccessibleName = (role: Role.Name) =>
    Err.of(WithRole.of(`The grouping element has an accessible name`, role));
}

function isFormInput(device: Device): Predicate<Element> {
  return hasRole(
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
    "textbox"
  );
}
