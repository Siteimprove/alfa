import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see https://www.w3.org/TR/html-aria/#math
 */
export const Math: Feature = {
  element: "math",
  role: () => Roles.Math,
  allowedRoles: () => None(Roles)
};
