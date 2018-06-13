import { Node, Element } from "./types";
import { isElement, isText, isShadowRoot } from "./guards";
import { getRootNode } from "./get-root-node";
import { getParentNode } from "./get-parent-node";
import { getAssignedSlot } from "./get-assigned-slot";

/**
 * @see https://www.w3.org/TR/dom41/#slot-assigned-nodes
 */
export function getAssignedNodes(
  element: Element,
  context: Node,
  options: Readonly<{ flattened?: boolean }> = {}
): Array<Node> {
  if (element.localName !== "slot") {
    return [];
  }

  return options.flattened
    ? findFlattenedSlotable(element, context)
    : findSlotables(element, context);
}

/**
 * @see https://www.w3.org/TR/dom41/#find-slotables
 */
function findSlotables(slot: Element, context: Node): Array<Node> {
  const result: Array<Node> = [];

  const rootNode = getRootNode(slot, context);

  if (!isShadowRoot(rootNode)) {
    return result;
  }

  const parentNode = getParentNode(rootNode, context, { composed: true });

  if (parentNode === null) {
    return result;
  }

  const { childNodes } = parentNode;

  for (let i = 0, n = childNodes.length; i < n; i++) {
    const childNode = childNodes[i];

    if (isElement(childNode) || isText(childNode)) {
      if (getAssignedSlot(childNode, context) === slot) {
        result.push(childNode);
      }
    }
  }

  return result;
}

/**
 * @see https://www.w3.org/TR/dom41/#find-flattened-slotables
 */
function findFlattenedSlotable(slot: Element, context: Node): Array<Node> {
  const result: Array<Node> = [];

  const rootNode = getRootNode(slot, context);

  if (!isShadowRoot(rootNode)) {
    return result;
  }

  const slotables = findSlotables(slot, context);

  if (slotables.length === 0) {
    const { childNodes } = slot;

    for (let i = 0, n = childNodes.length; i < n; i++) {
      const childNode = childNodes[i];

      if (isElement(childNode) || isText(childNode)) {
        slotables.push(childNode);
      }
    }
  }

  for (let i = 0, n = slotables.length; i < n; i++) {
    const slotable = slotables[i];

    if (isElement(slotable) && slotable.localName === "slot") {
      const rootNode = getRootNode(slotable, context);

      if (rootNode !== null && isShadowRoot(rootNode)) {
        result.push(...findFlattenedSlotable(slotable, context));
        continue;
      }
    }

    result.push(slotable);
  }

  return result;
}
