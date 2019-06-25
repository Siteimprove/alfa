import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see http://www.w3.org/TR/SVG2/linking.html#ViewElement
 */
export const View: Feature = {
  element: "view",
  allowedRoles: () => None(Roles)
};
