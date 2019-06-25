import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see http://www.w3.org/TR/html5/embedded-content-0.html#the-source-element
 */
export const Source: Feature = {
  element: "source",
  allowedRoles: () => None(Roles)
};
