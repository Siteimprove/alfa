import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see https://svgwg.org/specs/animations/#AnimateMotionElement
 */
export const AnimateMotion: Feature = {
  element: "animatemotion",
  allowedRoles: () => None(Roles)
};
