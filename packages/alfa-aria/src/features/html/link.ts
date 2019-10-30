import { hasAttribute } from "@siteimprove/alfa-dom";
import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see https://www.w3.org/TR/html-aria/#link
 */
export const Link: Feature = {
  element: "link",
  role: (link, context) =>
    hasAttribute(link, context, "href") ? Roles.Link : null,
  allowedRoles: () => None(Roles)
};
