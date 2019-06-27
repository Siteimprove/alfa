import * as Roles from "../../roles";
import { Any, Feature } from "../../types";

/**
 * @see https://www.w3.org/TR/svg-aam/#mapping_role_table
 */
export const Image: Feature = {
  element: "image",
  /**
   * @todo In certain rare circumstances the role will in this case be group. Investigate.
   */
  allowedRoles: () => Any(Roles)
};
