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
 * @see https://dom.spec.whatwg.org/#slot-assigned-nodes
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
export function* getAssignedNodes(
  element: Element,
  context: Node,
  options: getAssignedNodes.Options = {}
): Iterable<Node> {
  if (element.localName !== "slot") {
    return;
  }

  if (options.flattened === true) {
    yield* findFlattenedSlotables(element, context);
  }

  yield* findSlotables(element, context);
}

export namespace getAssignedNodes {
  export interface Options {
    readonly flattened?: boolean;
  }
}

/**
 * @see https://dom.spec.whatwg.org/#find-slotables
 */
function* findSlotables(slot: Element, context: Node): Iterable<Node> {
  const rootNode = getRootNode(slot, context);

  if (!isShadowRoot(rootNode)) {
    return;
  }

  const host = getHost(rootNode, context);

  if (!host.isSome()) {
    return;
  }

  const { childNodes } = host.get();

  for (let i = 0, n = childNodes.length; i < n; i++) {
    const childNode = childNodes[i];

    if (isElement(childNode) || isText(childNode)) {
      if (getAssignedSlot(childNode, context).includes(slot)) {
        yield childNode;
      }
    }
  }
}

/**
 * @see https://dom.spec.whatwg.org/#find-flattened-slotables
 */
function* findFlattenedSlotables(slot: Element, context: Node): Iterable<Node> {
  const rootNode = getRootNode(slot, context);

  if (!isShadowRoot(rootNode)) {
    return;
  }

  const slotables = [...findSlotables(slot, context)];

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
        yield* findFlattenedSlotables(slotable, context);
        continue;
      }
    }
  }
}
