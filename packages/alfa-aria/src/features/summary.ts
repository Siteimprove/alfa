import { Feature } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#summary
 */
export const Summary: Feature = {
  element: "summary",
  role: Roles.Button,
  allowedRoles: [Roles.Button]
};
