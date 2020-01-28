import { Rule } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Some } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok, Result } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { hasAccessibleName } from "../common/predicate/has-accessible-name";
import { hasName } from "../common/predicate/has-name";
import { hasNamespace } from "../common/predicate/has-namespace";
import { hasRole } from "../common/predicate/has-role";
import { isIgnored } from "../common/predicate/is-ignored";

const { filter, isEmpty } = Iterable;
const { and, not, equals, test } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r8.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return filter(
          document.descendants({ flattened: true, nested: true }),
          and(
            Element.isElement,
            and(
              hasNamespace(equals(Namespace.HTML)),
              and(
                hasRole(
                  hasName(
                    equals(
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
                    )
                  )
                ),
                not(isIgnored(device))
              )
            )
          )
        );
      },

      expectations(target) {
        return {
          1: test(hasAccessibleName(device, not(isEmpty)), target)
            ? Outcomes.HasName
            : Outcomes.HasNoName
        };
      }
    };
  }
});

export namespace Outcomes {
  export const HasName = Some.of(
    Ok.of("The form field has an accessible name") as Result<string, string>
  );

  export const HasNoName = Some.of(
    Err.of("The form field does not have an accessible name") as Result<
      string,
      string
    >
  );
}
