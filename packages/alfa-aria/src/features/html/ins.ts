import * as Roles from "../../roles";
import { Any, Feature } from "../../types";

/**
 * @see https://www.w3.org/TR/html-aria/#ins-del
 */
export const Ins: Feature = {
  element: "ins",
  allowedRoles: () => Any(Roles)
};
