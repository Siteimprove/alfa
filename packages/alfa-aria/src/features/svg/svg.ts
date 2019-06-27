import * as Roles from "../../roles";
import { Any, Feature } from "../../types";

/**
 * @see https://www.w3.org/TR/svg-aam/#mapping_role_table
 */
export const Svg: Feature = {
  element: "svg",
  role: () => Roles.GraphicsDocument,
  allowedRoles: () => Any(Roles)
};
