import { Rule } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasAccessibleName } from "../common/predicate/has-accessible-name";
import { hasNamespace } from "../common/predicate/has-namespace";
import { hasRole } from "../common/predicate/has-role";
import { isIgnored } from "../common/predicate/is-ignored";

const { isEmpty } = Iterable;
const { and, not } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r8.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ flattened: true, nested: true })
          .filter(
            and(
              Element.isElement,
              and(
                hasNamespace(Namespace.HTML),
                hasRole(
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
                ),
                not(isIgnored(device))
              )
            )
          );
      },

      expectations(target) {
        return {
          1: expectation(
            hasAccessibleName(device, not(isEmpty))(target),
            () => Outcomes.HasName,
            () => Outcomes.HasNoName
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasName = Ok.of("The form field has an accessible name");

  export const HasNoName = Err.of(
    "The form field does not have an accessible name"
  );
}
