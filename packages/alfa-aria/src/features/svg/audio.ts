import * as Roles from "../../roles";
import { Feature } from "../../types";

/**
 * @see https://www.w3.org/TR/svg-aam/#mapping_role_table
 */
export const Audio: Feature = {
  element: "audio",
  allowedRoles: () => [Roles.Application]
};
