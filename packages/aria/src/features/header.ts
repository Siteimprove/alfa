import { getClosest, Element, getTag, isElement } from "@alfa/dom";
import { Feature, Role } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#header
 */
export const Header: Feature = {
  element: "header",
  role,
  allowedRoles: [Roles.Group, Roles.None, Roles.Presentation]
};

function role(header: Element, context: Element): Role | undefined {
  if (
    getClosest(header, context, element => {
      if (isElement(element)) {
        switch (getTag(element)) {
          case "article":
            return true;
          case "aside":
            return true;
          case "main":
            return true;
          case "nav":
            return true;
          case "section":
            return true;

          default:
            return false;
        }
      }
      return false;
    }) === null
  )
    return Roles.Banner;
  else return undefined;
}
