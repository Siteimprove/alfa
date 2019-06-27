import * as Roles from "../../roles";
import { Feature } from "../../types";

/**
 * @see https://www.w3.org/TR/svg-aam/#mapping_role_table
 */
export const Video: Feature = {
  element: "video",
  allowedRoles: () => [Roles.Application]
};
