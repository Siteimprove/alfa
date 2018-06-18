import { Feature, Any } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#ins-del
 */
export const Ins: Feature = {
  element: "ins",
  allowedRoles: () => Any(Roles)
};
