import { getClosest } from "@siteimprove/alfa-dom";
import { Feature } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#footer
 */
export const Footer: Feature = {
  element: "footer",
  role: (footer, context) =>
    getClosest(footer, context, "article, aside, main, nav, section") === null
      ? Roles.ContentInfo
      : undefined,
  allowedRoles: [Roles.Group, Roles.None, Roles.Presentation]
};
