import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { hasName } from "@siteimprove/alfa-dom/src/node/attribute/predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasNonEmptyAccessibleName } from "../common/predicate/has-non-empty-accessible-name";
import { hasRole } from "../common/predicate/has-role";

import { isIgnored } from "../common/predicate";

const { isElement, hasNamespace } = Element;
const { and } = Refinement;

const isRole = hasName(
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
                group.descendants().count(and(isElement, isIgnored)) >= 2
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
    Diagnostic.of(`The image has an accessible name`)
  );

  export const HasNoAccessibleName = Err.of(
    Diagnostic.of(`The image does not have an accessible name`)
  );
}
