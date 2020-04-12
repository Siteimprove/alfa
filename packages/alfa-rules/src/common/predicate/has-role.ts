import { Role } from "@siteimprove/alfa-aria";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

// Also possible here, but trickier due to the options parameter
export function hasRole(
  predicate: Predicate<Role> = () => true,
  options: Role.from.Options = {}
): Predicate<Element> {
  return (element) =>
    Role.from(element, options).some((role) => role.some(predicate));
}
