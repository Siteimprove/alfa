import { getAttribute, Element } from "@siteimprove/alfa-dom";
import { Feature, Role, AnyRoleExcept } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#img
 */
export const Img: Feature = {
  element: "img",
  role,
  allowedRoles: img =>
    role(img) === undefined
      ? [Roles.None, Roles.Presentation]
      : AnyRoleExcept(Roles.None, Roles.Presentation)
};

function role(img: Element): Role | undefined {
  const alt = getAttribute(img, "alt");
  if (alt === "") {
    return undefined;
  }
  if (alt !== "") {
    return Roles.Img;
  }
  // The specification leaves out the case where alt is null. Thus, this case
  // is handled in the same manner as the case where alt is specified to non-
  // empty value.
  return Roles.Img;
}
