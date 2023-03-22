import { type Predicate } from "@siteimprove/alfa-predicate";

import { type Node } from "../../node";
import { type Role } from "../../role";

import { hasName } from "../../role/predicate/has-name";

/**
 * @public
 */
export function hasRole(predicate?: Predicate<Role>): Predicate<Node>;

/**
 * @public
 */
export function hasRole<N extends Role.Name>(
  name: N,
  ...rest: Array<N>
): Predicate<Node>;

export function hasRole(
  nameOrPredicate: Predicate<Role> | Role.Name = () => true,
  ...names: Array<Role.Name>
): Predicate<Node> {
  let predicate: Predicate<Role>;

  if (typeof nameOrPredicate === "function") {
    predicate = nameOrPredicate;
  } else {
    predicate = hasName(nameOrPredicate, ...names);
  }

  return (node) => node.role.some(predicate);
}
