import { Predicate } from "@siteimprove/alfa-predicate";

import { Attribute } from "../../attribute";
import { Element } from "../../element";

const { property } = Predicate;

/**
 * @public
 */
export function hasAttribute(
  predicate: Predicate<Attribute>
): Predicate<Element>;

/**
 * @public
 */
export function hasAttribute(
  name: string,
  value?: Predicate<string>
): Predicate<Element>;

export function hasAttribute(
  nameOrPredicate: string | Predicate<Attribute>,
  value: Predicate<string> = () => true
): Predicate<Element> {
  if (typeof nameOrPredicate === "function") {
    return (element) => element.attribute(nameOrPredicate).isSome();
  }

  const name = nameOrPredicate;
  const predicate = property<Attribute, "value">("value", value);

  return (element) => element.attribute(name).some(predicate);
}
