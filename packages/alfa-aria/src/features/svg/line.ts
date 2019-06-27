import * as Roles from "../../roles";
import { Any, Feature } from "../../types";

/**
 * @see https://www.w3.org/TR/svg-aam/#mapping_role_table
 */
export const Line: Feature = {
  element: "line",
  /**
   * @todo In certain rare circumstances the role will in this case be graphics-symbol. Investigate.
   */
  allowedRoles: () => Any(Roles)
};
