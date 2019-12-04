import { Rule } from "@siteimprove/alfa-act";
import { Role } from "@siteimprove/alfa-aria";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { hasNamespace } from "../common/predicate/has-namespace";
import { hasNondefaultRole } from "../common/predicate/has-nondefault-role";

const { filter, find, isEmpty } = Iterable;
const { and, equals, test } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r16.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return filter(
          document.descendants({ composed: true, nested: true }),
          and(
            Element.isElement,
            and(
              hasNamespace(equals(Namespace.HTML, Namespace.SVG)),
              hasNondefaultRole
            )
          )
        );
      },

      expectations(target) {
        return {
          1: test(hasRequiredValues, target)
            ? Ok.of("The element has all required states and properties")
            : Err.of(
                "The element does not have all required states and properties"
              )
        };
      }
    };
  }
});

const hasRequiredValues: Predicate<Element> = element => {
  for (const [role] of Role.from(element)) {
    if (role.isSome()) {
      const { requires, implicits } = role.get().characteristics;

      for (const attribute of requires) {
        if (find(implicits, implicit => implicit[0] === attribute).isSome()) {
          continue;
        }

        if (element.attribute(attribute).every(isEmpty)) {
          return false;
        }
      }
    }
  }

  return true;
};
