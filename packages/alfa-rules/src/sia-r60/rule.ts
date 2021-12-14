import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Element, Namespace, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";
import { Option, None } from "@siteimprove/alfa-option";
import { Map } from "@siteimprove/alfa-map";

import { expectation } from "../common/expectation";
import {
  hasNonEmptyAccessibleName,
  hasRole,
  isIgnored,
} from "../common/predicate";
import { Scope } from "../tags";

const { isElement, hasNamespace } = Element;
const { not } = Predicate;
const { and } = Refinement;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r60",
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        let groups: Map<Element, number> = Map.empty();

        function visit(node: Node, group: Option<Element>): void {
          //If the element is a node, then its applicability is checked
          if (isElement(node)) {
            // If the group is an input field, then its value has a +1
            if (
              group.isSome() &&
              and(not(isIgnored(device)), isFormInput(device))(node)
            ) {
              groups = groups.set(
                group.get(),
                groups.get(group.get()).getOr(0) + 1
              );
            }

            if (
              and(
                hasNamespace(Namespace.HTML),
                hasRole(device, (role) => role.is("group"))
              )(node)
            ) {
              group = Option.of(node);
            }
          }
          // If the group has children, then iterate on all children of the group
          const children = node.children({
            flattened: true,
            nested: true,
          });

          for (const child of children) {
            visit(child, group);
          }
        }

        visit(document, None);

        return groups.filter((n) => n >= 2).keys();
      },

      expectations(target) {
        return {
          1: expectation(
            hasNonEmptyAccessibleName(device)(target),
            () => Outcomes.HasAccessibleName,
            () => Outcomes.HasNoAccessibleName
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasAccessibleName = Ok.of(
    Diagnostic.of(`The grouping elements have an accessible name`)
  );

  export const HasNoAccessibleName = Err.of(
    Diagnostic.of(`The grouping elements have an accessible name`)
  );
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
