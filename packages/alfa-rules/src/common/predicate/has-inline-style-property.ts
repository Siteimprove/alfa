import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Property } from "@siteimprove/alfa-style";

export function hasInlineStyleProperty(
  name: Property.Name
): Predicate<Element> {
  return (element) =>
    element.style.some((block) => block.declaration(name).isSome());
}
