import { Element, getAttribute, Node } from "@siteimprove/alfa-dom";
import * as Attributes from "../../attributes";
import * as Roles from "../../roles";
import { Any, Except, Feature, Role } from "../../types";

/**
 * @see https://www.w3.org/TR/html-aria/#img
 */
export const Img: Feature = {
  element: "img",
  role,
  allowedRoles: (img, context) =>
    role(img, context) === null
      ? [Roles.None, Roles.Presentation]
      : Except(Roles, [Roles.None, Roles.Presentation]),
  allowedAttributes: (img, context) =>
    role(img, context) === null ? [Attributes.Hidden] : Any(Attributes)
};

function role(img: Element, context: Node): Role | null {
  const alt = getAttribute(img, context, "alt").getOr(null);

  if (alt === "") {
    return null;
  }

  return Roles.Img;
}
