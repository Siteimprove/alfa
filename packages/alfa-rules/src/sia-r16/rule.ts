import { Rule } from "@siteimprove/alfa-act";
import { Role } from "@siteimprove/alfa-aria";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { hasNamespace } from "../common/predicate/has-namespace";

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
            and(hasNamespace(equals(Namespace.HTML, Namespace.SVG)), element =>
              Role.from(element, { explicit: false })
                .flatMap(implicit =>
                  Role.from(element, { implicit: false }).map(
                    explicit =>
                      explicit.isSome() !== implicit.isSome() ||
                      explicit.some(explicit =>
                        implicit.some(implicit => explicit !== implicit)
                      )
                  )
                )
                .some(different => different)
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
