import * as Roles from "../roles";
import { Feature, None } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#body
 */
export const Body: Feature = {
  element: "body",
  role: () => Roles.Document,
  allowedRoles: () => None
};
