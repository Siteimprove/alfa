import { getAttribute } from "@alfa/dom";
import { Feature } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#h5
 */
export const H5: Feature = {
  element: "h5",
  role: h5 =>
    Number(getAttribute(h5, "aria-level")) > 0 ? Roles.Heading : undefined,
  allowedRoles: [Roles.Tab, Roles.None, Roles.Presentation]
};
