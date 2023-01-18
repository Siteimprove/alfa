import { Iterable } from "@siteimprove/alfa-iterable";
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

/**
 * @public
 */
export function hasId(ids: Iterable<string>): Predicate<Element>;
export function hasId(
  idOrPredicate: string | Predicate<string> | Iterable<string> = () => true,
  ...ids: Array<string>
): Predicate<Element> {
  let predicate: Predicate<string>;

  if (typeof idOrPredicate === "function") {
    predicate = idOrPredicate;
  } else if (typeof idOrPredicate === "string") {
    predicate = equals(idOrPredicate, ...ids);
  } else {
    predicate = (value) => Iterable.includes(ids, value);
  }

  return (element) => element.id.some(predicate);
}
