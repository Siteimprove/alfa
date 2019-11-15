import { Rule } from "@siteimprove/alfa-act";
import { Role } from "@siteimprove/alfa-aria";
import * as aria from "@siteimprove/alfa-aria";
import { Attribute, getOwnerElement, isElement } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Set } from "@siteimprove/alfa-set";
import { Page } from "@siteimprove/alfa-web";

import { hasRole } from "../common/predicate/has-role";
import { isIgnored } from "../common/predicate/is-ignored";

import { walk } from "../common/walk";
import { Ok, Err } from "@siteimprove/alfa-result";

const { filter, flatMap } = Iterable;
const { and, not, equals, test } = Predicate;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r18.html",
  evaluate({ device, document }) {
    const global = Set.from(
      Role.lookup("roletype").get().characteristics.supports
    );

    return {
      applicability() {
        return flatMap(
          filter(
            walk(document, document, { flattened: true, nested: true }),
            and(isElement, not(isIgnored(document, device)))
          ),
          element =>
            filter(Iterable.from(element.attributes), attribute =>
              aria.Attribute.lookup(attribute.localName).isSome()
            )
        );
      },

      expectations(target) {
        return {
          1:
            global.has(target.localName) ||
            test(
              hasRole(document, role =>
                role.isAllowed(attribute =>
                  test(equals(target.localName), attribute.name)
                )
              ),
              getOwnerElement(target, document).get()
            )
              ? Ok.of(
                  "The attribute is allowed for the element on which it is specified"
                )
              : Err.of(
                  "The attribute is not allowed for the element on which it is specified"
                )
        };
      }
    };
  }
});
