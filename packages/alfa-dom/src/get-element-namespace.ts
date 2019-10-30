import { Cache } from "@siteimprove/alfa-cache";
import { Option } from "@siteimprove/alfa-option";
import { isElement } from "./guards";
import { traverseNode } from "./traverse-node";
import { Element, Namespace, Node } from "./types";

const cache = Cache.empty<Node, Cache<Element, Namespace>>();

/**
 * Given an element and a context, get the namespace of the element within the
 * context.
 *
 * @see https://dom.spec.whatwg.org/#dom-element-namespaceuri
 */
export function getElementNamespace(
  element: Element,
  context: Node
): Option<Namespace> {
  return cache
    .get(context, () => {
      const namespaces = Cache.empty<Element, Namespace>();

      return namespaces.merge(
        traverseNode(
          context,
          context,
          {
            *enter(node, parentNode) {
              if (!isElement(node)) {
                return;
              }

              if (node.localName === "svg") {
                yield [node, Namespace.SVG];
              } else if (node.localName === "math") {
                yield [node, Namespace.MathML];
              } else if (parentNode === null || !isElement(parentNode)) {
                yield [node, Namespace.HTML];
              } else {
                const parentNamespace = namespaces
                  .get(parentNode)
                  .getOr(Namespace.HTML);

                if (
                  node.localName === "foreignObject" &&
                  parentNamespace === Namespace.SVG
                ) {
                  yield [node, Namespace.HTML];
                } else {
                  yield [node, parentNamespace];
                }
              }
            }
          },
          { composed: true, nested: true }
        )
      );
    })
    .get(element);
}
