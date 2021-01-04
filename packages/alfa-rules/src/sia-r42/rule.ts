import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Node, Role } from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasRole } from "../common/predicate/has-role";
import { isIgnored } from "../common/predicate/is-ignored";

const { isElement, hasNamespace } = Element;
const { some } = Iterable;
const { and, not } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r42.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ flattened: true, nested: true })
          .filter(isElement)
          .filter(
            and(
              hasNamespace(Namespace.HTML, Namespace.SVG),
              not(isIgnored(device)),
              hasRole((role) => role.hasRequiredParent())
            )
          );
      },

      expectations(target) {
        return {
          1: expectation(
            hasRequiredParent(device)(target),
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
    Diagnostic.of(
      `The element is owned by an element of its required context role`
    )
  );

  export const IsNotOwnedByContextRole = Err.of(
    Diagnostic.of(
      `The element is not owned by an element of its required context role`
    )
  );
}

function hasRequiredParent(device: Device): Predicate<Element> {
  return (element) =>
    Node.from(element, device).some((node) =>
      node.role
        .filter((role) => role.hasRequiredParent())
        .every((role) =>
          node.parent().some(isRequiredParent(role.requiredParent))
        )
    );
}

function isRequiredParent(
  requiredParent: Iterable<Role.Name>
): Predicate<Node> {
  const [role, ...rest] = requiredParent;

  return (node) => node.role.some(Role.hasName(role, ...rest));
}
