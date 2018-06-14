import { Feature, None } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#progress
 */
export const Progress: Feature = {
  element: "progress",
  role: Roles.ProgressBar,
  allowedRoles: None
};
