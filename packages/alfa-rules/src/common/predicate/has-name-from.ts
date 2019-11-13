import { Role } from "@siteimprove/alfa-aria";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";

export function hasNameFrom(
  predicate: Predicate<"contents" | "author"> = () => true
): Predicate<Role> {
  return role =>
    role.label !== undefined && Iterable.some(role.label.from, predicate);
}
