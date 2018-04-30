import { closest, Element, getTag, isElement } from "@alfa/dom";
import { Feature, Role, Any } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#td
 */
export const Td: Feature = {
  element: "td",
  role,
  allowedRoles: Any
};

function role(td: Element, context: Node): Role | undefined {
  if (
    closest(td, context, element => {
      if (isElement(td)) {
        return getTag(td) === "table";
      }
      return false;
    }) === null
  ) {
    return undefined;
  }
  return Roles.Cell;
}
