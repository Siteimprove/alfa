import { Element, Parent, collect, getAttribute, isElement } from "@alfa/dom";
import { split, isWhitespace } from "@alfa/util";

export function resolveReferences(
  root: Parent,
  references: string
): Array<Element> {
  const elements: Array<Element> = [];

  for (const id of split(references, isWhitespace)) {
    const element = collect(root)
      .where(isElement)
      .where(element => getAttribute(element, "id") === id)
      .first();

    if (element !== null) {
      elements.push(element);
    }
  }

  return elements;
}
