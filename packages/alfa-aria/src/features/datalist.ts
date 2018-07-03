import * as Roles from "../roles";
import { Feature, None } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#datalist
 */
export const Datalist: Feature = {
  element: "datalist",
  role: () => Roles.ListBox,
  allowedRoles: () => None
};
