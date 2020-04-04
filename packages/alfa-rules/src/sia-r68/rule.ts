import { Rule } from "@siteimprove/alfa-act";
import { Node, Role } from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import { Element, hasNamespace, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasRole } from "../common/predicate/has-role";
import { isIgnored } from "../common/predicate/is-ignored";

const { some } = Iterable;
const { and, not, equals, isString } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r68.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ flattened: true, nested: true })
          .filter(
            and(
              Element.isElement,
              and(
                hasNamespace(equals(Namespace.HTML, Namespace.SVG)),
                and(not(isIgnored(device)), hasRole(hasOwnedElements()))
              )
            )
          );
      },

      expectations(target) {
        return {
          1: expectation(
            hasRequiredOwnedElements(device)(target),
            () => Outcomes.HasCorrectOwnedElements,
            () => Outcomes.HasIncorrectOwnedElements
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasCorrectOwnedElements = Ok.of(
    "The element only owns elements as required by its semantic role"
  );

  export const HasIncorrectOwnedElements = Err.of(
    "The element owns elements not required by its semantic role"
  );
}

function hasOwnedElements(
  predicate: Predicate<
    string | readonly [string, string, ...Array<string>]
  > = () => true
): Predicate<Role> {
  return function hasOwnedElements(role) {
    return (
      some(role.characteristics.owns, predicate) ||
      role.inheritsFrom(hasOwnedElements)
    );
  };
}

function hasRequiredOwnedElements(device: Device): Predicate<Element> {
  return (element) =>
    Node.from(element, device).every((node) =>
      node
        .children()
        .filter((node) => Element.isElement(node.node))
        .every((child) =>
          child
            .role()
            .some((childRole) =>
              node
                .role()
                .some((role) =>
                  hasOwnedElements((roles) =>
                    isString(roles)
                      ? roles === childRole.name
                      : owns([...roles])(child)
                  )(role)
                )
            )
        )
    );
}

function owns(roles: Array<string>): Predicate<Node> {
  return (node) => {
    const [next, ...remaining] = roles;

    if (node.role().some((role) => next === role.name)) {
      return remaining.length === 0 || node.children().every(owns(remaining));
    }

    return false;
  };
}
