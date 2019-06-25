import * as Roles from "../../roles";
import { Any, Feature } from "../../types";

/**
 * @see http://www.w3.org/TR/SVG2/pservers.html#MeshElement
 */
export const Mesh: Feature = {
  element: "mesh",
  /**
   * @todo In certain rare circumstances the role will in this case be img. Investigate.
   */
  allowedRoles: () => Any(Roles)
};
