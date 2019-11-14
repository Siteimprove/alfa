import { Rule } from "@siteimprove/alfa-act";
import { Element, isElement, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { hasAccessibleName } from "../common/predicate/has-accessible-name";
import { hasNamespace } from "../common/predicate/has-namespace";
import { hasRole } from "../common/predicate/has-role";
import { isEmpty } from "../common/predicate/is-empty";
import { isExposed } from "../common/predicate/is-exposed";

import { walk } from "../common/walk";

const { filter } = Iterable;
const { and, not, equals, test } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove/github.io/sanshikan/rules/sia-r11.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return filter(
          walk(document, document, { flattened: true, nested: true }),
          and(
            isElement,
            and(
              hasNamespace(document, equals(Namespace.HTML)),
              and(
                hasRole(document, role => role.name === "link"),
                isExposed(document, device)
              )
            )
          )
        );
      },

      expectations(target) {
        return {
          1: test(hasAccessibleName(document, device, not(isEmpty)), target)
            ? Ok.of("The link has an accessible name")
            : Err.of("The link does not have an accessible name")
        };
      }
    };
  }
});
