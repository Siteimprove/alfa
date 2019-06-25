import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see http://www.w3.org/TR/SVG2/struct.html#TitleElement
 */
export const Title: Feature = {
  element: "title",
  allowedRoles: () => None(Roles)
};
