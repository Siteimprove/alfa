import * as Roles from "../../roles";
import { Any, Feature } from "../../types";

/**
 * @see https://www.w3.org/TR/svg-aam/#mapping_role_table
 */
export const Canvas: Feature = {
  element: "canvas",
  allowedRoles: () => Any(Roles)
};
