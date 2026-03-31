import type { Predicate } from "@siteimprove/alfa-predicate";
import type { Refinement } from "@siteimprove/alfa-refinement";

import type { Attribute } from "../../attribute.ts";

/**
 * @public
 */
export function hasName<N extends string = string>(
  predicate: Refinement<string, N>,
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
  let predicate: Predicate<string>;

  if (typeof nameOrPredicate === "function") {
    predicate = nameOrPredicate;
  } else {
    names.unshift(nameOrPredicate);

    predicate = (name) => names.some((candidate) => candidate === name);
  }

  return (attribute) => predicate(attribute.name);
}
