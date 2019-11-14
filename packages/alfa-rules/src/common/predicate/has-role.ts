import { getRole, Role } from "@siteimprove/alfa-aria";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export function hasRole(
  context: Node,
  predicate: Predicate<Role> = () => true
): Predicate<Element> {
  return element =>
    getRole(element, context).some(role => role.filter(predicate).isSome());
}
