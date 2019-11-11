import {
  Element,
  getId,
  isElement,
  Node,
  querySelector
} from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

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
      Predicate.and(isElement, element => getId(element, context).includes(id))
    );

    if (element.isSome()) {
      elements.push(element.get());
    }
  }

  return elements;
}
