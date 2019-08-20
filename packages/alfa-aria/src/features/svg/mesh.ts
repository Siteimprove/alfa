import * as Roles from "../../roles";
import { Any, Feature } from "../../types";

/**
 * @see https://www.w3.org/TR/svg-aam/#mapping_role_table
 */
export const Mesh: Feature = {
  element: "mesh",
  /**
   * @todo In certain rare circumstances the role will in this case be img. Investigate.
   */
  allowedRoles: () => Any(Roles)
};
