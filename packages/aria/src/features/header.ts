import { closest, Element, getTag, isElement } from "@alfa/dom";
import { Feature, Role, None } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#header
 */
export const Header: Feature = {
  element: "header",
  role,
  allowedRoles: [Roles.Group, Roles.None, Roles.Presentation]
};

function role(header: Element): Role | undefined {
  if (
    closest(header, element => {
      if (isElement(element)) {
        switch (getTag(element)) {
          case "article":
          case "aside":
          case "main":
          case "nav":
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
