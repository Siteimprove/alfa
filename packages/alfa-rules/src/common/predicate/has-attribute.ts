import { Attribute, Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

const { property } = Predicate;

export function hasAttribute(
  predicate: Predicate<Attribute>
): Predicate<Element>;

export function hasAttribute(
  name: string,
  value?: Predicate<string>
): Predicate<Element>;

export function hasAttribute(
  nameOrPredicate: string | Predicate<Attribute>,
  value: Predicate<string> = () => true
): Predicate<Element> {
  if (typeof nameOrPredicate === "function") {
    return element => element.attribute(nameOrPredicate).isSome();
  }

  const name = nameOrPredicate;
  const predicate = property<Attribute, "value">("value", value);

  return element => element.attribute(name).some(predicate);
}
