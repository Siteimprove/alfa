import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";

import { Attribute } from "../../attribute";

/**
 * @public
 */
export function hasName<N extends string = string>(
  predicate: Refinement<string, N>
): Refinement<Attribute, Attribute<N>>;

/**
 * @public
 */
export function hasName<N extends string = string>(
  name: N,
  ...rest: Array<N>
): Refinement<Attribute, Attribute<N>>;

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
