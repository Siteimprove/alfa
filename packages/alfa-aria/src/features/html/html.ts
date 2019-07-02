import * as Attributes from "../../attributes";
import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see https://www.w3.org/TR/html-aria/#html
 */
export const Html: Feature = {
  element: "html",
  allowedRoles: () => None(Roles),
  allowedAttributes: () => None(Attributes)
};
