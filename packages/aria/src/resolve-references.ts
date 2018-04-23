import { Node, Element, find, getAttribute, isElement } from "@alfa/dom";
import { split, isWhitespace } from "@alfa/util";

export function resolveReferences(
  node: Node,
  context: Node,
  references: string
): Array<Element> {
  const elements: Array<Element> = [];

  for (const id of split(references, isWhitespace)) {
    const element = find<Element>(
      node,
      context,
      node => isElement(node) && getAttribute(node, "id") === id
    );

    if (element !== null) {
      elements.push(element);
    }
  }

  return elements;
}
