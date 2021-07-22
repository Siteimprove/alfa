import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";
import { Device } from "@siteimprove/alfa-device";

import { expectation } from "../common/expectation";
import { hasNonEmptyAccessibleName } from "../common/predicate/has-non-empty-accessible-name";
import { hasRole } from "../common/predicate/has-role";
import { isIgnored } from "../common/predicate";

const { isElement, hasNamespace } = Element;
const { not } = Predicate;
const { and } = Refinement;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r60",
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ flattened: true, nested: true })
          .filter(isElement)
          .filter(
            and(
              hasNamespace(Namespace.HTML),
              hasRole(device, (role) => role.is("group")),
              (group) =>
                group.descendants({ flattened: true, nested: true }).count(
                  and(
                    isElement,
                    not(isIgnored(device)),
                    isRole(device),
                    (ancestorRole) =>
                      ancestorRole
                        .closest(
                          and(
                            isElement,
                            hasRole(device, (role) => role.is("group"))
                          ),
                          { flattened: true }
                        )
                        .get()
                        .equals(group)
                  )
                ) >= 2
            )
          );
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

function isRole(device: Device): Predicate<Element> {
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
