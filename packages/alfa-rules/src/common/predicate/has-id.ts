import { Element, Node } from "@siteimprove/alfa-dom";
import { getId } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

const { and, not, equals } = Predicate;

export function hasId(context: Node, id?: string): Predicate<Element> {
  return element =>
    getId(element, context)
      .filter(and(not(equals("")), found => id === undefined || id === found))
      .isSome();
}
