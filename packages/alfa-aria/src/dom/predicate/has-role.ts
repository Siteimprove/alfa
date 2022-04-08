import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { Node } from "../../node";
import type { Role } from "../../role";

import { hasName } from "../../role/predicate/has-name";

/**
 * @public
 */
export function hasRole(
  device: Device,
  predicate?: Predicate<Role>
): Predicate<Element>;

/**
 * @public
 */
export function hasRole<N extends Role.Name>(
  device: Device,
  name: N,
  ...rest: Array<N>
): Predicate<Element>;

export function hasRole(
  device: Device,
  nameOrPredicate: Predicate<Role> | Role.Name = () => true,
  ...names: Array<Role.Name>
): Predicate<Element> {
  let predicate: Predicate<Role>;

  if (typeof nameOrPredicate === "function") {
    predicate = nameOrPredicate;
  } else {
    predicate = hasName(nameOrPredicate, ...names);
  }

  return (element) => Node.from(element, device).role.some(predicate);
}
