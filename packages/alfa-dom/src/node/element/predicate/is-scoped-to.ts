import type { Predicate } from "@siteimprove/alfa-predicate";
import type { Refinement } from "@siteimprove/alfa-refinement";

import type { Element } from "../../slotable/element.js";

import { hasName } from "./has-name.js";

/**
 * @public
 */
export function isScopedTo(
  isElement: Refinement<unknown, Element>,
): (name: string, ...rest: Array<string>) => Predicate<Element> {
  return (name, ...rest) =>
    (element) =>
      element
        .ancestors()
        .filter(isElement)
        .some(hasName(name, ...rest));
}
