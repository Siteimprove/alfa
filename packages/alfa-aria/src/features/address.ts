import { Any, Feature } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#address
 */
export const Address: Feature = {
  element: "address",
  allowedRoles: () => Any(Roles)
};
