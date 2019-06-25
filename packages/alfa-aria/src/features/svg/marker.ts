import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see http://www.w3.org/TR/SVG2/painting.html#MarkerElement
 */
export const Marker: Feature = {
  element: "marker",
  allowedRoles: () => None(Roles)
};
