import { Element, getAttribute, Node } from "@siteimprove/alfa-dom";
import * as Roles from "../../roles";
import { Any, Feature, Role } from "../../types";

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

function role(th: Element, context: Node): Role | null {
  switch (getAttribute(th, context, "scope").getOr(null)) {
    case "row":
    case "rowgroup":
      return Roles.RowHeader;
    case "col":
    case "colgroup":
      return Roles.ColumnHeader;
  }

  return null;
}
