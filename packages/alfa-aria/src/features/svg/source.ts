import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see https://www.w3.org/TR/svg-aam/#mapping_role_table
 */
export const Source: Feature = {
  element: "source",
  allowedRoles: () => None(Roles)
};
