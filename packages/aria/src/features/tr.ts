import { closest, Element, isElement, getTag } from "@alfa/dom";
import { getRole } from "../get-role";
import { Feature, Role, AnyRole } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#tr
 */
export const Tr: Feature = {
  element: "tr",
  role,
  allowedRoles: AnyRole
};

function role(tr: Element, context: Node): Role | undefined {
  if (
    closest(tr, context, tr => {
      return (
        isElement(tr) &&
        getTag(tr) === "table" &&
        getRole(tr, context) === Roles.Grid
      );
    }) !== null
  ) {
    return Roles.Row;
  }
  return undefined;
}
