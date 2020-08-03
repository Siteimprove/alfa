import { Predicate } from "@siteimprove/alfa-predicate";

import { Name } from "../../name";
import { Node } from "../../node";

const { equals, property } = Predicate;

export function hasName(predicate?: Predicate<Name>): Predicate<Node>;

export function hasName(name: string, ...rest: Array<string>): Predicate<Node>;

export function hasName(
  nameOrPredicate: Predicate<Name> | string | undefined,
  ...names: Array<string>
): Predicate<Node> {
  let predicate: Predicate<Name>;

  if (typeof nameOrPredicate === "function") {
    predicate = nameOrPredicate;
  } else {
    predicate = property("value", equals(nameOrPredicate, ...names));
  }

  return (node) => node.name.some(predicate);
}
