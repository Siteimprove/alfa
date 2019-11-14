import {
  Element,
  getId,
  isElement,
  Node,
  querySelector
} from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

const { and } = Predicate;

/**
 * @internal
 */
export function resolveReferences(
  node: Node,
  context: Node,
  references: string
): Array<Element> {
  const elements: Array<Element> = [];

  for (const id of references.trim().split(/\s+/)) {
    const element = querySelector(
      node,
      context,
      and(isElement, element => getId(element, context).includes(id))
    );

    if (element.isSome()) {
      elements.push(element.get());
    }
  }

  return elements;
}
