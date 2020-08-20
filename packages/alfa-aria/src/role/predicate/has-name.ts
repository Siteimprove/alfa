import { Predicate } from "@siteimprove/alfa-predicate";

import { Role } from "../../role";

const { equals } = Predicate;

export function hasName<N extends Role.Name>(
  predicate: Predicate<N>
): Predicate<Role, Role<N>>;

export function hasName<N extends Role.Name>(
  name: N,
  ...rest: Array<N>
): Predicate<Role, Role<N>>;

export function hasName<N extends Role.Name>(
  nameOrPredicate: N | Predicate<N>,
  ...names: Array<N>
): Predicate<Role<N>> {
  let predicate: Predicate<N>;

  if (typeof nameOrPredicate === "function") {
    predicate = nameOrPredicate;
  } else {
    predicate = equals(nameOrPredicate, ...names);
  }

  return (role) => predicate(role.name);
}
