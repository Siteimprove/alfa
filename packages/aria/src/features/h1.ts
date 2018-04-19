import { getAttribute } from "@alfa/dom";
import { Feature } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#h1
 */
export const H1: Feature = {
  element: "h1",
  role: h1 =>
    Number(getAttribute(h1, "aria-level")) > 0 ? Roles.Heading : undefined,
  allowedRoles: [Roles.Tab, Roles.None, Roles.Presentation]
};
