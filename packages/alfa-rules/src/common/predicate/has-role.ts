import { Role } from "@siteimprove/alfa-aria";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export function hasRole(
  predicate: Predicate<Role> = () => true,
  options: Role.from.Options = {}
): Predicate<Element> {
  return (element) =>
    Role.from(element, options).some((role) => role.some(predicate));
}
