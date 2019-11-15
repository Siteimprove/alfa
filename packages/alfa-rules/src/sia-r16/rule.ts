import { Rule } from "@siteimprove/alfa-act";
import { getRole } from "@siteimprove/alfa-aria";
import {
  Element,
  getAttribute,
  isElement,
  Namespace,
  Node
} from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { hasNamespace } from "../common/predicate/has-namespace";
import { isEmpty } from "../common/predicate/is-empty";

import { walk } from "../common/walk";

const { filter, find } = Iterable;
const { and, not, equals, test } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r16.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return filter(
          walk(document, document, { composed: true, nested: true }),
          and(
            isElement,
            and(
              hasNamespace(document, equals(Namespace.HTML, Namespace.SVG)),
              element =>
                getRole(element, document, { explicit: false })
                  .flatMap(implicit =>
                    getRole(element, document, { implicit: false }).map(
                      explicit =>
                        explicit.isSome() &&
                        implicit.isSome() &&
                        explicit.get().name === implicit.get().name
                    )
                  )
                  .some(identical => !identical)
            )
          )
        );
      },

      expectations(target) {
        return {
          1: test(hasRequiredValues(document), target)
            ? Ok.of("The element has all required states and properties")
            : Err.of(
                "The element does not have all required states and properties"
              )
        };
      }
    };
  }
});

function hasRequiredValues(context: Node): Predicate<Element> {
  return element => {
    for (const [role] of getRole(element, context)) {
      if (role.isSome()) {
        const { requires, implicits } = role.get().characteristics;

        for (const attribute of requires) {
          if (find(implicits, implicit => implicit[0] === attribute).isSome()) {
            continue;
          }

          if (
            getAttribute(element, context, attribute)
              .filter(not(isEmpty))
              .isNone()
          ) {
            return false;
          }
        }
      }
    }

    return true;
  };
}
