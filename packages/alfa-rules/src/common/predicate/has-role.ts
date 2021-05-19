import { Node, Role } from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export function hasRole(
  device: Device,
  predicate?: Predicate<Role>
): Predicate<Element>;

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
    predicate = Role.hasName(nameOrPredicate, ...names);
  }

  return (element) => Node.from(element, device).role.some(predicate);
}
