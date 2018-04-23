import { getAttribute } from "@alfa/dom";
import { Feature, None } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#link
 */
export const Link: Feature = {
  element: "link",
  role: link => (getAttribute(link, "href") !== null ? Roles.Link : undefined),
  allowedRoles: None
};
