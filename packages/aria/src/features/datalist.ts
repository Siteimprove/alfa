import { Feature, NoRole } from "../types";
import * as Roles from "../roles";
/**
 * @see https://www.w3.org/TR/html-aria/#datalist
 */
export const Datalist: Feature = {
  element: "datalist",
  role: Roles.ListBox,
  allowedRoles: NoRole
};
