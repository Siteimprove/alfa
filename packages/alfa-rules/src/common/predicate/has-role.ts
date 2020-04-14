import { Role } from "@siteimprove/alfa-aria";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import {hasName} from "./has-name";

const { equals } = Predicate;

export function hasRole(
  predicate: Predicate<Role>,
  options?: Role.from.Options
): Predicate<Element>;
export function hasRole(
  name: string,
  ...rest: Array<string>
): Predicate<Element>;
export function hasRole(
  options: Role.from.Options,
  name: string,
  ...rest: Array<string>
): Predicate<Element>;
export function hasRole(
  nameOrPredicateOrOptions: string | Predicate<Role> | Role.from.Options,
  nameOrOptions?: string | Role.from.Options,
  ...names: Array<string>
): Predicate<Element> {
  let predicate: Predicate<Role>;
  let options: Role.from.Options;

  if (typeof nameOrPredicateOrOptions === "function") {
    predicate = nameOrPredicateOrOptions;
    if (
      typeof nameOrOptions === "undefined" ||
      typeof nameOrOptions === "string" // should never happen
    ) {
      options = {};
    } else {
      options = nameOrOptions;
    }
  } else {
    if (typeof nameOrPredicateOrOptions === "string") {
      options = {};
      predicate = hasName(equals(nameOrPredicateOrOptions, nameOrOptions, ...names));
    } else {
      options = nameOrPredicateOrOptions;
      predicate = hasName(equals(nameOrOptions, ...names));
    }
  }

  return (element) =>
    Role.from(element, options).some((role) => role.some(predicate));
}
