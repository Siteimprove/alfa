import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { hasExplicitRole } from "./has-explicit-role";
import { hasAccessibleName } from "./has-accessible-name";

const { hasName, isScopedTo } = Element;
const { and, not, or } = Predicate;

/**
 * `<aside>`, `<form>` and `<section>` elements have a non-generic implicit role
 * only if they have an accessible name.
 * Alfa currently can't handle that and always give them a role.
 * {@link https://github.com/Siteimprove/alfa/issues/298}
 * @public
 */
export function hasIncorrectRoleWithoutName(
  device: Device
): Predicate<Element> {
  return and(
    hasSuspiciousRole,
    not(hasExplicitRole()),
    not(hasAccessibleName(device))
  );
}

/**
 * form and section without name are always roleless.
 * aside elements are roleless when scoped to sectioning content.
 */
const hasSuspiciousRole = or(
  hasName("form", "section"),
  and(hasName("aside"), isScopedTo("article", "aside", "nav", "section"))
);
