import { Element } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";

import { hasId } from "./has-id";

const { find } = Iterable;
const { and, not, equals } = Predicate;

export function hasUniqueId(): Predicate<Element> {
  return element =>
    element.id
      .flatMap(id =>
        find(
          element.root(),
          and(Element.isElement, and(not(equals(element)), hasId(equals(id))))
        )
      )
      .isNone();
}
