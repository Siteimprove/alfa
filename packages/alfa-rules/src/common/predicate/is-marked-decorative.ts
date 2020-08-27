import { Role } from "@siteimprove/alfa-aria";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

/**
 * Check if an element is marked as decorative.
 */
export const isMarkedDecorative: Predicate<Element> = (element) => {
  const role = element.attribute("role").flatMap((attribute) =>
    attribute
      .tokens()
      .filter(Role.isName)
      .map(Role.of)
      .reject((role) => role.isAbstract())
      .first()
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
