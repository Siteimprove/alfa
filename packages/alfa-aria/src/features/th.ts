import { Element, getAttribute } from "@siteimprove/alfa-dom";
import { Any, Feature, Role } from "../types";
import * as Roles from "../roles";

/**
 * @todo Need to handle the auto state
 *
 * @see https://www.w3.org/TR/html-aria/#th
 */
export const Th: Feature = {
  element: "th",
  role,
  allowedRoles: () => Any(Roles)
};

function role(th: Element): Role | null {
  switch (getAttribute(th, "scope")) {
    case "row":
    case "rowgroup":
      return Roles.Row;
    case "col":
    case "colgroup":
      return Roles.ColumnHeader;
  }

  return null;
}
