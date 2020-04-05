import { parseTokensList } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";

import { Attribute, Element } from "..";
import { Node } from "../node";

const { and } = Predicate;

export function resolveReferences(
  node: Node,
  ...references: Array<string>
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

export function resolveAttributeReferences(
  element: Element,
  node: Node,
  name: string
): Array<Element> {
  return resolveReferences(
    node,
    ...element
      .attribute(name)
      .map(Attribute.parseAttribute(parseTokensList))
      .map((r) => r.get())
      .getOr([])
  );
}
