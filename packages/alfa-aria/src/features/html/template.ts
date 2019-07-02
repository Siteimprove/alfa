import * as Attributes from "../../attributes";
import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see https://www.w3.org/TR/html-aria/#template
 */
export const Template: Feature = {
  element: "template",
  allowedRoles: () => None(Roles),
  allowedAttributes: () => None(Attributes)
};
