import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";

import { Element } from "../../element";

const { equals } = Predicate;

/**
 * @public
 */
export function hasName<N extends string = string>(
  predicate: Refinement<string, N>
): Refinement<Element, Element<N>>;

/**
 * @public
 */
export function hasName<N extends string = string>(
  name: N,
  ...rest: Array<N>
): Refinement<Element, Element<N>>;

export function hasName(
  nameOrPredicate: string | Predicate<string>,
  ...names: Array<string>
): Predicate<Element> {
  let predicate: Predicate<string>;

  if (typeof nameOrPredicate === "function") {
    predicate = nameOrPredicate;
  } else {
    predicate = equals(nameOrPredicate, ...names);
  }

  return (element) => predicate(element.name);
}
