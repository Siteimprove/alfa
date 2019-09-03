import { getAssignedSlot } from "./get-assigned-slot";
import { getHost } from "./get-host";
import { getRootNode } from "./get-root-node";
import { isElement, isShadowRoot, isText } from "./guards";
import { Element, Node } from "./types";

/**
 * Given a `<slot>` element and a context, get the nodes assigned to the element
 * within the context. If the element is not a `<slot>` or no nodes are assigned
 * to the `<slot>`, an empty array is returned.
 *
 * @see https://www.w3.org/TR/dom41/#slot-assigned-nodes
 *
 * @example
 * const slot = <slot name="foo" />;
 * const context = (
 *   <div>
 *     <p slot="foo">Hello world</p>
 *     <shadow>
 *       {slot}
 *     </shadow>
 *   </div>
 * );
 * getAssignedNodes(slot, context);
 * // => [<p>Hello world</p>]
 */
export function getAssignedNodes(
  element: Element,
  context: Node,
  options: getAssignedNodes.Options = {}
): Iterable<Node> {
  if (element.localName !== "slot") {
    return [];
  }

  if (options.flattened === true) {
    return findFlattenedSlotables(element, context);
  }

  return findSlotables(element, context);
}

export namespace getAssignedNodes {
  export interface Options {
    readonly flattened?: boolean;
  }
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

  const host = getHost(rootNode, context);

  if (host === null) {
    return result;
  }

  const { childNodes } = host;

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
function findFlattenedSlotables(slot: Element, context: Node): Array<Node> {
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
      if (isShadowRoot(getRootNode(slotable, context))) {
        result.push(...findFlattenedSlotables(slotable, context));
        continue;
      }
    }

    result.push(slotable);
  }

  return result;
}
