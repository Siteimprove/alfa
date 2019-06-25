import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see http://www.w3.org/TR/SVG2/pservers.html#MeshrowElement
 */
export const MeshRow: Feature = {
  element: "meshrow",
  allowedRoles: () => None(Roles)
};
