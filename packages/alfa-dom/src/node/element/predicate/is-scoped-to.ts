import { Predicate } from "@siteimprove/alfa-predicate";

import { Element } from "../../element";

/**
 * @public
 */
export function isScopedTo(
  names: [string, ...Array<string>]
): Predicate<Element> {
  return (element) =>
    element
      .ancestors()
      .filter(Element.isElement)
      .some(Element.hasName(...names));
}
