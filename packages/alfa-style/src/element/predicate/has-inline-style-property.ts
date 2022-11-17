import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { Property } from "../../property";

/**
 * @deprecated
 * Used by R91/R92/R93 version 1
 *
 * @public
 */
export function hasInlineStyleProperty(
  name: Property.Name
): Predicate<Element> {
  return (element) =>
    element.style.some((block) => block.declaration(name).isSome());
}
