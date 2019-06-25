import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see http://www.w3.org/TR/SVG2/struct.html#MetadataElement
 */
export const Metadata: Feature = {
  element: "metadata",
  allowedRoles: () => None(Roles)
};
