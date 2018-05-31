import { Node, Element, Namespace } from "./types";
import { isElement } from "./guards";
import { traverseNode } from "./traverse-node";

const namespaceMaps: WeakMap<Node, WeakMap<Element, Namespace>> = new WeakMap();

/**
 * @see https://www.w3.org/TR/dom/#dom-element-namespaceuri
 */
export function getElementNamespace(
  element: Element,
  context: Node
): Namespace | null {
  let namespaceMap = namespaceMaps.get(context);

  if (namespaceMap === undefined) {
    namespaceMap = new WeakMap();

    traverseNode(context, {
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

        let parentNamespace: Namespace | null = null;

        if (parentNode !== null && isElement(parentNode)) {
          // As we're doing a top-down traversal, setting the namespace of
          // every parent element before visiting its children, we can safely
          // assert that the parent node will have a namespace defined.
          parentNamespace = namespaceMap!.get(parentNode)!;
        } else {
          namespaceMap!.set(node, Namespace.HTML);
          return;
        }

        switch (parentNamespace) {
          case Namespace.SVG:
            if (node.localName === "foreignObject") {
              namespaceMap!.set(node, Namespace.HTML);
            } else {
              namespaceMap!.set(node, parentNamespace);
            }
            break;
          default:
            namespaceMap!.set(node, parentNamespace);
        }
      }
    });

    namespaceMaps.set(context, namespaceMap);
  }

  return namespaceMap.get(element) || null;
}
