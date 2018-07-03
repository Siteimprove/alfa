import * as Roles from "../roles";
import { Any, Feature } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#canvas
 */
export const Canvas: Feature = {
  element: "canvas",
  allowedRoles: () => Any(Roles)
};
