import {
  Element,
  getId,
  isElement,
  Node,
  querySelector
} from "@siteimprove/alfa-dom";

const whitespace = /\s+/;

/**
 * @internal
 */
export function resolveReferences(
  node: Node,
  context: Node,
  references: string
): Array<Element> {
  const elements: Array<Element> = [];

  for (const id of references.trim().split(whitespace)) {
    const element = querySelector<Element>(
      node,
      context,
      node => isElement(node) && getId(node) === id
    );

    if (element !== null) {
      elements.push(element);
    }
  }

  return elements;
}
