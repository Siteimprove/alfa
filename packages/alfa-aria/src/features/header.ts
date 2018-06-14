import { getClosest } from "@siteimprove/alfa-dom";
import { Feature } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#header
 */
export const Header: Feature = {
  element: "header",
  role: (header, context) =>
    getClosest(header, context, "article, aside, main, nav, section") === null
      ? Roles.Banner
      : undefined,
  allowedRoles: [Roles.Group, Roles.None, Roles.Presentation]
};
