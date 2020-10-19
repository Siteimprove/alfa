import { Role } from "@siteimprove/alfa-aria";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export function hasRole(predicate?: Predicate<Role>): Predicate<Element>;

export function hasRole<N extends Role.Name>(
  name: N,
  ...rest: Array<N>
): Predicate<Element>;

export function hasRole(
  nameOrPredicate: Predicate<Role> | Role.Name = () => true,
  ...names: Array<Role.Name>
): Predicate<Element> {
  let predicate: Predicate<Role>;

  if (typeof nameOrPredicate === "function") {
    predicate = nameOrPredicate;
  } else {
    predicate = Role.hasName(nameOrPredicate, ...names);
  }

  return (element) => Role.from(element).some((role) => role.some(predicate));
}
