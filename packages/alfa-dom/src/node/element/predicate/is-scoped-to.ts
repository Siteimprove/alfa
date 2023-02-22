import { Predicate } from "@siteimprove/alfa-predicate";

import { Element } from "../../element";

/**
 * @public
 */
export function isScopedTo(
  name: string,
  ...rest: Array<string>
): Predicate<Element> {
  return (element) =>
    element
      .ancestors()
      .filter(Element.isElement)
      .some(Element.hasName(name, ...rest));
}
