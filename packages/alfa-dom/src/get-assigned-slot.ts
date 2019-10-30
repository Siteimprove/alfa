import { None, Option } from "@siteimprove/alfa-option";
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
): Option<Element> {
  return findSlot(node, context);
}

/**
 * @see https://dom.spec.whatwg.org/#find-a-slot
 */
function findSlot(slotable: Element | Text, context: Node): Option<Element> {
  return getParentElement(slotable, context).flatMap(parentElement => {
    const { shadowRoot } = parentElement;

    if (shadowRoot === null || shadowRoot === undefined) {
      return None;
    }

    const name: Option<string> = isElement(slotable)
      ? getAttribute(slotable, context, "slot")
      : None;

    const [assignedSlot = null] = traverseNode(shadowRoot, context, {
      *enter(node, parentNode) {
        if (
          isElement(node) &&
          node.localName === "slot" &&
          name.equals(getAttribute(node, context, "name"))
        ) {
          yield node;
        }
      }
    });

    return Option.from(assignedSlot);
  });
}
