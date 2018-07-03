import { getAttribute } from "@siteimprove/alfa-dom";
import * as Roles from "../roles";
import { Feature, None } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#menu
 */
export const Menu: Feature = {
  element: "menu",
  role: menu => (getAttribute(menu, "type") === "context" ? Roles.Menu : null),
  allowedRoles: () => None,
  obsolete: true
};
