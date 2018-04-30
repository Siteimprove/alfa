import { Feature, Any } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#tfoot
 */
export const TFoot: Feature = {
  element: "tfoot",
  role: Roles.RowGroup,
  allowedRoles: Any
};
