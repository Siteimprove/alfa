import { Predicate } from "@siteimprove/alfa-predicate";

import { Name } from "../../name";
import { Node } from "../../node";

export function hasName(predicate?: Predicate<Name>): Predicate<Node>;

export function hasName(name: string, ...rest: Array<string>): Predicate<Node>;

export function hasName(
  nameOrPredicate: Predicate<Name> | string = () => true,
  ...names: Array<string>
): Predicate<Node> {
  let predicate: Predicate<Name>;

  if (typeof nameOrPredicate === "function") {
    predicate = nameOrPredicate;
  } else {
    predicate = Name.hasValue(nameOrPredicate, ...names);
  }

  return (node) => node.name.some(predicate);
}
