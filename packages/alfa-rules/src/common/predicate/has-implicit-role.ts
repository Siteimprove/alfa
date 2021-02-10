import { Role } from "@siteimprove/alfa-aria";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

const { equals, property } = Predicate;

export function hasImplicitRole(
  predicate?: Predicate<Role>
): Predicate<Element>;

export function hasImplicitRole<N extends Role.Name>(
  name: N,
  ...rest: Array<N>
): Predicate<Element>;

export function hasImplicitRole(
  nameOrPredicate: Predicate<Role> | Role.Name | undefined,
  ...names: Array<Role.Name>
): Predicate<Element> {
  let predicate: Predicate<Role>;

  if (typeof nameOrPredicate === "function") {
    predicate = nameOrPredicate;
  } else {
    predicate = property("name", equals(nameOrPredicate, ...names));
  }

  return (element) =>
    Role.fromImplicit(element).some((role) => role.some(predicate));
}
