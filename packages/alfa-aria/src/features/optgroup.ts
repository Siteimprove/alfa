import * as Roles from "../roles";
import { Feature, None } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#optgroup
 */
export const OptGroup: Feature = {
  element: "optgroup",
  role: () => Roles.Group,
  allowedRoles: () => None(Roles)
};
