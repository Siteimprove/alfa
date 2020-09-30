import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Role } from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import { Element, Namespace, Node } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import * as aria from "@siteimprove/alfa-aria";

import { expectation } from "../common/expectation";

import { hasAttribute } from "../common/predicate/has-attribute";
import { hasRole } from "../common/predicate/has-role";
import { isIgnored } from "../common/predicate/is-ignored";

const { isElement, hasNamespace } = Element;
const { and, equals, not } = Refinement;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r68.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return visit(document, device);
      },

      expectations(target) {
        return {
          1: expectation(
            hasRequiredChildren(device)(target),
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
    Diagnostic.of(
      `The element only owns elements as required by its semantic role`
    )
  );

  export const HasIncorrectOwnedElements = Err.of(
    Diagnostic.of(`The element owns elements not required by its semantic role`)
  );
}

function hasRequiredChildren(device: Device): Predicate<Element> {
  return (element) =>
    aria.Node.from(element, device).every((node) =>
      node.role
        .filter((role) => role.hasRequiredChildren())
        .every((role) =>
          node
            .children()
            .filter((node) => isElement(node.node))
            .some(isRequiredChild(role.requiredChildren))
        )
    );
}

function isRequiredChild(
  requiredChildren: Iterable<Iterable<Role.Name>>
): Predicate<aria.Node> {
  return (node) =>
    [...requiredChildren].some((roles) => isRequiredChild(roles)(node));

  function isRequiredChild(
    requiredChildren: Iterable<Role.Name>
  ): Predicate<aria.Node> {
    return (node) => {
      const [role, ...rest] = requiredChildren;

      if (node.role.some(Role.hasName(role))) {
        return (
          rest.length === 0 ||
          node
            .children()
            .filter((node) => isElement(node.node))
            .some(isRequiredChild(rest))
        );
      }

      return false;
    };
  }
}

/**
 * Collect all descendants of the given node where the descendant:
 *
 * - is a non-ignored HTML or SVG element with a role requiring specific
 *   children; and
 * - does not have an `aria-busy` ancestor.
 */
function* visit(node: Node, device: Device): Iterable<Element> {
  if (and(isElement, hasAttribute("aria-busy", equals("true")))(node)) {
    return;
  }

  if (
    and(
      isElement,
      and(
        hasNamespace(Namespace.HTML, Namespace.SVG),
        not(isIgnored(device)),
        hasRole((role) => role.hasRequiredChildren())
      )
    )(node)
  ) {
    yield node;
  }

  const children = node.children({ flattened: true, nested: true });

  for (const child of children) {
    yield* visit(child, device);
  }
}
