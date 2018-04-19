import { getAttribute } from "@alfa/dom";
import { Feature } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#h2
 */
export const H2: Feature = {
  element: "h2",
  role: h2 =>
    Number(getAttribute(h2, "aria-level")) > 0 ? Roles.Heading : undefined,
  allowedRoles: [Roles.Tab, Roles.None, Roles.Presentation]
};
