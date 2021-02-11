import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";

import { Role } from "../../role";

const { equals } = Predicate;

export function hasName<N extends Role.Name>(
  refinement: Refinement<Role.Name, N>
): Refinement<Role, Role<N>>;

export function hasName(predicate: Predicate<Role.Name>): Predicate<Role>;

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
