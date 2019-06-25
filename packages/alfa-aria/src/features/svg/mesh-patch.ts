import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see http://www.w3.org/TR/SVG2/pservers.html#MeshpatchElement
 */
export const MeshPatch: Feature = {
  element: "meshpatch",
  allowedRoles: () => None(Roles)
};
