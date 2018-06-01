import { getAttribute } from "@siteimprove/alfa-dom";
import { Feature } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#h3
 */
export const H3: Feature = {
  element: "h3",
  role: h3 =>
    Number(getAttribute(h3, "aria-level")) > 0 ? Roles.Heading : undefined,
  allowedRoles: [Roles.Tab, Roles.None, Roles.Presentation]
};
