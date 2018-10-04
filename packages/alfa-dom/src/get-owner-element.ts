import { isElement } from "./guards";
import { traverseNode } from "./traverse-node";
import { Attribute, Element, Node } from "./types";

const ownerElementMaps = new WeakMap<Node, WeakMap<Attribute, Element>>();

export function getOwnerElement(
  attribute: Attribute,
  context: Node
): Element | null {
  let ownerElementMap = ownerElementMaps.get(context);

  if (ownerElementMap === undefined) {
    ownerElementMap = new WeakMap();

    traverseNode(
      context,
      context,
      {
        enter: node => {
          if (isElement(node)) {
            const { attributes } = node;

            for (let i = 0, n = attributes.length; i < n; i++) {
              ownerElementMap!.set(attributes[i], node);
            }
          }
        }
      },
      { composed: true }
    );

    ownerElementMaps.set(context, ownerElementMap);
  }

  const ownerElement = ownerElementMap.get(attribute);

  if (ownerElement === undefined) {
    return null;
  }

  return ownerElement;
}
