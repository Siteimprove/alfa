import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { hasExplicitRole, hasAccessibleName } from "../predicate";

const { hasName } = Element;
const { and, not } = Predicate;

export function hasIncorrectRoleWithoutName(device: Device): Predicate<Element> {
  // <form> and <section> element have an implicit role only if they have an accessible name
  // Alfa currently can't handle that and always give them a role.
  // see https://github.com/Siteimprove/alfa/issues/298
  //
  // This detects the cases where such a role was incorrectly given.
  return and(
    hasName("form", "section"),
    not(hasExplicitRole()),
    not(hasAccessibleName(device))
  );
}
