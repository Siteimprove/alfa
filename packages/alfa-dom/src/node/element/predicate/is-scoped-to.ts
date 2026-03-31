import type { Predicate } from "@siteimprove/alfa-predicate";
import type { Refinement } from "@siteimprove/alfa-refinement";

import type { Element } from "../../slotable/element.ts";

import { hasName } from "./has-name.ts";

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
