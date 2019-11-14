import { Role } from "@siteimprove/alfa-aria";
import { Predicate } from "@siteimprove/alfa-predicate";

export function hasNameFrom(
  predicate: Predicate<"contents" | "author"> = () => true
): Predicate<Role> {
  return role => role.hasNameFrom(predicate);
}
