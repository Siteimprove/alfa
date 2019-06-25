import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see http://www.w3.org/TR/SVG2/struct.html#DescElement
 */
export const Desc: Feature = {
  element: "desc",
  allowedRoles: () => None(Roles)
};
