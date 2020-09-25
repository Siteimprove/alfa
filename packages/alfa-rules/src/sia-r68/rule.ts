import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Node as AccNode, Role } from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import { Element, Namespace, Node } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasAttribute } from "../common/predicate/has-attribute";
import { hasRole } from "../common/predicate/has-role";
import { isIgnored } from "../common/predicate/is-ignored";
import { Sequence } from "@siteimprove/alfa-sequence";
import test = Predicate.test;

const { isElement, hasNamespace } = Element;
const { and, equals, not } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r68.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return visit(
          document,
          { flattened: true, nested: true },
          and(
            isElement,
            and(
              hasNamespace(Namespace.HTML, Namespace.SVG),
              not(isIgnored(device)),
              hasRole((role) => role.hasRequiredChildren())
            )
          ),
          and(isElement, hasAttribute("aria-busy", equals("true")))
        );
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
    AccNode.from(element, device).every((node) =>
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
): Predicate<AccNode> {
  return (node) =>
    [...requiredChildren].some((roles) => isRequiredChild(roles)(node));

  function isRequiredChild(
    requiredChildren: Iterable<Role.Name>
  ): Predicate<AccNode> {
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
 * Collect all descendants of node that:
 * * match includeNode; and
 * * do not have an ancestor matching excludeSubtree; and
 * * have an ancestor matching collectSubtree
 */
function visit<T extends Node = Node>(
  node: Node,
  options: Node.Traversal,
  includeNode: Predicate<Node, T> = () => true,
  excludeSubtree: Predicate<Node> = () => false,
  collectSubtree: Predicate<Node> = () => true
): Iterable<T> {
  function* doVisit(node: Node, collect: boolean): Iterable<T> {
    if (test<Node>(excludeSubtree, node)) {
      return Sequence.empty();
    }

    if (collect && includeNode(node)) {
      yield node;
    }

    collect = collect || collectSubtree(node);

    const children = node.children(options);

    for (const child of children) {
      yield* doVisit(child, collect);
    }
  }

  return doVisit(node, false);
}
