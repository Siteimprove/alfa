import { Rule } from "@siteimprove/alfa-act";
import { Node, Role } from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasNamespace } from "../common/predicate/has-namespace";
import { hasRole } from "../common/predicate/has-role";
import { isIgnored } from "../common/predicate/is-ignored";

const { some } = Iterable;
const { and, not, equals } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r42.html",
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
                and(not(isIgnored(device)), hasRole(hasContext()))
              )
            )
          );
      },

      expectations(target) {
        return {
          1: expectation(
            hasRequiredContext(device)(target),
            () => Outcomes.IsOwnedByContextRole,
            () => Outcomes.IsNotOwnedByContextRole
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const IsOwnedByContextRole = Ok.of(
    "The element is owned by an element of its required context role"
  );

  export const IsNotOwnedByContextRole = Err.of(
    "The element is not owned by an element of its required context role"
  );
}

function hasContext(
  predicate: Predicate<string> = () => true
): Predicate<Role> {
  return function hasContext(role) {
    return (
      some(role.characteristics.context, predicate) ||
      role.inheritsFrom(hasContext)
    );
  };
}

function hasRequiredContext(device: Device): Predicate<Element> {
  return (element) =>
    Node.from(element, device).some((node) =>
      node
        .parent()
        .some((parent) =>
          parent
            .role()
            .some((parentRole) =>
              node
                .role()
                .some((role) =>
                  hasContext((context) => context === parentRole.name)(role)
                )
            )
        )
    );
}
