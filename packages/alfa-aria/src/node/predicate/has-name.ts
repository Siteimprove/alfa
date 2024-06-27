import { Predicate } from "@siteimprove/alfa-predicate";

import { Name } from "../../name/index.js";
import { Node } from "../../node.js";

/**
 * @public
 */
export function hasName(predicate?: Predicate<Name>): Predicate<Node>;

/**
 * @public
 */
export function hasName(name: string, ...rest: Array<string>): Predicate<Node>;

export function hasName(
  nameOrPredicate: Predicate<Name> | string = () => true,
  ...names: Array<string>
): Predicate<Node> {
  const predicate =
    typeof nameOrPredicate === "function"
      ? nameOrPredicate
      : Name.hasValue(nameOrPredicate, ...names);

  return (node) => node.name.some(predicate);
}
