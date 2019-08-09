import * as Roles from "../../roles";
import { Feature } from "../../types";

/**
 * @see https://www.w3.org/TR/html-aria/#dialog
 */
export const Dialog: Feature = {
  element: "dialog",
  role: () => Roles.Dialog,
  allowedRoles: () => [Roles.AlertDialog]
};
