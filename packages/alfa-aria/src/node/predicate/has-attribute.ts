import { Predicate } from "@siteimprove/alfa-predicate";

import { type Attribute } from "../../attribute";
import { type Node } from "../../node";

const { property } = Predicate;

/**
 * @public
 */
export function hasAttribute(predicate: Predicate<Attribute>): Predicate<Node>;

/**
 * @public
 */
export function hasAttribute(
  name: Attribute.Name,
  value?: Predicate<string>
): Predicate<Node>;

export function hasAttribute(
  nameOrPredicate: Attribute.Name | Predicate<Attribute>,
  value: Predicate<string> = () => true
): Predicate<Node> {
  if (typeof nameOrPredicate === "function") {
    return (node) => node.attribute(nameOrPredicate).isSome();
  }

  const name = nameOrPredicate;
  const predicate = property<Attribute, "value">("value", value);

  return (node) => node.attribute(name).some(predicate);
}
