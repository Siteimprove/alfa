import { Role } from "@siteimprove/alfa-aria";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { hasName } from "./has-name";

const { equals } = Predicate;

export function hasRole(predicate?: Predicate<Role>): Predicate<Element>;

export function hasRole(
  name: string,
  ...rest: Array<string>
): Predicate<Element>;

export function hasRole(
  nameOrPredicate: undefined | string | Predicate<Role>,
  ...names: Array<string>
): Predicate<Element> {
  const options = {};

  return typeof nameOrPredicate === "function" ||
    typeof nameOrPredicate === "undefined"
    ? hasRoleWithOptions(options, nameOrPredicate)
    : hasRoleWithOptions(options, nameOrPredicate, ...names);
}

export function hasExplicitRole(
  predicate?: Predicate<Role>
): Predicate<Element>;

export function hasExplicitRole(
  name: string,
  ...rest: Array<string>
): Predicate<Element>;

export function hasExplicitRole(
  nameOrPredicate: undefined | string | Predicate<Role>,
  ...names: Array<string>
): Predicate<Element> {
  const options = { implicit: false };

  return typeof nameOrPredicate === "function" ||
    typeof nameOrPredicate === "undefined"
    ? hasRoleWithOptions(options, nameOrPredicate)
    : hasRoleWithOptions(options, nameOrPredicate, ...names);
}

export function hasImplicitRole(
  predicate?: Predicate<Role>
): Predicate<Element>;

export function hasImplicitRole(
  name: string,
  ...rest: Array<string>
): Predicate<Element>;

export function hasImplicitRole(
  nameOrPredicate: undefined | string | Predicate<Role>,
  ...names: Array<string>
): Predicate<Element> {
  const options = { explicit: false };

  return typeof nameOrPredicate === "function" ||
    typeof nameOrPredicate === "undefined"
    ? hasRoleWithOptions(options, nameOrPredicate)
    : hasRoleWithOptions(options, nameOrPredicate, ...names);
}

function hasRoleWithOptions(
  options: Role.from.Options,
  predicate?: Predicate<Role>
): Predicate<Element>;

function hasRoleWithOptions(
  options: Role.from.Options,
  name: string,
  ...rest: Array<string>
): Predicate<Element>;

function hasRoleWithOptions(
  options: Role.from.Options,
  nameOrPredicate: undefined | string | Predicate<Role>,
  ...names: Array<string>
): Predicate<Element> {
  let predicate: Predicate<Role>;

  switch (typeof nameOrPredicate) {
    case "function":
      predicate = nameOrPredicate;
      break;
    case "undefined":
      predicate = () => true;
      break;
    default:
      predicate = hasName(equals(nameOrPredicate, ...names));
  }

  return (element) =>
    Role.from(element, options).some((role) => role.some(predicate));
}
