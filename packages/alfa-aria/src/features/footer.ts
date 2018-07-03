import { getClosest } from "@siteimprove/alfa-dom";
import * as Roles from "../roles";
import { Feature } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#footer
 */
export const Footer: Feature = {
  element: "footer",
  role: (footer, context) =>
    getClosest(footer, context, "article, aside, main, nav, section") === null
      ? Roles.ContentInfo
      : null,
  allowedRoles: () => [Roles.Group, Roles.None, Roles.Presentation]
};
