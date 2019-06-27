import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see https://www.w3.org/TR/html-aria/#legend
 */
export const Legend: Feature = {
  element: "legend",
  allowedRoles: () => None(Roles)
};
