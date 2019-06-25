import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see https://svgwg.org/specs/animations/#AnimateTransformElement
 */
export const AnimateTransform: Feature = {
  element: "animatetransform",
  allowedRoles: () => None(Roles)
};
