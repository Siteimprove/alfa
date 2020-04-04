import { Predicate } from "@siteimprove/alfa-predicate";

import { Element } from "..";
import { Node } from "../node";

const { and } = Predicate;

export function resolveReferences(
  node: Node,
  references: Iterable<string>
): Array<Element> {
  const elements: Array<Element> = [];

  for (const id of references) {
    const element = node
      .descendants()
      .find(and(Element.isElement, (element) => element.id.includes(id)));

    if (element.isSome()) {
      elements.push(element.get());
    }
  }

  return elements;
}
