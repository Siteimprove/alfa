import { Predicate } from "@siteimprove/alfa-predicate";

import { Attribute } from "../../attribute";

export function hasName(predicate: Predicate<string>): Predicate<Attribute>;

export function hasName(
  name: string,
  ...rest: Array<string>
): Predicate<Attribute>;

export function hasName(
  nameOrPredicate: string | Predicate<string>,
  ...names: Array<string>
): Predicate<Attribute> {
  let predicate: Predicate<string, [Attribute]>;

  if (typeof nameOrPredicate === "function") {
    predicate = nameOrPredicate;
  } else {
    names.unshift(nameOrPredicate);

    predicate = (name, attribute) =>
      names.some(
        (candidate) => Attribute.foldCase(candidate, attribute.owner) === name
      );
  }

  return (attribute) => predicate(attribute.name, attribute);
}
