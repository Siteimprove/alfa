import { getClosest, Element, getTag, isElement } from "@alfa/dom";
import { Feature, Role, AnyRole } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#td
 */
export const Td: Feature = {
  element: "td",
  role,
  allowedRoles: AnyRole
};

function role(td: Element, context: Node): Role | undefined {
  if (
    getClosest(td, context, element => {
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
