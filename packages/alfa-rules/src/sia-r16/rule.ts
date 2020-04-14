import { Rule } from "@siteimprove/alfa-act";
import { Role } from "@siteimprove/alfa-aria";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasNamespace } from "../common/predicate/has-namespace";
import { hasRole } from "../common/predicate/has-role";

const { find, isEmpty } = Iterable;
const { and, equals, property } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r16.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ composed: true, nested: true })
          .filter(
            and(
              Element.isElement,
              and(
                hasNamespace(equals(Namespace.HTML, Namespace.SVG)),
                hasRole(() => true)
              )
            )
          );
      },

      expectations(target) {
        return {
          1: expectation(
            hasRequiredValues(target),
            () => Outcomes.HasAllStates,
            () => Outcomes.HasNotAllStates
          ),
        };
      },
    };
  },
});

const hasRequiredValues: Predicate<Element> = (element) => {
  for (const [role] of Role.from(element)) {
    if (role.isSome()) {
      const { requires, implicits } = role.get().characteristics;

      for (const attribute of requires) {
        if (find(implicits, (implicit) => implicit[0] === attribute).isSome()) {
          continue;
        }

        if (element.attribute(attribute).every(property("value", isEmpty))) {
          return false;
        }
      }
    }
  }

  return true;
};

export namespace Outcomes {
  export const HasAllStates = Ok.of(
    "The element has all required states and properties"
  );

  export const HasNotAllStates = Err.of(
    "The element does not have all required states and properties"
  );
}
