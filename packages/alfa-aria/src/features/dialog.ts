import { Feature } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#dialog
 */
export const Dialog: Feature = {
  element: "dialog",
  role: Roles.Dialog,
  allowedRoles: [Roles.AlertDialog]
};
