import * as Roles from "../roles";
import { Any, Feature } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#tbody-tfoot-thead
 */
export const Tbody: Feature = {
  element: "tbody",
  role: () => Roles.RowGroup,
  allowedRoles: () => Any(Roles)
};
