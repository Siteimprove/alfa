import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see https://www.w3.org/TR/html-aria/#textarea
 */
export const Textarea: Feature = {
  element: "textarea",
  role: () => Roles.TextBox,
  allowedRoles: () => None(Roles)
};
