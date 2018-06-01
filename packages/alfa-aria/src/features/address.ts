import { AnyRole, Feature } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#address
 */
export const Address: Feature = {
  element: "address",
  allowedRoles: AnyRole
};
