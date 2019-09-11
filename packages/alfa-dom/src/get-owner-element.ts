import { Cache } from "@siteimprove/alfa-util";
import { isElement } from "./guards";
import { traverseNode } from "./traverse-node";
import { Attribute, Element, Node } from "./types";

const ownerElements = Cache.of<Node, Cache<Attribute, Element>>();

/**
 * Given an attribute and a context, get the owner element of that attribute
 * within the given context. If no element owns the attribute within
 * the context then `null` is returned.
 */
export function getOwnerElement(
  attribute: Attribute,
  context: Node
): Element | null {
  return ownerElements
    .get(context, () => {
      const ownerElements = Cache.of<Attribute, Element>({ weak: false });

      traverseNode(
        context,
        context,
        {
          enter(node) {
            if (isElement(node)) {
              const { attributes } = node;

              for (let i = 0, n = attributes.length; i < n; i++) {
                ownerElements.set(attributes[i], node);
              }
            }
          }
        },
        { composed: true, nested: true }
      );

      return ownerElements;
    })
    .get(attribute);
}
