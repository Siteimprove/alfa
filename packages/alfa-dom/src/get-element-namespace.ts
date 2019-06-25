import { isElement } from "./guards";
import { traverseNode } from "./traverse-node";
import { Element, Namespace, Node } from "./types";

const namespaceMaps: WeakMap<Node, WeakMap<Element, Namespace>> = new WeakMap();

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
  let namespaceMap = namespaceMaps.get(context);

  if (namespaceMap === undefined) {
    namespaceMap = new WeakMap();

    traverseNode(
      context,
      context,
      {
        enter(node, parentNode) {
          if (!isElement(node)) {
            return;
          }

          if (node.localName === "svg") {
            namespaceMap!.set(node, Namespace.SVG);
            return;
          }

          if (node.localName === "math") {
            namespaceMap!.set(node, Namespace.MathML);
            return;
          }

          if (parentNode === null || !isElement(parentNode)) {
            namespaceMap!.set(node, Namespace.HTML);
            return;
          }

          // As we're doing a top-down traversal, setting the namespace of every
          // parent element before visiting its children, we can safely assert
          // that the parent node will have a namespace defined.
          const parentNamespace = namespaceMap!.get(parentNode)!;

          if (
            node.localName === "foreignObject" &&
            parentNamespace === Namespace.SVG
          ) {
            namespaceMap!.set(node, Namespace.HTML);
          } else {
            namespaceMap!.set(node, parentNamespace);
          }
        }
      },
      {
        composed: true
      }
    );

    namespaceMaps.set(context, namespaceMap);
  }

  const namespace = namespaceMap.get(element);

  if (namespace === undefined) {
    return null;
  }

  return namespace;
}
