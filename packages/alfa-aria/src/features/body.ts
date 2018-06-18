import { Feature, None } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#body
 */
export const Body: Feature = {
  element: "body",
  role: () => Roles.Document,
  allowedRoles: () => None
};
