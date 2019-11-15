import { getRole, Role } from "@siteimprove/alfa-aria";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export function hasRole(
  context: Node,
  predicate: Predicate<Role> = () => true,
  options: getRole.Options = {}
): Predicate<Element> {
  return element =>
    getRole(element, context, options).some(role =>
      role.filter(predicate).isSome()
    );
}
