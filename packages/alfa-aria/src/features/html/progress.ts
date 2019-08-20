import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see https://www.w3.org/TR/html-aria/#progress
 */
export const Progress: Feature = {
  element: "progress",
  role: () => Roles.ProgressBar,
  allowedRoles: () => None(Roles)
};
