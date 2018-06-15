import { Element, getAttribute } from "@siteimprove/alfa-dom";
import { Any, Feature, Role } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#th
 */
export const Theader: Feature = {
  element: "th",
  role,
  allowedRoles: Any(Roles)
};

function role(th: Element): Role | undefined {
  switch (getAttribute(th, "scope")) {
    case "row":
    case "rowgroup":
      return Roles.Row;
    case "col":
    case "colgroup":
      return Roles.ColumnHeader;
    default:
      return undefined; // Need to handle the auto state
  }
}
