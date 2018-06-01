import {
  getClosest,
  getTagName,
  Element,
  isElement,
  Node
} from "@siteimprove/alfa-dom";
import { Feature, Role } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#footer
 */
export const Footer: Feature = {
  element: "footer",
  role,
  allowedRoles: [Roles.Group, Roles.None, Roles.Presentation]
};

function role(header: Element, context: Node): Role | undefined {
  if (
    getClosest(header, context, element => {
      if (isElement(element)) {
        switch (getTagName(element, context)) {
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
    return Roles.ContentInfo;
  else return undefined;
}
