import { Feature, None } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#math
 */
export const Math: Feature = {
  element: "math",
  role: Roles.Math,
  allowedRoles: None
};
