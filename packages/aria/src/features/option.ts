import { closest, getTag, Element, isElement } from "@alfa/dom";
import { Feature, NoRole, Role } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#option
 */
export const Option: Feature = {
  element: "option",
  role,
  allowedRoles: NoRole
};

function role(option: Element, context: Node): Role | undefined {
  if (
    closest(option, context, option => {
      if (isElement(option)) {
        switch (getTag(option)) {
          case "select":
            return true;
          case "optgroup":
            return true;
          case "datalist":
            return true;
          default:
            return false;
        }
      }
      return false;
    }) !== null
  ) {
    return Roles.Option;
  }

  return undefined;
}
