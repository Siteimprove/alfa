import { Element, getAttribute } from "@siteimprove/alfa-dom";
import * as Roles from "../roles";
import { Any, Feature, Role } from "../types";

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
      return Roles.RowHeader;
    case "col":
    case "colgroup":
      return Roles.ColumnHeader;
  }

  return null;
}
