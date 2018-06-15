import { getAttribute, Element } from "@siteimprove/alfa-dom";
import { Any, Feature, Role, Except } from "../types";
import * as Roles from "../roles";
import * as Attributes from "../attributes";

/**
 * @see https://www.w3.org/TR/html-aria/#img
 */
export const Img: Feature = {
  element: "img",
  role,
  allowedRoles: (img: any) =>
    role(img) === undefined
      ? [Roles.None, Roles.Presentation]
      : Except(Roles, [Roles.None, Roles.Presentation]),
  allowedAttributes: (img: any) =>
    role(img) === undefined ? [Attributes.Hidden] : Any(Attributes)
};

function role(img: Element): Role | undefined {
  const alt = getAttribute(img, "alt");
  if (alt === "") {
    return undefined;
  }
  // The specification leaves out the case where alt is null. Thus, this case
  // is handled in the same manner as the case where alt is specified to non-
  // empty value.
  return Roles.Img;
}
