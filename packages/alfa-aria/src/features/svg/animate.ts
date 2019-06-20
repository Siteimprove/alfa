import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see https://svgwg.org/specs/animations/#AnimateElement
 */
export const Animate: Feature = {
  element: "animate",
  allowedRoles: () => None(Roles)
};
