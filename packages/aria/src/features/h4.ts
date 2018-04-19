import { getAttribute } from "@alfa/dom";
import { Feature } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#h4
 */
export const H4: Feature = {
  element: "h4",
  role: h4 =>
    Number(getAttribute(h4, "aria-level")) > 0 ? Roles.Heading : undefined,
  allowedRoles: [Roles.Tab, Roles.None, Roles.Presentation]
};
