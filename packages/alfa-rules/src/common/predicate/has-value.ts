import { Predicate } from "@siteimprove/alfa-predicate";

const { property } = Predicate;

export function hasValue<T extends { readonly value: string }>(
  predicate: Predicate<string> = () => true
): Predicate<T> {
  return property("value", predicate);
}
