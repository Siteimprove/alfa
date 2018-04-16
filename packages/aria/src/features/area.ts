import { getAttribute } from "@alfa/dom";
import { Feature, None } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#area
 */
export const Area: Feature = {
  element: "area",
  role: area => (getAttribute(area, "href") === null ? undefined : Roles.Link),
  allowedRoles: None
};
