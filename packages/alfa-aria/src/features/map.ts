import * as Attributes from "../attributes";
import * as Roles from "../roles";
import { Feature, None } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#map
 */
export const Map: Feature = {
  element: "map",
  allowedRoles: () => None(Roles),
  allowedAttributes: () => None(Attributes)
};
