import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasNonEmptyAccessibleName } from "../common/predicate/has-non-empty-accessible-name";
import { hasRole } from "../common/predicate/has-role";
import { isIgnored } from "../common/predicate/is-ignored";

const { isElement, hasNamespace } = Element;
const { and, not } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r8.html",
  requirements: [Criterion.of("4.1.2")],
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ flattened: true, nested: true })
          .filter(isElement)
          .filter(
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
          );
      },

      expectations(target) {
        return {
          1: expectation(
            hasNonEmptyAccessibleName(device)(target),
            () => Outcomes.HasName,
            () => Outcomes.HasNoName
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasName = Ok.of(
    Diagnostic.of(`The form field has an accessible name`)
  );

  export const HasNoName = Err.of(
    Diagnostic.of(`The form field does not have an accessible name`)
  );
}
