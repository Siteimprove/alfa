import { Predicate } from "@siteimprove/alfa-predicate";

import { Node } from "../../node";
import { Role } from "../../role";

const { equals, property } = Predicate;

export function hasRole(predicate?: Predicate<Role>): Predicate<Node>;

export function hasRole<N extends Role.Name>(
  name: N,
  ...rest: Array<N>
): Predicate<Node>;

export function hasRole(
  nameOrPredicate: Predicate<Role> | Role.Name | undefined,
  ...names: Array<Role.Name>
): Predicate<Node> {
  let predicate: Predicate<Role>;

  if (typeof nameOrPredicate === "function") {
    predicate = nameOrPredicate;
  } else {
    predicate = property("name", equals(nameOrPredicate, ...names));
  }

  return (node) => node.role.some(predicate);
}
