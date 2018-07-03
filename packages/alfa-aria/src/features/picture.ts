import * as Roles from "../roles";
import { Feature, None } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#picture
 */
export const Picture: Feature = {
  element: "picture",
  allowedRoles: () => None(Roles)
};
