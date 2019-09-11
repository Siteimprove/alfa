import { Cache } from "@siteimprove/alfa-util";
import { isElement } from "./guards";
import { traverseNode } from "./traverse-node";
import { Element, Namespace, Node } from "./types";

const namespaces = Cache.of<Node, Cache<Element, Namespace>>();

/**
 * Given an element and a context, get the namespace of the element within the
 * context.
 *
 * @see https://www.w3.org/TR/dom/#dom-element-namespaceuri
 */
export function getElementNamespace(
  element: Element,
  context: Node
): Namespace | null {
  return namespaces
    .get(context, () => {
      const namespaces = Cache.of<Element, Namespace>();

      traverseNode(
        context,
        context,
        {
          enter(node, parentNode) {
            if (!isElement(node)) {
              return;
            }

            if (node.localName === "svg") {
              namespaces.set(node, Namespace.SVG);
              return;
            }

            if (node.localName === "math") {
              namespaces.set(node, Namespace.MathML);
              return;
            }

            if (parentNode === null || !isElement(parentNode)) {
              namespaces.set(node, Namespace.HTML);
              return;
            }

            // As we're doing a top-down traversal, setting the namespace of
            // every parent element before visiting its children, we can safely
            // assert that the parent node will have a namespace defined.
            const parentNamespace = namespaces.get(parentNode)!;

            if (
              node.localName === "foreignObject" &&
              parentNamespace === Namespace.SVG
            ) {
              namespaces.set(node, Namespace.HTML);
            } else {
              namespaces.set(node, parentNamespace);
            }
          }
        },
        { composed: true, nested: true }
      );

      return namespaces;
    })
    .get(element);
}
