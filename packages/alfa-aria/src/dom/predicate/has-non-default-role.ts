import type { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { hasExplicitRole } from "./has-explicit-role.ts";
import { hasImplicitRole } from "./has-implicit-role.ts";

const { not, test } = Predicate;

/**
 * @public
 */
export function hasNonDefaultRole(element: Element): boolean {
  return test(
    hasExplicitRole((explicit) =>
      test(
        not(hasImplicitRole((implicit) => implicit.equals(explicit))),
        element,
      ),
    ),
    element,
  );
}
