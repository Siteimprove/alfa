import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see https://svgwg.org/specs/animations/#DiscardElement
 */
export const Discard: Feature = {
  element: "discard",
  allowedRoles: () => None(Roles)
};
