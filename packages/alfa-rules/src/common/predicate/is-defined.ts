import { Predicate } from "@siteimprove/alfa-predicate";

export function isDefined<T>(): Predicate<T, Exclude<T, undefined>> {
  return (value) => value !== undefined;
}
