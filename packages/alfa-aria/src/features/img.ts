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
  allowedRoles: img =>
    role(img) === null
      ? [Roles.None, Roles.Presentation]
      : Except(Roles, [Roles.None, Roles.Presentation]),
  allowedAttributes: img =>
    role(img) === null ? [Attributes.Hidden] : Any(Attributes)
};

function role(img: Element): Role | null {
  const alt = getAttribute(img, "alt");

  if (alt === "") {
    return null;
  }

  return Roles.Img;
}
