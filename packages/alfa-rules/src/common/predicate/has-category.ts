import { Role } from "@siteimprove/alfa-aria";
import { Predicate } from "@siteimprove/alfa-predicate";

const { property } = Predicate;

export function hasCategory(
  predicate: Predicate<Role.Category> = () => true
): Predicate<Role> {
  return property("category", predicate);
}
