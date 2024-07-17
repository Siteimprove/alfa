import type { Element } from "@siteimprove/alfa-dom";
import type { Predicate } from "@siteimprove/alfa-predicate";

import { Role } from "../../role.js";

/**
 * Check if an element is marked as decorative.
 *
 * @public
 */
export const isMarkedDecorative: Predicate<Element> = (element) => {
  const role = element.attribute("role").flatMap((attribute) =>
    attribute
      .tokens()
      .filter(Role.isName)
      .map(Role.of)
      .reject((role) => role.isAbstract())
      .first(),
  );

  if (role.some((role) => role.isPresentational())) {
    return true;
  }

  switch (element.name) {
    case "img":
      return (
        role.isNone() &&
        element.attribute("alt").some((attribute) => attribute.value === "")
      );

    default:
      return false;
  }
};
