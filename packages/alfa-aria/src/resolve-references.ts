import {
  Node,
  Element,
  find,
  getAttribute,
  isElement
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

  for (const id of references.split(whitespace)) {
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
