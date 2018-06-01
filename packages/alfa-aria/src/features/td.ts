import {
  Element,
  getClosest,
  getTagName,
  isElement,
  Node
} from "@siteimprove/alfa-dom";
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
        return getTagName(td, context) === "table";
      }
      return false;
    }) === null
  ) {
    return undefined;
  }
  return Roles.Cell;
}
