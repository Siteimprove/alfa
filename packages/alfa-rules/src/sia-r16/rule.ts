import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Node } from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasRole } from "../common/predicate/has-role";
import { isFocusable } from "../common/predicate/is-focusable";

const { isElement, hasNamespace } = Element;
const { isEmpty } = Iterable;
const { and, property } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r16.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ composed: true, nested: true })
          .filter(isElement)
          .filter(and(hasNamespace(Namespace.HTML, Namespace.SVG), hasRole()));
      },

      expectations(target) {
        return {
          1: expectation(
            hasRequiredValues(device)(target),
            () => Outcomes.HasAllStates,
            () => Outcomes.HasNotAllStates
          ),
        };
      },
    };
  },
});

function hasRequiredValues(device: Device): Predicate<Element> {
  return (element) =>
    Node.from(element, device).every((node) => {
      for (const role of node.role) {
        // The `separator` role is poorly architected in the sense that its
        // inheritance and attribute requirements depend on aspects of the
        // element carrying the role. If the element is not focusable, the
        // `separator` role has no required attributes.
        if (role.is("separator") && !isFocusable(device)(element)) {
          return true;
        }

        for (const attribute of role.attributes) {
          if (
            role.isAttributeRequired(attribute) &&
            role.implicitAttributeValue(attribute).isNone() &&
            node.attribute(attribute).every(property("value", isEmpty))
          ) {
            return false;
          }
        }
      }

      return true;
    });
}

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
