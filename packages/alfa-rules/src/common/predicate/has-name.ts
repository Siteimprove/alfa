import { Predicate } from "@siteimprove/alfa-predicate";

const { equals, property } = Predicate;

export function hasName<T extends { readonly name: string }>(
  predicate: Predicate<string>
): Predicate<T>;
export function hasName<T extends { readonly name: string }>(
  name: string,
  ...rest: Array<string>
): Predicate<T>;
export function hasName<T extends { readonly name: string }>(
  nameOrPredicate: string | Predicate<string>,
  ...names: Array<string>
): Predicate<T> {
  let predicate: Predicate<string>;

  if (typeof nameOrPredicate === "function") {
    predicate = nameOrPredicate;
  } else {
    predicate = equals(nameOrPredicate, ...names);
  }

  return property("name", predicate);
}
