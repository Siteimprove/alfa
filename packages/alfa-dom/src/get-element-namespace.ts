import { Cache } from "@siteimprove/alfa-cache";
import { Option } from "@siteimprove/alfa-option";
import { isElement } from "./guards";
import { traverseNode } from "./traverse-node";
import { Element, Namespace, Node } from "./types";

const namespaces = Cache.empty<Node, Cache<Element, Namespace>>();

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
  return namespaces
    .get(context, () =>
      Cache.from<Element, Namespace>(
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
                // As we're doing a top-down traversal, setting the namespace of
                // every parent element before visiting its children, we can safely
                // assert that the parent node will have a namespace defined.
                // const parentNamespace = namespaces.get(parentNode)!;
                // if (
                //   node.localName === "foreignObject" &&
                //   parentNamespace === Namespace.SVG
                // ) {
                //   yield [node, Namespace.HTML];
                // } else {
                //   yield [node, parentNamespace];
                // }
              }
            }
          },
          { composed: true, nested: true }
        )
      )
    )
    .get(element);
}
