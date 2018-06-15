import { Feature, Any } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#canvas
 */
export const Canvas: Feature = {
  element: "canvas",
  allowedRoles: Any(Roles)
};
