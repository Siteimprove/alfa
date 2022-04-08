import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { Role } from "../../role";

const { equals, property } = Predicate;

/**
 * @public
 */
export function hasImplicitRole(
  predicate?: Predicate<Role>
): Predicate<Element>;

/**
 * @public
 */
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

  return (element) => Role.fromImplicit(element).some(predicate);
}
