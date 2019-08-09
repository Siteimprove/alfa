import { getClosest } from "@siteimprove/alfa-dom";
import * as Roles from "../../roles";
import { Feature } from "../../types";

/**
 * @see https://www.w3.org/TR/html-aria/#header
 */
export const Header: Feature = {
  element: "header",
  role: (header, context) =>
    getClosest(header, context, "article, aside, main, nav, section") === null
      ? Roles.Banner
      : null,
  allowedRoles: () => [Roles.Group, Roles.None, Roles.Presentation]
};
