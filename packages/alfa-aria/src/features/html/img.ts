import { Element, getAttribute } from "@siteimprove/alfa-dom";
import * as Attributes from "../../attributes";
import * as Roles from "../../roles";
import { Any, Except, Feature, Role } from "../../types";

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
