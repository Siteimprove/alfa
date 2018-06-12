import { Node, Element, Text } from "./types";
import { isElement } from "./guards";
import { traverseNode } from "./traverse-node";
import { getParentElement } from "./get-parent-element";
import { getAttribute } from "./get-attribute";

/**
 * @see https://www.w3.org/TR/dom41/#dom-slotable-assignedslot
 */
export function getAssignedSlot(
  node: Element | Text,
  context: Node
): Element | null {
  const parentElement = getParentElement(node, context);

  if (parentElement === null) {
    return null;
  }

  const { shadowRoot } = parentElement;

  if (shadowRoot === null) {
    return null;
  }

  const name: string | null = isElement(node)
    ? getAttribute(node, "slot")
    : null;

  let assignedSlot: Element | null = null;

  traverseNode(shadowRoot, {
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
