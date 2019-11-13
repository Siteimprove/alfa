import { Element, Node } from "@siteimprove/alfa-dom";
import { getId, getRootNode, isElement } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";

import { walk } from "../walk";

import { hasId } from "./has-id";

const { find } = Iterable;
const { and, not, equals } = Predicate;

export function hasUniqueId(context: Node): Predicate<Element> {
  return element =>
    getId(element, context)
      .flatMap(id =>
        find(
          walk(getRootNode(element, context), context),
          and(isElement, and(not(equals(element)), hasId(context, equals(id))))
        )
      )
      .isNone();
}
