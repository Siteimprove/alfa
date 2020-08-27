import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Role } from "@siteimprove/alfa-aria";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasRole } from "../common/predicate/has-role";

const { isElement, hasNamespace } = Element;
const { find, isEmpty } = Iterable;
const { and, property } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r16.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ composed: true, nested: true })
          .filter(
            and(
              isElement,
              and(hasNamespace(Namespace.HTML, Namespace.SVG), hasRole())
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

const hasRequiredValues: Predicate<Element> = (element) =>
  Role.from(element)
    .collect((role) => role)
    .every((role) => {
      for (const attribute of role.attributes) {
        if (
          role.isAttributeRequired(attribute) &&
          role.implicitAttributeValue(attribute).isNone() &&
          element.attribute(attribute).every(property("value", isEmpty))
        ) {
          return false;
        }
      }

      return true;
    });

export namespace Outcomes {
  export const HasAllStates = Ok.of(
    Diagnostic.of(`The element has all required states and properties`)
  );

  export const HasNotAllStates = Err.of(
    Diagnostic.of(
      `The element does not have all required states and properties`
    )
  );
}
