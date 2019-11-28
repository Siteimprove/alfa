import { Element, Node } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";

const { isElement } = Element;
const { find } = Iterable;
const { and } = Predicate;

/**
 * @internal
 */
export function resolveReferences(
  node: Node,
  references: string
): Array<Element> {
  const elements: Array<Element> = [];

  for (const id of references.trim().split(/\s+/)) {
    const element = find(
      node,
      and(isElement, element => element.id.includes(id))
    );

    if (element.isSome()) {
      elements.push(element.get());
    }
  }

  return elements;
}
