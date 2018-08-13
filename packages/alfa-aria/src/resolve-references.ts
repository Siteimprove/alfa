import {
  Element,
  getAttribute,
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
    const element = querySelector(
      node,
      context,
      node => isElement(node) && getAttribute(node, "id") === id
    );

    if (element !== null) {
      elements.push(element as Element);
    }
  }

  return elements;
}
