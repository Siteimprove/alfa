import * as Roles from "../../roles";
import { Any, Feature } from "../../types";

/**
 * @see https://www.w3.org/TR/svg-aam/#mapping_role_table
 */
export const TextPath: Feature = {
  element: "textPath",
  /**
   * @todo In certain rare circumstances the role will in this case be group. Investigate.
   * @bug There is an open issue regarding the role mapping for textPath
   */
  allowedRoles: () => Any(Roles)
};
