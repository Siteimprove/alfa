import { getAttribute } from "./get-attribute";
import { getParentElement } from "./get-parent-element";
import { isElement } from "./guards";
import { traverseNode } from "./traverse-node";
import { Element, Node, Text } from "./types";

/**
 * Given an element, or a text node, and a context, get the `<slot>` that the
 * element or text node is assigned to within the context. If the element or
 * text node is not assigned to a `<slot>` then `null` is returned.
 *
 * @see https://dom.spec.whatwg.org/#dom-slotable-assignedslot
 */
export function getAssignedSlot(
  node: Element | Text,
  context: Node
): Element | null {
  return findSlot(node, context);
}

/**
 * @see https://dom.spec.whatwg.org/#find-a-slot
 */
function findSlot(slotable: Element | Text, context: Node): Element | null {
  const parentElement = getParentElement(slotable, context);

  if (parentElement === null) {
    return null;
  }

  const { shadowRoot } = parentElement;

  if (shadowRoot === null || shadowRoot === undefined) {
    return null;
  }

  const name: string | null = isElement(slotable)
    ? getAttribute(slotable, "slot")
    : null;

  let assignedSlot: Element | null = null;

  traverseNode(shadowRoot, context, {
    enter(node, parentNode, { exit }) {
      if (
        isElement(node) &&
        node.localName === "slot" &&
        name === getAttribute(node, "name")
      ) {
        assignedSlot = node;
        return exit;
      }
    }
  });

  return assignedSlot;
}
