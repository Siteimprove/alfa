import { getAttribute } from "@siteimprove/alfa-dom";
import { Feature, None } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#menu
 */
export const Menu: Feature = {
  element: "menu",
  role: menu =>
    getAttribute(menu, "type") === "context" ? Roles.Menu : undefined,
  allowedRoles: None,
  obsolete: true
};
