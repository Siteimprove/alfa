import { getAttribute } from "./get-attribute";
import { getParentElement } from "./get-parent-element";
import { isElement } from "./guards";
import { traverseNode } from "./traverse-node";
import { Element, Node, Text } from "./types";

/**
 * @see https://www.w3.org/TR/dom41/#dom-slotable-assignedslot
 */
export function getAssignedSlot(
  node: Element | Text,
  context: Node
): Element | null {
  return findSlot(node, context);
}

/**
 * @see https://www.w3.org/TR/dom41/#find-a-slot
 */
function findSlot(slotable: Element | Text, context: Node): Element | null {
  const parentElement = getParentElement(slotable, context);

  if (parentElement === null) {
    return null;
  }

  const { shadowRoot } = parentElement;

  if (shadowRoot === null) {
    return null;
  }

  const name: string | null = isElement(slotable)
    ? getAttribute(slotable, "slot")
    : null;

  let assignedSlot: Element | null = null;

  traverseNode(shadowRoot, context, {
    enter(node) {
      if (
        isElement(node) &&
        node.localName === "slot" &&
        name === getAttribute(node, "name")
      ) {
        assignedSlot = node;
        return false;
      }
    }
  });

  return assignedSlot;
}
