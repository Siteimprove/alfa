import { Element, getAttribute, Node } from "@siteimprove/alfa-dom";
import { Feature, Role } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#h1-h6
 */
export const H5: Feature = {
  element: "h5",
  role: Roles.Heading;
  allowedRoles: [Roles.Tab, Roles.None, Roles.Presentation]
};
