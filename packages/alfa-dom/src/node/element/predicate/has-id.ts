import { Predicate } from "@siteimprove/alfa-predicate";

import { Element } from "../../element";

const { equals } = Predicate;

/**
 * @public
 */
export function hasId(predicate?: Predicate<string>): Predicate<Element>;

/**
 * @public
 */
export function hasId(id: string, ...rest: Array<string>): Predicate<Element>;

export function hasId(
  idOrPredicate: string | Predicate<string> = () => true,
  ...ids: Array<string>
): Predicate<Element> {
  let predicate: Predicate<string>;

  if (typeof idOrPredicate === "function") {
    predicate = idOrPredicate;
  } else {
    predicate = equals(idOrPredicate, ...ids);
  }

  return (element) => element.id.some(predicate);
}
