import { Cache } from "@siteimprove/alfa-cache";
import { Option } from "@siteimprove/alfa-option";
import { isElement } from "./guards";
import { traverseNode } from "./traverse-node";
import { Attribute, Element, Node } from "./types";

const ownerElements = Cache.empty<Node, Cache<Attribute, Element>>();

/**
 * Given an attribute and a context, get the owner element of that attribute
 * within the given context. If no element owns the attribute within
 * the context then `null` is returned.
 */
export function getOwnerElement(
  attribute: Attribute,
  context: Node
): Option<Element> {
  return ownerElements
    .get(context, () =>
      Cache.from<Attribute, Element>(
        traverseNode(
          context,
          context,
          {
            *enter(node) {
              if (isElement(node)) {
                const { attributes } = node;

                for (let i = 0, n = attributes.length; i < n; i++) {
                  yield [attributes[i], node];
                }
              }
            }
          },
          { composed: true, nested: true }
        )
      )
    )
    .get(attribute);
}
