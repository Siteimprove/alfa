import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { DOM, Role } from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import * as aria from "@siteimprove/alfa-aria";

import { expectation } from "../common/act/expectation";

import { Scope } from "../tags";

const { hasRole, isIgnored } = DOM;
const { isElement, hasNamespace } = Element;
const { and, not } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r42",
  requirements: [Criterion.of("1.3.1")],
  tags: [Scope.Component],
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
              hasRole(device, (role) => role.hasRequiredParent())
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
  return (element) => {
    const node = aria.Node.from(element, device);

    return node.role
      .filter((role) => role.hasRequiredParent())
      .every((role) =>
        node.parent().some(isRequiredParent(role.requiredParent))
      );
  };
}

function isRequiredParent(
  requiredParent: ReadonlyArray<ReadonlyArray<Role.Name>>
): Predicate<aria.Node> {
  return (node) =>
    requiredParent.some((roles) => isRequiredParent(roles)(node));

  function isRequiredParent(
    requiredParent: ReadonlyArray<Role.Name>
  ): Predicate<aria.Node> {
    return (node) => {
      const [role, ...rest] = requiredParent;

      if (node.role.some(Role.hasName(role))) {
        return (
          rest.length === 0 ||
          node
            .parent()
            .filter((node) => isElement(node.node))
            .some(isRequiredParent(rest))
        );
      }

      return false;
    };
  }
}
