import { Feature, None } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#dd
 */
export const Dd: Feature = {
  element: "dd",
  role: () => Roles.Definition,
  allowedRoles: () => None
};
