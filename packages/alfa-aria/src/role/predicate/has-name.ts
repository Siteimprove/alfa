import { Predicate } from "@siteimprove/alfa-predicate";
import type { Refinement } from "@siteimprove/alfa-refinement";

import type { Role } from "../../role.js";

const { equals } = Predicate;

/**
 * @public
 */
export function hasName<N extends Role.Name>(
  refinement: Refinement<Role.Name, N>,
): Refinement<Role, Role<N>>;

/**
 * @public
 */
export function hasName(predicate: Predicate<Role.Name>): Predicate<Role>;

/**
 * @public
 */
export function hasName<N extends Role.Name>(
  name: N,
  ...rest: Array<N>
): Refinement<Role, Role<N>>;

export function hasName(
  nameOrPredicate: Role.Name | Predicate<Role.Name>,
  ...names: Array<Role.Name>
): Predicate<Role> {
  let predicate: Predicate<Role.Name>;

  if (typeof nameOrPredicate === "function") {
    predicate = nameOrPredicate;
  } else {
    predicate = equals(nameOrPredicate, ...names);
  }

  return (role) => predicate(role.name);
}
