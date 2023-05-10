import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import type { Longhands } from "../../longhands";

/**
 * @deprecated
 * Used by R91/R92/R93 version 1
 *
 * @public
 */
export function hasInlineStyleProperty(
  name: Longhands.Name
): Predicate<Element> {
  return (element) =>
    element.style.some((block) => block.declaration(name).isSome());
}
